---
id: nop-latency-hiding-synthesis
title: "2.5D Chiplet NoP 延遲隱藏與系統級跨層調度融合方案"
category: "調度融合 (Scheduling Synthesis)"
tags: [nop, latency-hiding, scheduling, chiplet, dma, pipelining]
source_papers: [scar-micro2024, pics-tcad2026, comet-hpca2026, ouroboros-asplos2026]
bottleneck_summary: "單靠空間映射無法消除跨 chiplet 突發流量造成的 NoP 擁塞、小包 DMA 協議開銷與序列不均引起的計算停頓。"
solution_summary: "融合 SCAR 的動態窗口重組、PICS 的 Output-Centric 本地累加、Ouroboros 的 Token 粒度流水線與 COMET 的 DMA 請求聚合。"
related: [scar-micro2024, pics-tcad2026, comet-hpca2026, ouroboros-asplos2026]
last_updated: "2026-11-17"
---

## 組合動機與研究缺口
在多 chiplet 系統中，「通信延遲隱藏」並非單一演算法能解決，而是橫跨 **系統排程、空間映射、互連拓撲與微觀 DMA 傳輸** 四個層次的協同問題：
- `scar-micro2024` 擅長宏觀的時間窗口（Time Window）與動態 chiplet 重組，但未細化到微觀 DMA 協議開銷。
- `comet-hpca2026` 精準解決了 < 1MB 小 DMA 請求的協議與排隊瓶頸，但缺乏多模型跨層重組視角。
- `pics-tcad2026` 與 `ouroboros-asplos2026` 分別提供了 Output-centric 本地累加與 Token 級流水線，能從源頭減少跨界流量與氣泡。

## 融合架構設計
1. **微觀級（來自 `ouroboros-asplos2026`）**：以 Token-Grained Pipelining 取代粗粒度 sequence-level 排程，消除長短序列混跑時的 pipeline bubble。
2. **時間與拓撲級（來自 `scar-micro2024` + `pics-tcad2026`）**：以 SCAR 的 `Time Window + Dynamic Regrouping` 在時間軸錯開 NoP burst，並套用 PICS 的 `Output-Centric` 原則將 partial-sum 累加鎖定在本地 chiplet。
3. **傳輸協議級（來自 `comet-hpca2026`）**：將同一視窗內跨 chiplet 的零碎 PE 激活傳輸送入 DMA Coalescing 單元合併為大批量傳輸，並依 CNN/Transformer 特性調整記憶體對齊方式。

## 新論文切入點 (Research Opportunity)
- **題目方向**：*Full-Stack NoP Latency Hiding: Bridging Token-Level Pipelining, Dynamic Regrouping, and DMA Coalescing for 2.5D AI Chiplets*。
- **量化目標**：以 SCAR 的 stall 目標函數 $\sum \max(0, T_{\text{comm}} - T_{\text{overlap}})$ 為主軸，整合 COMET 的 $\alpha$-$\beta$ UCIe 延遲模型進行端到端評估。
