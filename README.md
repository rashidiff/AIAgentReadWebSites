# Designing Agent-Ready Websites for AI Web Agents

### A Framework for Machine Readability, Actionability, and Decision Reliability

**Accepted at ICEME 2026**

**Authors:** Said Elnaffar · Farzad Rashidi

---

## Overview

This repository contains all code, assets, and experimental data for the paper above. The study investigates whether structuring a website to be *agent-friendly* — through semantic HTML, structured JSON data, and machine-readable navigation — measurably improves the performance of AI web agents on real shopping tasks.

Full quantitative results are available in **[RESULTS.md](RESULTS.md)**.

We built two versions of the same e-commerce website:

- **AI Friendly** — designed with agent readability in mind (semantic markup, `robots.txt`, `sitemap.xml`, structured product data)
- **Classic site** — a conventional website with no agent-specific design

Three state-of-the-art LLMs were then evaluated as web agents on both sites across 5 tasks × 10 runs each, using [browser-use](https://github.com/browser-use/browser-use) as the agent execution framework.

---

## Repository Structure

```
├── AI Friendly/          # Agent-optimized website
│   ├── index.html
│   ├── pages/            # product, cart, checkout, FAQ, reviews, evidence
│   ├── data/             # product JSON files and site profile
│   ├── assets/           # CSS and JS
│   ├── robots.txt
│   └── sitemap.xml
│
├── Classic site/         # Conventional baseline website
│   ├── index.html
│   ├── pages/
│   └── assets/
│
├── Tasks/                # Task1.txt – Task5.txt  (agent task prompts)
│
├── Experiment Log/
│   ├── Gemini/           # Gemini 2.5 Flash scripts and logs (via OpenRouter)
│   ├── Grok/             # Grok 4 Fast scripts and logs (via OpenRouter)
│   └── OpenAI/           # GPT-4.1 scripts and logs (via OpenAI API)
│
└── FullJudgment/         # Per-task LLM-judge evaluation results
    ├── GPT-4.1/
    ├── Gemini-Flash/
    └── Grok-4-Fast/
```

---

## Setup

### Requirements

- Python 3.11 or later
- An API key for the model(s) you want to run (see step 3)

### 1. Create a virtual environment

```bash
python -m venv .venv
```

```bash
# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Install the browser

```bash
playwright install chromium
```

> This is a one-time download of the Chromium binary used by the agent. It is separate from the pip packages.

### 4. Configure API keys

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=sk-or-...   # for Gemini and Grok scripts
OPENAI_API_KEY=sk-...          # for GPT-4.1 scripts
```

| Model | Provider | Required key |
|---|---|---|
| Gemini 2.5 Flash | OpenRouter | `OPENROUTER_API_KEY` |
| Grok 4 Fast | OpenRouter | `OPENROUTER_API_KEY` |
| GPT-4.1 | OpenAI | `OPENAI_API_KEY` |

---

## Running the Experiments

All scripts must be run from the **project root**. Each script automatically runs all 5 tasks × 10 repetitions and manages the local server and browser lifecycle.

**Gemini 2.5 Flash**
```bash
python "Experiment Log/Gemini/run_gemini_ai_friendly.py"
python "Experiment Log/Gemini/run_gemini_classic.py"
```

**Grok 4 Fast**
```bash
python "Experiment Log/Grok/run_openrouter_grok_ai_friendly.py"
python "Experiment Log/Grok/run_openrouter_grok_classic.py"
```

**GPT-4.1**
```bash
python "Experiment Log/OpenAI/run_openai_ai_friendly.py"
python "Experiment Log/OpenAI/run_openai_classic.py"
```

For each run the script:
1. Starts a local HTTP server on port 3000 serving the target website
2. Launches the agent with a task prompt (up to 30 steps)
3. Saves a full conversation log (`.json`), a screen recording (`.gif`), and a token usage report
4. Shuts down the server before the next run

Output is saved to `Experiment Log/<Provider>/log-<ai|baseline>-<model>/Task<N>/`.

---

## License

This repository is licensed under [CC BY 4.0](LICENSE). Any use of this work — including code, data, or results — must credit the authors and cite the paper.
