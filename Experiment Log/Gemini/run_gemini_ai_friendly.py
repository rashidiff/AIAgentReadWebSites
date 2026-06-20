from browser_use import Agent, Browser
from browser_use.llm import ChatOpenAI
from dotenv import load_dotenv
import asyncio
import os
import sys
import logging
from pathlib import Path
import json
import tempfile
import shutil
import subprocess
import time
import urllib.request
from datetime import datetime

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")

SERVER_PORT = 3000
AI_FRIENDLY_SITE_DIR = PROJECT_ROOT / "AI Friendly"
SERVER_URL = f"http://127.0.0.1:{SERVER_PORT}/"
MODEL_NAME = "gemini-2.5-flash"
LOG_BASE_DIR = SCRIPT_DIR / "log-ai-gemini-2.5-flash"


class TeeStream:
    def __init__(self, *streams):
        self.streams = streams

    def write(self, data):
        for stream in self.streams:
            stream.write(data)
            stream.flush()
        return len(data)

    def flush(self):
        for stream in self.streams:
            stream.flush()


def setup_terminal_log(log_base_dir: Path):
    log_base_dir.mkdir(parents=True, exist_ok=True)
    terminal_log_dir = log_base_dir / "terminal_logs"
    terminal_log_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    terminal_log_path = terminal_log_dir / f"terminal_{ts}.log"
    log_file = open(terminal_log_path, "w", encoding="utf-8", buffering=1)

    original_stdout = sys.stdout
    original_stderr = sys.stderr
    sys.stdout = TeeStream(original_stdout, log_file)
    sys.stderr = TeeStream(original_stderr, log_file)
    return log_file, terminal_log_path, original_stdout, original_stderr


def setup_python_loggers(log_file):
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    file_handler = logging.StreamHandler(log_file)
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    )
    root_logger.addHandler(file_handler)

    known_loggers = [
        "browser_use",
        "playwright",
        "openai",
        "httpx",
        "httpcore",
    ]
    for logger_name in known_loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.INFO)
        logger.propagate = True

    try:
        from loguru import logger as loguru_logger  # type: ignore

        sink_id = loguru_logger.add(
            log_file,
            level="INFO",
            enqueue=False,
            backtrace=False,
            diagnose=False,
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{function}:{line} | {message}",
        )
    except Exception:
        sink_id = None

    return file_handler, sink_id


def wait_for_server(url: str, timeout_seconds: float = 15.0) -> None:
    deadline = time.time() + timeout_seconds
    last_error = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                if 200 <= resp.status < 500:
                    return
        except Exception as exc:
            last_error = exc
        time.sleep(0.25)
    raise RuntimeError(f"Server did not become ready at {url}. Last error: {last_error}")


def kill_listeners_on_port(port: int) -> None:
    """Ensure no stale process is holding the port before we start our server."""
    if os.name != "nt":
        return
    try:
        result = subprocess.run(
            ["netstat", "-ano", "-p", "tcp"],
            check=False,
            capture_output=True,
            text=True,
        )
        pids: set[int] = set()
        token = f":{port}"
        for line in result.stdout.splitlines():
            if token not in line or "LISTENING" not in line.upper():
                continue
            parts = line.split()
            if len(parts) < 5:
                continue
            pid_text = parts[-1]
            if pid_text.isdigit():
                pids.add(int(pid_text))
        for pid in pids:
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/T", "/F"],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
    except Exception:
        pass


def start_ai_friendly_server() -> subprocess.Popen:
    if not AI_FRIENDLY_SITE_DIR.exists():
        raise RuntimeError(f"Missing site directory: {AI_FRIENDLY_SITE_DIR}")

    kill_listeners_on_port(SERVER_PORT)

    process = subprocess.Popen(
        ["python", "-m", "http.server", str(SERVER_PORT)],
        cwd=str(AI_FRIENDLY_SITE_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0),
    )
    time.sleep(0.15)
    if process.poll() is not None:
        raise RuntimeError(
            f"AI-friendly server process exited immediately (likely port conflict): {AI_FRIENDLY_SITE_DIR}"
        )
    try:
        wait_for_server(SERVER_URL, timeout_seconds=15.0)
    except Exception:
        stop_process_tree(process)
        raise
    return process


def stop_process_tree(process: subprocess.Popen) -> None:
    if process.poll() is not None:
        return
    try:
        if os.name == "nt":
            subprocess.run(
                ["taskkill", "/PID", str(process.pid), "/T", "/F"],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            process.terminate()
            process.wait(timeout=5)
    except Exception:
        try:
            process.kill()
        except Exception:
            pass


async def run_task(task_content, task_name, run_number):
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")

    if not openrouter_api_key:
        raise RuntimeError(
            "API key not found. Please set OPENROUTER_API_KEY in your .env file."
        )

    log_dir = LOG_BASE_DIR / task_name
    log_dir.mkdir(parents=True, exist_ok=True)
    isolated_profile_dir = tempfile.mkdtemp(prefix=f"browser-use-{task_name}-run{run_number}-")

    llm = ChatOpenAI(
        model=MODEL_NAME,
        api_key=openrouter_api_key,
        base_url="https://openrouter.ai/api/v1",
        temperature=0,
        top_p=1,
        default_headers={
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Agent-ready website experiment",
        },
    )

    browser = Browser(
        headless=False,
        window_size={"width": 1280, "height": 900},
        user_data_dir=isolated_profile_dir,
        keep_alive=False,
    )

    agent = Agent(
        task=task_content,
        llm=llm,
        browser=browser,
        use_vision=False,
        save_conversation_path=str(log_dir / f"run_{run_number}.json"),
        generate_gif=str(log_dir / f"run_{run_number}.gif"),
        calculate_cost=True,
        max_failures=3,
    )

    try:
        history = await agent.run(max_steps=30)
        usage = history.usage.model_dump() if history.usage else None
        usage_report = {
            "task": task_name,
            "run": run_number,
            "status": "success",
            "model": MODEL_NAME,
            "settings": {
                "temperature": 0,
                "top_p": 1,
                "base_url": "https://openrouter.ai/api/v1",
                "default_headers": {
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Agent-ready website experiment",
                },
                "max_agent_steps": 30,
                "max_failures": 3,
                "browser_size": {"width": 1280, "height": 900},
            },
            "usage": usage,
        }
        usage_path = log_dir / f"run_{run_number}_usage.json"
        usage_path.write_text(
            json.dumps(usage_report, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except Exception as e:
        error_path = log_dir / f"run_{run_number}_error.txt"
        with open(error_path, "w", encoding="utf-8") as f:
            f.write(str(e))
        usage_report = {
            "task": task_name,
            "run": run_number,
            "status": "failed",
            "model": MODEL_NAME,
            "settings": {
                "temperature": 0,
                "top_p": 1,
                "base_url": "https://openrouter.ai/api/v1",
                "default_headers": {
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Agent-ready website experiment",
                },
                "max_agent_steps": 30,
                "max_failures": 3,
                "browser_size": {"width": 1280, "height": 900},
            },
            "usage": None,
            "error": str(e),
        }
        usage_path = log_dir / f"run_{run_number}_usage.json"
        usage_path.write_text(
            json.dumps(usage_report, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    finally:
        try:
            await browser.close()
        except Exception:
            pass
        shutil.rmtree(isolated_profile_dir, ignore_errors=True)


async def main():
    log_file, terminal_log_path, original_stdout, original_stderr = setup_terminal_log(LOG_BASE_DIR)
    file_handler, loguru_sink_id = setup_python_loggers(log_file)
    print(f"Terminal live log file: {terminal_log_path}")
    tasks = ["Task1", "Task2", "Task3", "Task4", "Task5"]

    try:
        for task_name in tasks:
            task_file = PROJECT_ROOT / f"{task_name}.txt"

            if not task_file.exists():
                continue

            task_content = task_file.read_text(encoding="utf-8")
            for run in range(1, 11):
                server_process = None
                try:
                    print("=" * 70)
                    print(f"Starting isolated AI-friendly server for {task_name} | run: {run}/10 on {SERVER_URL}")
                    print("=" * 70)
                    server_process = start_ai_friendly_server()

                    print("=" * 70)
                    print(f"Starting task: {task_name} | run: {run}/10")
                    print("=" * 70)
                    await run_task(task_content, task_name, run)
                finally:
                    if server_process is not None:
                        print("=" * 70)
                        print(f"Stopping isolated AI-friendly server for {task_name} | run: {run}/10")
                        print("=" * 70)
                        stop_process_tree(server_process)
    finally:
        root_logger = logging.getLogger()
        try:
            root_logger.removeHandler(file_handler)
        except Exception:
            pass
        try:
            file_handler.close()
        except Exception:
            pass
        if loguru_sink_id is not None:
            try:
                from loguru import logger as loguru_logger  # type: ignore

                loguru_logger.remove(loguru_sink_id)
            except Exception:
                pass
        sys.stdout = original_stdout
        sys.stderr = original_stderr
        log_file.close()


if __name__ == "__main__":
    asyncio.run(main())
