# Agent-Ready Websites — Experiment Setup Guide

This repository contains two websites (AI Friendly and Classic site), experiment runner scripts, task definitions, and evaluation logs for benchmarking web-browsing AI agents across multiple LLMs.

---

## Repository Structure

```
├── AI Friendly/          # AI-optimized website (semantic HTML, structured data)
├── Classic site/         # Traditional website (baseline)
├── Tasks/                # Task1.txt – Task5.txt  (agent instructions)
├── Experiment Log/
│   ├── Gemini/           # Scripts for Gemini 2.5 Flash via OpenRouter
│   ├── Grok/             # Scripts for Grok 4 Fast via OpenRouter
│   └── OpenAI/           # Scripts for GPT-4.1 via OpenAI API
└── FullJudgment/         # LLM-judge evaluation results (markdown)
```

---

## Prerequisites

- Python 3.11 or later
- A terminal (PowerShell on Windows, bash on macOS/Linux)

---

## 1. Create an Isolated Python Environment

```bash
# From the project root
python -m venv .venv

# Activate — Windows
.venv\Scripts\activate

# Activate — macOS / Linux
source .venv/bin/activate
```

---

## 2. Install Dependencies

```bash
pip install browser-use python-dotenv loguru openai playwright
```

After installing, download the Chromium browser that Playwright controls:

```bash
playwright install chromium
```

> `browser-use` orchestrates the agent loop.  
> `playwright` drives the actual browser window.  
> `loguru` + `python-dotenv` + `openai` are supporting libraries.

---

## 3. Create the `.env` File

Create a file named `.env` in the **project root** (same level as `AI Friendly/` and `Classic site/`):

```
# Required for Gemini and Grok scripts (routed through OpenRouter)
OPENROUTER_API_KEY=sk-or-...

# Required for OpenAI scripts (direct OpenAI API)
OPENAI_API_KEY=sk-...
```

You only need the key(s) for the model(s) you intend to run:

| Script set | API key needed |
|------------|----------------|
| `Experiment Log/Gemini/` | `OPENROUTER_API_KEY` |
| `Experiment Log/Grok/`   | `OPENROUTER_API_KEY` |
| `Experiment Log/OpenAI/` | `OPENAI_API_KEY`     |

---

## 4. Run the Experiment Scripts

Each script runs **all 5 tasks × 10 repetitions** automatically. The browser window opens visibly (non-headless) for each run.

### Gemini 2.5 Flash

Run from the **project root**:

```bash
# AI Friendly site
python "Experiment Log/Gemini/run_gemini_ai_friendly.py"

# Classic (baseline) site
python "Experiment Log/Gemini/run_gemini_classic.py"
```

### Grok 4 Fast (via OpenRouter)

Run from the **project root**:

```bash
# AI Friendly site
python "Experiment Log/Grok/run_openrouter_grok_ai_friendly.py"

# Classic (baseline) site
python "Experiment Log/Grok/run_openrouter_grok_classic.py"
```

### GPT-4.1 (via OpenAI)

Run from the **project root**:

```bash
# AI Friendly site
python "Experiment Log/OpenAI/run_openai_ai_friendly.py"

# Classic (baseline) site
python "Experiment Log/OpenAI/run_openai_classic.py"
```

---

## 5. What Each Script Does

1. Reads task instructions from `Tasks/Task1.txt` through `Tasks/Task5.txt`.
2. For each task and each of 10 runs:
   - Starts a local HTTP server on port 3000 (serving the target website).
   - Launches a `browser-use` agent with the chosen LLM.
   - Lets the agent navigate the site for up to 30 steps.
   - Saves a conversation log (`.json`), a screen recording (`.gif`), and a token-usage report (`_usage.json`).
   - Shuts down the local server before the next run.
3. Writes a live terminal log to `terminal_logs/terminal_<timestamp>.log` inside the model's log directory.

---

## 6. Output Files

For each model/site combination, logs are saved under `Experiment Log/<Provider>/log-<ai|baseline>-<model>/`:

```
log-ai-gemini-2.5-flash/
└── Task1/
    ├── run_1.json            # Full agent conversation
    ├── run_1.gif             # Browser screen recording
    ├── run_1_usage.json      # Token cost and settings
    └── terminal_logs/
        └── terminal_<ts>.log # Live stdout/stderr capture
```

---

## 7. (Optional) Split Terminal Logs by Task

After a Gemini run, you can split the combined terminal log into per-task files:

```bash
python "Experiment Log/Gemini/split_terminal_logs.py"
```

Output goes to `Experiment Log/Gemini/terminal_logs_by_task/`.

---

## Notes

- Port 3000 must be free when running scripts. On Windows, the scripts automatically kill any process holding that port before each run.
- The browser runs in **headed mode** (visible window) by default. Do not close the browser window manually during a run.
- All models are called with `temperature=0` and `top_p=1` for reproducibility.
