---
id: eta-apccas2025
title: "ETA: 面向 ReRAM-CIM 的高效率 Transformer Attention 映射"
venue: "IEEE APCCAS 2025"
category: "CIM Attention Mapping"
tags: [reram, cim, transformer, attention, compute-write-parallelism, array-utilization]
bottleneck_summary: "ReRAM-CIM 計算 Attention 時面臨頻繁中間資料寫入與 Compute-Write-Compute (CWC) 串行依賴，且矩陣映射常留下閒置陣列欄。"
solution_summary: "將 V 與 X^T 分存不同陣列以重疊寫入與計算，並透過 Array-aware 水平拼接 W_Q 與 W_V 提升陣列利用率。"
combinable_modules: ["計算與寫入跨陣列重疊 (CWC 解耦)", "Array-Aware 權重矩陣水平拼接"]
related: [halo-25d-llm, streamdcim-2025, gemini-dcim-adaptation]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
- **CWC 串行阻塞**：傳統方案（如 ReBERT）依序生成並寫入 $K^T$ 與 $V$，寫入期間後續計算全面停擺。
- **二次方儲存爆炸或雙向存取依賴**：部分前作需預存隨模型維度二次方增長的 $W_S = W_Q W_K^T$，或依賴特殊 dual-access ReRAM。
- **陣列欄利用率低**：當 CIM 陣列欄數大於單一 head 維度 $d_h$ 時，分開映射 $W_Q$ 與 $W_V$ 會留下大量閒置欄。

## 核心解法 (Solution)
- **跨陣列計算/寫入重疊**：先算 $R = Q W_K^T$ 的同時，並行將 $V$ 與 $X^T$ 寫入不同陣列，再計算 $O = R X^T$，避免顯式生成與寫入 $K^T$，打破 CWC 串行鏈。
- **Array-Aware 水平拼接**：構造水平拼接矩陣 $W_C = C(W_Q, W_V)$，讓單次 $X W_C$ 同時產出 $Q$ 與 $V$，消滅閒置陣列欄並減少運算區塊。

## 關鍵實驗數據
- 在 DeiT-small 與 GPT2-small 模擬中：最高減少 **66% waiting-for-write** 延遲與 **20% attention-block latency**。
- 在 `64×64` 陣列規格下：最高減少 **29% 所需 CIM 陣列數**。

## 可組合模組 (Combinable Modules)
- **Array-Aware 水平拼接**：此最佳化**與 ReRAM 物理特性無關**，只要 SRAM-DCIM macro 同樣具備固定行列尺寸，即可無痛遷移以提升 macro 利用率。
- **跨陣列寫入重疊**：可與 `streamdcim-2025` 的 tile 級 ping-pong 機制結合，從「macro 內部」與「跨 macro 排程」雙層面同時遮蔽寫入延遲。

## 關聯條目
- 與 `streamdcim-2025` 共同為 `gemini-dcim-adaptation` 提供寫入延遲隱藏與陣列利用率提升的硬體技術選項。
- 與 `halo-25d-llm` 形成對比：HALO 選擇以 CMOS 迴避 ReRAM 寫入，ETA 則在 CIM 內部重排計算順序以隱藏寫入。
