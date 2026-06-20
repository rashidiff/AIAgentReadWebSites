from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent

INPUT_LOG_DIRS = {
    "ai": SCRIPT_DIR / "log-ai-gemini-2.5-flash" / "terminal_logs",
    "baseline": SCRIPT_DIR / "log-baseline-gemini-2.5-flash" / "terminal_logs",
}

OUTPUT_DIR = SCRIPT_DIR / "terminal_logs_by_task"

START_RE = re.compile(
    r"Starting isolated (?P<site>AI-friendly|Classic-site) server for "
    r"(?P<task>Task\d+) \| run: (?P<run>\d+)/(?P<total>\d+)"
)


def is_separator(line: str) -> bool:
    stripped = line.strip()
    return bool(stripped) and set(stripped) == {"="}


def split_terminal_log(category: str, log_path: Path) -> list[dict[str, object]]:
    lines = log_path.read_text(encoding="utf-8", errors="replace").splitlines(keepends=True)

    starts: list[dict[str, object]] = []
    for index, line in enumerate(lines):
        match = START_RE.search(line)
        if not match:
            continue

        begin = index
        if index > 0 and is_separator(lines[index - 1]):
            begin = index - 1

        starts.append(
            {
                "begin": begin,
                "line_index": index,
                "task": match.group("task"),
                "run": int(match.group("run")),
                "total": int(match.group("total")),
                "site": match.group("site"),
            }
        )

    chunks: list[dict[str, object]] = []
    for pos, start in enumerate(starts):
        begin = int(start["begin"])
        end = int(starts[pos + 1]["begin"]) if pos + 1 < len(starts) else len(lines)
        chunk_text = "".join(lines[begin:end]).rstrip() + "\n"

        task = str(start["task"])
        run = int(start["run"])
        total = int(start["total"])
        site = str(start["site"])

        chunks.append(
            {
                "category": category,
                "source": log_path,
                "task": task,
                "run": run,
                "total": total,
                "site": site,
                "text": chunk_text,
            }
        )

    return chunks


def write_outputs(category: str, chunks: list[dict[str, object]]) -> None:
    by_task: dict[str, list[dict[str, object]]] = defaultdict(list)
    for chunk in chunks:
        by_task[str(chunk["task"])].append(chunk)

    for task, task_chunks in sorted(by_task.items()):
        task_chunks.sort(key=lambda item: int(item["run"]))

        task_dir = OUTPUT_DIR / category
        task_dir.mkdir(parents=True, exist_ok=True)
        expected_total = int(task_chunks[0]["total"]) if task_chunks else 0
        task_index = task.removeprefix("Task")
        task_path = task_dir / f"Task_{task_index}_{category}.log"

        combined_parts = []
        for chunk in task_chunks:
            combined_parts.append(
                f"# {'=' * 70}\n"
                f"# {category} | {task} | run {chunk['run']}/{chunk['total']} | source: {chunk['source']}\n"
                f"# {'=' * 70}\n"
                f"{chunk['text']}"
            )
        task_path.write_text("\n".join(combined_parts), encoding="utf-8")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    grand_total = 0
    for category, log_dir in INPUT_LOG_DIRS.items():
        if not log_dir.exists():
            print(f"[WARN] Missing terminal log directory: {log_dir}")
            continue

        log_files = sorted(log_dir.glob("*.log"))
        if not log_files:
            print(f"[WARN] No .log files found in: {log_dir}")
            continue

        category_chunks: list[dict[str, object]] = []
        for log_path in log_files:
            chunks = split_terminal_log(category, log_path)
            category_chunks.extend(chunks)
            print(f"[OK] {category}: {log_path.name} -> {len(chunks)} run chunks")

        write_outputs(category, category_chunks)
        grand_total += len(category_chunks)

        counts: dict[str, int] = defaultdict(int)
        for chunk in category_chunks:
            counts[str(chunk["task"])] += 1

        for task, count in sorted(counts.items()):
            status = "OK" if count == 10 else "CHECK"
            print(f"[{status}] {category}: {task} -> {count} runs")

    print(f"[DONE] Wrote split logs to: {OUTPUT_DIR}")
    print(f"[DONE] Total run chunks: {grand_total}")


if __name__ == "__main__":
    main()
