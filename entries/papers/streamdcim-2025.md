---
id: streamdcim-2025
title: "StreamDCIM: 支援 Mixed-Stationary 跨層流水線的數位 CIM 加速器"
venue: "arXiv:2502.05798 (2025)"
category: "Digital CIM / Dataflow"
tags: [dcim, mixed-stationary, ping-pong, weight-rewrite, multimodal-transformer]
bottleneck_summary: "傳統 DCIM 僅支援單一 Weight-Stationary，且切換層時 SRAM 權重重寫（weight rewriting）延遲佔總延遲高達 88.9%。"
solution_summary: "設計可重配置 TBR-CIM macro 實現 Mixed-Stationary 資料流，並以 tile 級 Ping-Pong 計算/重寫流水線隱藏重寫延遲。"
combinable_modules: ["TBR-CIM 雙模式 Macro", "Mixed-Stationary 跨 Tile 轉發", "Ping-Pong 計算與重寫重疊"]
related: [halo-25d-llm, gemini-hpca2024, eta-apccas2025, gemini-dcim-adaptation]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
- **權重重寫（Weight Rewriting）主導延遲**：DCIM 切換神經網路層時，必須將新權重寫入 SRAM array。在 ViLBERT 的 $QK^T$ 等動態場景下，rewriting 延遲佔總延遲高達 **88.9%**。
- **三大僵化限制**：靜態 CIM 難適應動態 token pruning、純 Weight-Stationary (WS) 限制 tile 間並行性、粗粒度 layer-level pipeline 無法遮蔽寫入延遲。

## 核心解法 (Solution)
- **Tile-based Reconfigurable CIM Macro (TBR-CIM)**：單一 macro 支援 normal mode 與 hybrid reconfigurable mode，能同時持有靜態權重與動態輸入。
- **Mixed-Stationary Cross-forwarding Dataflow**：打破純 WS 限制，讓部分計算維持 WS（如 $I_X W_Q$），而動態輸入運算透過 cross-forwarding 直接將前一個 tile 的輸出流向下一 tile。
- **Ping-Pong 細粒度計算-重寫流水線**：某 tile 完成計算後立即釋放進行下一組權重重寫，同時其他 tile 繼續計算，將 88.9% 的重寫延遲幾乎完全隱藏於計算中。

## 關鍵實驗數據
- 製程與規格：28nm、200MHz、面積 67.3 mm²、功耗 3.08 W（ViLBERT-base/large, INT16）。
- 相較 non-streaming parallel baseline：幾何平均 **2.63× speedup**。
- 相較 layer-based streaming baseline：幾何平均 **1.28× speedup**。

## 可組合模組 (Combinable Modules)
- **Weight Rewrite Cost 模型**：提醒所有 multi-DCIM mapping 框架（如 `gemini-hpca2024`）必須在延遲模型中加入 rewrite time。
- **編譯期靜態 Ping-Pong 調度**：tile 釋放與重寫時機具有高度確定性，可直接交由 compiler 靜態規劃。

## 關聯條目
- 在 `gemini-dcim-adaptation` 中作為關鍵補丁，為 `gemini-hpca2024` 補充 DCIM 專屬的權重重寫代價與 ping-pong 隱藏公式。
- 與 `eta-apccas2025` 共同聚焦「如何重疊 CIM 的寫入與計算」。
