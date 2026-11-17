---
id: pics-tcad2026
title: "PICS: 支援跨層調度的光學互連 Chiplet DNN 加速器"
venue: "IEEE TCAD 2026"
category: "Interconnect & Scheduling"
tags: [chiplet, photonic-interconnect, cross-layer-scheduling, broadcast, mapping]
bottleneck_summary: "傳統單播電氣 NoP 缺乏廣播與拓撲重構自由度，大幅限制了 cross-layer scheduling 隱藏跨 chiplet 通信延遲的空間。"
solution_summary: "結合可重構光學互連（支援廣播）、Memory-aware 圖切分、細粒度層間調度與 Output-centric 映射。"
combinable_modules: ["Memory-Aware 圖切分", "Output-Centric 本地累加映射", "廣播感知與 Layer-Group 重構"]
related: [scar-micro2024, comet-hpca2026, nop-latency-hiding-synthesis]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
- **互連架構限制調度自由度**：若底層 NoP 僅支援普通 unicast，且缺乏 multicast、flow priority 或拓撲重構能力，上層 scheduler 即使有優異的 cross-layer 排程也無法有效消除通信停滯。
- **跨 Chiplet Partial-Sum 搬移開銷**：頻繁跨互連交換 partial sum 會抵銷片上權重重用的優勢。

## 核心解法 (Solution)
- **Memory-Aware 圖切分**：將 DNN DAG 切分為符合 global buffer 容量的子圖，避免逐層寫回外部 DRAM。
- **細粒度 Interlayer Scheduling**：使用 Simulated Annealing 與 group/split 算子，同時最佳化 temporal layer grouping 與 spatial chiplet 分配，並僅在 layer group 切換時重構互連。
- **Output-Centric Intra-Layer 映射**：盡量將同一輸出的 partial-sum 累加留在本地 chiplet，同時利用光學廣播進行 input/weight multicast。

## 關鍵實驗數據
- 發表於 IEEE TCAD Vol. 45, Issue 5 (May 2026)，DOI: `10.1109/TCAD.2025.3593438`。
- 透過「高頻寬廣播互連 + Output-centric 映射 + Layer-group 排程」三者協同，顯著降低 DRAM 流量與跨 chiplet 通信延遲。

## 可組合模組 (Combinable Modules)
- **Output-Centric 映射原則**：對於 Weight-Stationary DCIM chiplet 極具價值——若讓 partial-sum 留在本地累加，可避免跨 interposer 交換吃掉 WS 的能效紅利。
- **Layer-Group 級重構抽象**：對應到電氣 NoP 時，可轉化為僅在窗口切換時調整虛擬通道或路由優先權。

## 關聯條目
- 與 `scar-micro2024`、`comet-hpca2026` 共同構成 `nop-latency-hiding-synthesis` 的三大系統調度支柱。
