---
id: scar-micro2024
title: "SCAR: 異構 2.5D MCM 多模型 AI 工作負載調度框架"
venue: "IEEE/ACM MICRO 2024"
category: "Multi-Model Scheduling"
tags: [chiplet, mcm, scheduling, nop, latency-hiding, multi-model]
bottleneck_summary: "多模型工作負載在異構 2.5D MCM 上執行時，傳統固定分區造成部分計算單元長期等待跨 interposer 資料而停滯。"
solution_summary: "引入 Time Window 與 Segment 兩級時間切分，搭配動態 Chiplet 重組（Dynamic Regrouping）與跨層/跨模型流水線重疊。"
combinable_modules: ["Time Window + Segment 兩級調度", "動態 Chiplet 重組 (Dynamic Regrouping)", "Stall 最小化目標函數"]
related: [pics-tcad2026, ouroboros-asplos2026, nop-latency-hiding-synthesis]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
- **固定分區與同質假設失效**：傳統 MCM 加速器假設同質 chiplet 與靜態資料流，面對多模型並發（如資料中心多租戶、AR/VR 多任務）時，各模型不同的資料流與通信需求會導致嚴重的 critical path 停滯。
- **跨 Interposer 通信暴露於關鍵路徑**：若無法與本地計算重疊，NoP 延遲將直接轉化為全系統閒置時間。

## 核心解法 (Solution)
- **Time Window 與 Segment 雙層抽象**：將執行時間切分為 package-level 的 `Time Window`，內部再細分為可跨 chiplet 流水線執行的 `Segment`（區分計算段與通信段）。
- **Inter-Layer / Inter-Model Pipelining**：目標並非讓通信消失，而是最佳化 $\sum \max(0, T_{\text{comm}} - T_{\text{overlap}})$，讓通信發生在其他 chiplet 仍有計算可做的區間。
- **Dynamic Chiplet Regrouping**：允許在不同 time window 動態重新分配 chiplet 群組，避免固定分區造成局部資源飢餓。

## 關鍵實驗數據
- 發表於 57th IEEE/ACM MICRO 2024（UC Irvine），DOI: `10.1109/MICRO61859.2024.00049`。
- 顯式將 `BWnop`、`Szdata`、`nhops` 與 NoP 衝突懲罰納入調度代價模型，有效隱藏跨 chiplet 通信延遲。

## 可組合模組 (Combinable Modules)
- **Window + Dynamic Regrouping 機制**：可直接改寫為 multi-DCIM triplet 排程器，在時間軸上錯開高頻寬 NoP burst。
- **Overlap-Aware Stall 目標函數**：能與 `ouroboros-asplos2026` 的細粒度流水線互補，同時處理單模型長短不一與多模型並發場景。

## 關聯條目
- 在 `nop-latency-hiding-synthesis` 中負責「時間維度錯峰與動態重組」的核心機制。
- 與 `pics-tcad2026` 同樣關注如何透過跨層排程掩蓋 interposer 通信代價。
