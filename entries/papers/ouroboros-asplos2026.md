---
id: ouroboros-asplos2026
title: "Ouroboros: 晶圓級全 SRAM-CIM 與 Token 粒度流水線 LLM 推理架構"
venue: "ASPLOS 2026"
category: "Wafer-Scale / SRAM-CIM"
tags: [wafer-scale, sram-cim, llm, token-grained-pipelining, miqp, kv-cache]
bottleneck_summary: "Wafer-scale 系統在序列長度不均時產生嚴重 pipeline bubble，且跨 die 通信存在 4× 以上懲罰與缺陷核心（defective core）限制。"
solution_summary: "提出 Token-Grained Pipelining 消除 bubble，搭配分散式 KV Cache 管理與 MIQP 通信感知容錯核心映射。"
combinable_modules: ["Token-Grained Pipelining (TGP)", "分散式動態 KV Cache 環形分配", "MIQP 跨 Die 通信感知與容錯映射"]
related: [gemini-hpca2024, scar-micro2024, nop-latency-hiding-synthesis]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
- **序列級流水線氣泡與 Buffer 爆炸**：傳統 sequence-level pipeline 因輸入/輸出長度不均導致 CIM 核心閒置，且需龐大激活緩衝區。
- **層內與層間通信的根本衝突**：同一層 tile 聚集可減小 reduction 距離，卻拉長層間傳輸；交錯放置則導致層內 reduction 流量在 wafer 上跨越多個 reticle（跨 die 懲罰達 **4×** 以上），且必須繞過物理 defective core。

## 核心解法 (Solution)
- **Token-Grained Pipelining (TGP)**：將流水線細化至單個 token 粒度，徹底消除序列長度不均造成的 bubble，並將激活 buffer 需求降低數千倍。
- **分散式動態 KV Cache 管理**：透過多級位址轉譯（page table + bitmap + block register）與環形 head 分配，實現儲存與計算的時空分離。
- **分層通信感知與容錯映射**：Inter-core 層面建立 **MIQP** 模型，同時納入 Manhattan 距離、output/reduction/gather 三類通信量、跨 die 懲罰與缺陷核心硬約束；Intra-core 層面則利用動態規劃（DP）最佳化 H-Tree 規約樹。

## 關鍵實驗數據
- 在 13B LLM 模型上相較 SOTA 系統：平均吞吐提升 **4.1×**、能效提升 **4.2×**（峰值可達 **9.1× 吞吐 / 17× 能效**）。
- 全權重、激活與 KV cache 皆駐留於一級 SRAM 內，徹底消除 HBM/DRAM 搬移。

## 可組合模組 (Combinable Modules)
- **TGP 細粒度流水線**：可遷移至多 chiplet LLM 推理系統，緩解異構或長短句混合時的負載不均。
- **MIQP 跨區懲罰建模**：其 `Penalty(n1, n2)` 抽象可直接對照 2.5D interposer 中片內 NoC 與跨 chiplet NoP 的代價差異。

## 關聯條目
- 與 `scar-micro2024`、`nop-latency-hiding-synthesis` 共同探討如何透過細粒度調度消除系統級停頓（stall / bubble）。
- 與 `gemini-hpca2024` 分別代表「精確數學規劃 (MIQP)」與「啟發式退火 (SA)」兩種跨核映射路線。
