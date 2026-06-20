# Agent-Ready Websites — Experiment Setup Guide

This repository contains the code, datasets, and experiment logs accompanying the paper:

> **Designing Agent-Ready Websites for AI Web Agents: A Framework for Machine Readability, Actionability, and Decision Reliability**
> Accepted at **ICEME 2026**

The repository includes two websites (AI Friendly and Classic site), experiment runner scripts, task definitions, and evaluation logs for benchmarking web-browsing AI agents across multiple LLMs.

---

## Repository Structure

```
├── AI Friendly/          # AI-optimized website (semantic HTML, structured data)
├── Classic site/         # Traditional website (baseline)
├── Tasks/                # Task1.txt – Task5.txt (agent task instructions)
├── Experiment Log/
│   ├── Gemini/           # Scripts for Gemini 2.5 Flash via OpenRouter
│   ├── Grok/             # Scripts for Grok 4 Fast via OpenRouter
│   └── OpenAI/           # Scripts for GPT-4.1 via OpenAI direct API
└── FullJudgment/         # LLM-judge evaluation results (markdown)
```

---

## Prerequisites

- Python **3.11 or later**

---

## 1. Create an Isolated Virtual Environment

```bash
# From the project root
python -m venv .venv

# Activate — Windows (PowerShell)
.venv\Scripts\activate

# Activate — macOS / Linux
source .venv/bin/activate
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

Then install the Chromium browser binary that Playwright uses (this is a one-time download, not a pip package):

```bash
playwright install chromium
```

---

## 3. Create the `.env` File

Create a file named `.env` in the **project root** (same folder as `AI Friendly/` and `Classic site/`):

```env
# Needed for Gemini and Grok scripts (both go through OpenRouter)
OPENROUTER_API_KEY=sk-or-...

# Needed for OpenAI scripts (direct OpenAI API)
OPENAI_API_KEY=sk-...
```

You only need the key(s) for the model(s) you want to run:

| Script folder              | Required key          |
|----------------------------|-----------------------|
| `Experiment Log/Gemini/`   | `OPENROUTER_API_KEY`  |
| `Experiment Log/Grok/`     | `OPENROUTER_API_KEY`  |
| `Experiment Log/OpenAI/`   | `OPENAI_API_KEY`      |

---

## 4. Run the Scripts

All scripts must be run from the **project root** (the folder that contains `AI Friendly/` and `Tasks/`).  
Each script runs all 5 tasks × 10 repetitions automatically and opens a visible browser window per run.

### Gemini 2.5 Flash — via OpenRouter

```bash
python "Experiment Log/Gemini/run_gemini_ai_friendly.py"
python "Experiment Log/Gemini/run_gemini_classic.py"
```

### Grok 4 Fast — via OpenRouter

```bash
python "Experiment Log/Grok/run_openrouter_grok_ai_friendly.py"
python "Experiment Log/Grok/run_openrouter_grok_classic.py"
```

### GPT-4.1 — via OpenAI

```bash
python "Experiment Log/OpenAI/run_openai_ai_friendly.py"
python "Experiment Log/OpenAI/run_openai_classic.py"
```

---

## 5. What Happens During a Run

For each task and each repetition the script:

1. Starts a local HTTP server on port **3000** serving the target website.
2. Launches a `browser-use` agent pointed at `http://127.0.0.1:3000/`.
3. Lets the agent navigate for up to **30 steps**.
4. Saves results to the model's log folder inside `Experiment Log/`.
5. Shuts the server down before the next run.

---

## 6. Output Files

Results are saved under `Experiment Log/<Provider>/log-<ai|baseline>-<model>/`:

```
log-ai-gemini-2.5-flash/
└── Task1/
    ├── run_1.json           # Full agent conversation
    ├── run_1.gif            # Browser screen recording
    └── run_1_usage.json     # Token usage and run settings
```

A live terminal log is also written to `terminal_logs/terminal_<timestamp>.log` inside the same log folder.

---

## Notes

- **Port 3000 must be free.** On Windows the scripts automatically kill any process holding that port before each run.
- **Do not close the browser window** manually during a run — the script manages it.
- All models run with `temperature=0` and `top_p=1` for reproducibility.

---

## Agent Framework

Experiments were conducted using [browser-use](https://github.com/browser-use/browser-use), an open-source web browsing agent framework.

---

## Contributors

- **Said Elnaffar**
- **Farzad**
