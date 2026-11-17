---
id: gemini-hpca2024
title: "Gemini: 大規模 DNN Chiplet 加速器的架構與映射聯合探索框架"
venue: "IEEE HPCA 2024"
category: "Mapping & DSE Framework"
tags: [chiplet, mapping, co-exploration, d2d, simulated-annealing, evaluator]
bottleneck_summary: "Layer-Pipeline 空間映射搜尋空間呈指數爆炸，且昂貴的跨 chiplet D2D 通信（高能耗、低頻寬）嚴重制約系統效能。"
solution_summary: "提出 layer-centric 的 LMS 三元組編碼，搭配 5 種結構化 SA 算子與雙層 Roofline/MC 評估器進行架構-映射聯合搜尋。"
combinable_modules: ["LMS 三元組編碼 (Part/CG/FD)", "5 種結構化 SA 算子", "雙層 Energy-Delay-MC 評估器"]
related: [halo-25d-llm, streamdcim-2025, comet-hpca2026, ouroboros-asplos2026, gemini-dcim-adaptation]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
- **LP SPM 搜尋空間龐大**：對於 $C$ 個 core、$L$ 層的 DNN，切分與 core group 排列組合遠超窮舉極限，現有 heuristic 難以找到全域近優解。
- **D2D 通信代價高昂**：跨 chiplet 的 Die-to-Die (D2D) 互連相較片內 NoC 具有更低頻寬與更高能耗（clock-forwarding 與 always-on SerDes 差異顯著）。

## 核心解法 (Solution)
- **LMS 編碼（Layer Mapping Scheme）**：將每層映射形式化為三元組 $LMS_i = (Part_i, CG_i, FD_i)$，分別控制 H/W/B/K 維度切分、Core Group 分配（決定走 NoC 或 D2D）與 DRAM 資料流向。
- **5 種針對性 SA 算子（OP1–OP5）**：包含 Partition 微調、CG 交換、CG 合併/拆分、FD 重定向與 Layer 重排，能快速將高流量 cluster 物理聚集。
- **雙層 Evaluator**：結合 Intra-core Evaluator（類似小型 Timeloop）與 Global Evaluator，同時最佳化 $MC^\alpha \times E^\beta \times D^\gamma$（貨幣成本、能耗、延遲）。

## 關鍵實驗數據
- 相較 SOTA（Simba + Tangram LP mapping）：平均達成 **1.98× 效能提升** 與 **1.41× 能效提升**，而貨幣成本（MC）僅增加 **14.3%**。
- 揭示 chiplet 粒度權衡：適度切分有利，過度細分會同時惡化 MC、效能與能效。

## 可組合模組 (Combinable Modules)
- **LMS 編碼與 SA 算子**：屬於與底層運算單元解耦的跨核映射骨架，可直接套用到 DCIM、Wafer-scale 或作為 `comet-hpca2026` 的初始映射器。
- **可替換的 Intra-core Evaluator**：當底層換成固定資料流的 DCIM 時，可將其簡化為查表模型。

## 關聯條目
- `comet-hpca2026` 直接採用 Gemini 產生初始 layer-to-chiplet mapping，再進一步最佳化細粒度 DMA 排程。
- `gemini-dcim-adaptation` 詳細推導如何將 Gemini 改造並適配至 Multi-DCIM Chiplet 系統。
