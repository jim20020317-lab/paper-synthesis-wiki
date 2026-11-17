---
id: halo-25d-llm
title: "HALO: 異構 2.5D Chiplet 邊緣端 LLM 推理系統"
venue: "IEEE JETCAS 2024"
category: "2.5D Chiplet / IMC"
tags: [chiplet, reram-imc, nop, communication-aware, llm, edge]
bottleneck_summary: "ReRAM 寫入延遲與能耗過高且易損壞單元（不適合動態矩陣），且跨 chiplet NoP 通信佔總延遲達 62%。"
solution_summary: "採用 ReRAM-IMC + CMOS 異構 chiplet 分工，搭配 branch-and-bound 通信感知映射演算法。"
combinable_modules: ["ReRAM/CMOS 異構算子切分", "Phase-wise 通信感知映射", "SRAM-DCIM 替代對比空白"]
related: [gemini-hpca2024, streamdcim-2025, eta-apccas2025, gemini-dcim-adaptation]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
- **單一技術不適用 Transformer**：靜態權重相乘（WSMM）與動態注意力相乘（DMM）的資料流特性截然不同；ReRAM 寫入高延遲、高能耗且會損壞單元，完全不適合頻繁寫入的 DMM。
- **跨 Chiplet 通信主導延遲**：在 IMC chiplet 系統中，Network-on-Package (NoP) 通信可佔據總延遲高達 **62%**，若映射未考量通信拓撲，效能將被互連瓶頸吞噬。

## 核心解法 (Solution)
- **異構 2.5D Chiplet 架構**：使用 ReRAM 模擬 IMC chiplet 專責處理靜態權重相乘（WSMM），同時以 CMOS systolic array FPU chiplet 處理動態矩陣相乘（DMM）、softmax 與除法等算子，規避 ReRAM 寫入代價。
- **Phase-wise 通信感知映射**：利用約 73% 通信發生在同一 phase 內的特性，設計 branch-and-bound 與自訂 sequential placement 演算法，將 computing cluster 映射到 chiplet 網格以最小化 `volume × distance` 通信代價。

## 關鍵實驗數據
- 相較 NVIDIA Jetson Orin Nano：最高達成 **972× latency** 與 **1600× energy** 改善。
- 相較 SIAM（Chiplet IMC mapping 框架）：平均減少 **19% cost**、**11% NoP latency**，並提升 **8× 映射速度**。
- 相較通用 Simulated Annealing：在同等 cost 下達成最高 **26× 速度** 提升。

## 可組合模組 (Combinable Modules)
- **可抽離模組 1 — 靜態/動態算子異構切分**：可將「WSMM vs DMM」切分邏輯遷移至其他混合記憶體架構。
- **可切入研究空白（Blind Spot）**：HALO 反對 IMC 執行 DMM 的論點僅基於 ReRAM 物理寫入代價，**全篇未對比 SRAM-based DCIM**，這為後續研究留下明確的切入點。

## 關聯條目
- 與 `streamdcim-2025`、`eta-apccas2025` 互補：後兩者正面解決 CIM 執行動態計算時的寫入瓶頸，可填補 HALO 的 DCIM 對比空白。
- 與 `gemini-hpca2024` 在 `gemini-dcim-adaptation` 中對比兩種不同的 Cost Model（HALO 的純通信模型 vs Gemini 的 Roofline 聯合模型）。
