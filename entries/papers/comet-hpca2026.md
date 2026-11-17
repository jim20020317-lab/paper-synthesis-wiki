---
id: comet-hpca2026
title: "COMET: 面向 MCM 細粒度 AI 推理的通信與記憶體協同設計"
venue: "IEEE HPCA 2026"
category: "Communication & Memory Co-Design"
tags: [chiplet, mcm, dma, communication-model, memory-mapping, ucie]
bottleneck_summary: "細粒度 PE 級 DMA 請求（< 1MB）在傳統 bulk-oriented DMA 設計下協議與排隊開銷過大，導致頻寬利用率低與高延遲。"
solution_summary: "建立涵蓋 DMA 全生命週期的細粒度通信模型，結合 DMA 請求聚合（Coalescing）與工作負載自適應記憶體位址映射。"
combinable_modules: ["DMA 全生命週期通信模型", "多 PE 細粒度 DMA 請求聚合", "工作負載自適應位址映射"]
related: [gemini-hpca2024, pics-tcad2026, nop-latency-hiding-synthesis]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
- **理想化通信模型失真**：既有 chiplet 映射工具多假設均勻的大量資料搬移，忽略小 batch 推理下 PE 級突發且小於 1MB 的細粒度 DMA 請求。
- **協議開銷與位址碎片**：未經聚合的小 DMA 請求反覆觸發中斷、控制路徑路由與 DMA controller 排隊，嚴重拉低 UCIe/NoP 實際頻寬利用率。

## 核心解法 (Solution)
- **DMA 全生命週期建模**：首次精確建模通知產生（$T_{\text{generate}}$）、片上控制路由（$H_i \cdot \lambda_{\text{hop}}$）、DMA 控制器排隊（$\tau_i^q$）與 UCIe $\alpha$-$\beta$ 傳輸模型（$\alpha = 8\text{ns}$）。
- **DMA 請求聚合（Coalescing）**：將來自多個 PE 的零碎 DMA 傳輸合併為大批量傳輸，攤銷固定協議開銷。
- **自適應記憶體位址映射**：針對 CNN（強同步、需對齊寫回）與 Transformer MHA（head 獨立、排程自由度高）切換不同位址映射策略，並以 `gemini-hpca2024` 作為初始映射器再進行 DAG DP 排程。

## 關鍵實驗數據
- 8×8 Mesh chiplet 架構評估（對比傳統 chiplet 通信）：達成 **1.1×–2.6× speedup** 與 **1.5×–4.4× bandwidth utilization** 提升。
- 並在 Intel Agilex 7 I-Series FPGA 上完成硬體實測驗證 DMA 延遲分解。

## 可組合模組 (Combinable Modules)
- **Gemini + COMET 兩階段管線**：完美示範如何用 `gemini-hpca2024` 做粗粒度空間映射，再接上 COMET 做細粒度 DMA 聚合與位址對齊。
- **PE 級工藝/熱擾動因子 $\delta_{c,p}$**：可與良率/偏差感知的映射研究結合。

## 關聯條目
- 直接引用並延伸 `gemini-hpca2024` 的映射結果。
- 在 `nop-latency-hiding-synthesis` 中補足「微觀傳輸聚合與記憶體對齊」的最後一哩路。
