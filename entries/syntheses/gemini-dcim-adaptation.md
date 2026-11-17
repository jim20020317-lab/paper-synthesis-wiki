---
id: gemini-dcim-adaptation
title: "將 Gemini 映射框架適配至 Multi-DCIM Chiplet 系統"
category: "架構融合 (Architecture Synthesis)"
tags: [gemini, dcim, weight-rewrite, mapping, cost-model, ping-pong]
source_papers: [gemini-hpca2024, streamdcim-2025, halo-25d-llm, eta-apccas2025]
bottleneck_summary: "Gemini 等通用加速器映射框架忽略了 DCIM 切換層時高達 88.9% 的權重重寫延遲，而 HALO 又完全未評估 SRAM-DCIM 路線。"
solution_summary: "保留 Gemini 的 LMS+SA 跨核搜索骨架，將核內 Timeloop 簡化為查表，並於 Cost Model 新增 Weight Rewrite Cost 與 Ping-Pong 隱藏項。"
related: [gemini-hpca2024, streamdcim-2025, halo-25d-llm, eta-apccas2025]
last_updated: "2026-11-17"
---

## 組合動機與研究缺口
- `gemini-hpca2024` 提供了強大的 Layer-Pipeline Spatial Mapping 搜尋框架，但其目標硬體是具備豐富資料流自由度的通用 DNN chiplet（Eyeriss-like core）。
- `halo-25d-llm` 雖然針對 IMC chiplet，卻只考量 Analog ReRAM 並完全略過 SRAM-based DCIM，且其 Cost Model 僅計算純通信代價。
- `streamdcim-2025` 證實 DCIM 切換層時的 SRAM 權重重寫延遲在未最佳化前佔總延遲高達 **88.9%**，因此任何 Multi-DCIM 映射框架都必須顯式建模重寫代價。

## 融合架構設計
1. **沿用（來自 `gemini-hpca2024`）**：完整的 **LMS 三元組編碼（Part / CG / FD）** 與 **OP1–OP5 SA 算子**——這部分屬於跨核拓撲最佳化，與底層運算單元無關，可直接決定 NoC 與 D2D 流量分布。
2. **簡化（針對 DCIM 特性）**：DCIM macro 預設為固定 Weight-Stationary 且計算延遲為常數，因此原本耗時的 Intra-core Evaluator 可退化為**查表模型**（輸入 array size 與精度即得 MVM 延遲與能耗）。
3. **新增（來自 `streamdcim-2025` 與 `eta-apccas2025`）**：
   - 在延遲模型加入 $D_{\text{core}} = \max(D_{\text{compute}}, D_{\text{rewrite\_effective}})$，其中 $D_{\text{rewrite\_effective}}$ 為扣除 ping-pong 重疊後的暴露重寫時間。
   - 可選擇性引入 `eta-apccas2025` 的 Array-aware 水平拼接作為前處理，減少所需 DCIM macro 數量。

## 新論文切入點 (Research Opportunity)
- **題目方向**：*Rewrite- and Communication-Aware Spatial-Temporal Mapping for Multi-DCIM Chiplet Accelerators*。
- **核心驗證**：在相同的 Transformer 工作負載下，對比 `halo-25d-llm`（ReRAM + CMOS 異構）與本融合架構（Multi-DCIM + Rewrite-Aware Mapping），正式填補 HALO 留下的 SRAM-DCIM 對比空白。
