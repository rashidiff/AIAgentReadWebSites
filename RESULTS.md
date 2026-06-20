# Results

---

## Table 1 — Model-level task outcomes across website variants

| Model | Website | PASS | PARTIAL | FAIL | Strict success | Functional success |
|---|---|:---:|:---:|:---:|:---:|:---:|
| GPT-4.1 | Agent-ready | 43 | 0 | 7 | 86% | 86% |
| GPT-4.1 | Baseline | 16 | 18 | 16 | 32% | 68% |
| Gemini 2.5 Flash | Agent-ready | 44 | 2 | 4 | 88% | 92% |
| Gemini 2.5 Flash | Baseline | 26 | 11 | 13 | 52% | 74% |
| Grok-4 Fast | Agent-ready | 47 | 1 | 2 | 94% | 96% |
| Grok-4 Fast | Baseline | 32 | 14 | 4 | 64% | 92% |
| **Total** | **Agent-ready** | **134** | **3** | **13** | **89.3%** | **91.3%** |
| **Total** | **Baseline** | **74** | **43** | **33** | **49.3%** | **78.0%** |

---

## Table 2 — Task-level PASS-rate comparison

| Task | Task type | Baseline | Agent-ready | Difference |
|---|---|:---:|:---:|:---:|
| Task 1 | Inventory-aware cart execution | 73.3% | 96.7% | **+23.4 pp** |
| Task 2 | Product-detail extraction | 23.3% | 100% | **+76.7 pp** |
| Task 3 | Comparative product recommendation | 16.7% | 93.3% | **+76.6 pp** |
| Task 4 | Multi-constraint product selection | 60.0% | 76.7% | **+16.7 pp** |
| Task 5 | Store-policy / temporal decision | 73.3% | 80.0% | **+6.7 pp** |

---

## Table 3 — Full task-level outcomes and diagnostic details

| Task | Website | PASS | PARTIAL | FAIL | PASS rate | Dominant issue when not PASS |
|---|---|:---:|:---:|:---:|:---:|---|
| Task 1 | Agent-ready | 29 | 0 | 1 | 96.7% | One runtime/output-format failure; otherwise cart execution was stable. |
| Task 1 | Baseline | 22 | 0 | 8 | 73.3% | Wrong availability assessment or wrong item selection in GPT-4.1 runs; some cart-state errors. |
| Task 2 | Agent-ready | 30 | 0 | 0 | 100% | No failures across the three models. |
| Task 2 | Baseline | 7 | 21 | 2 | 23.3% | Target item was often found but required fields were incomplete or missing. |
| Task 3 | Agent-ready | 28 | 2 | 0 | 93.3% | Minor missing evidence or limitation reporting; final comparison usually correct. |
| Task 3 | Baseline | 5 | 12 | 13 | 16.7% | Missing item attributes, wrong verdicts, and incomplete comparison evidence. |
| Task 4 | Agent-ready | 23 | 0 | 7 | 76.7% | Wrong item selection, incorrect value extraction, max-step failure, or constraint error. |
| Task 4 | Baseline | 18 | 2 | 10 | 60.0% | Missed qualifying fields, wrong item selection, loop/stagnation, or max-step exhaustion. |
| Task 5 | Agent-ready | 24 | 1 | 5 | 80.0% | Policy information was usually found but the final verdict was sometimes wrong. |
| Task 5 | Baseline | 22 | 8 | 0 | 73.3% | Policy pages were usually found but interpretation of conditions was often incomplete. |

---

## Table 4 — Average step count by model

| Model | Agent-ready | Baseline | Difference | Reduction |
|---|:---:|:---:|:---:|:---:|
| GPT-4.1 | 3.70 | 5.96 | 2.26 | 37.9% |
| Gemini 2.5 Flash | 11.56 | 15.02 | 3.46 | 23.0% |
| Grok-4 Fast | 4.20 | 6.96 | 2.76 | 39.7% |
| **Overall** | **6.49** | **9.31** | **2.82** | **30.4%** |

---

## Table 5 — Average step count by task

| Task | Task type | Agent-ready | Baseline | Difference | Reduction |
|---|---|:---:|:---:|:---:|:---:|
| Task 1 | Inventory-aware cart execution | 10.23 | 11.37 | 1.13 | 10.0% |
| Task 2 | Product-detail extraction | 4.33 | 6.70 | 2.37 | 35.3% |
| Task 3 | Comparative product recommendation | 4.37 | 9.33 | 4.97 | 53.2% |
| Task 4 | Multi-constraint product selection | 9.73 | 15.27 | 5.53 | 36.2% |
| Task 5 | Store-policy and temporal decision | 3.77 | 3.90 | 0.13 | 3.4% |

---

## Table 6 — Total prompt-token usage by model

| Model | Agent-ready | Baseline | Reduction |
|---|:---:|:---:|:---:|
| Gemini 2.5 Flash | 4,958,307 | 6,099,907 | 18.72% |
| Grok-4 Fast | 2,189,279 | 3,677,702 | 40.47% |
| GPT-4.1 | 1,770,532 | 2,829,720 | 37.43% |
