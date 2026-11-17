# AGENTS.md — 論文「瓶頸 × 解法」組合知識庫開發規範

> 本文件定義此專案的定位、架構、檔案命名、內容格式與 AI 協作流程。
> 任何 AI Agent（Antigravity、Claude Code、Codex 等）在修改、擴充或維護本專案前，**必須先完整閱讀本文件**。

---

## 1. 專案目的 (Project Purpose)

本專案是一個基於 **LLM Wiki** 理念的靜態知識庫網站，核心目標是協助研究者：
1. **拆解論文**：從已讀論文中精準萃取出 **「研究瓶頸 (Bottleneck)」**、**「核心解法 (Solution)」** 與 **「可組合模組 (Combinable Modules)」**。
2. **結構化累積**：將每篇論文與跨論文的綜合分析（Synthesis）以標準化的 Markdown 格式保存。
3. **組合創新**：透過網站的「瓶頸 × 解法矩陣」與「組合實驗室 (Idea Mixer)」，將 A 論文的瓶頸與 B 論文的解法重新配對，發想新的論文題目與系統架構。

---

## 2. 整體視覺與技術風格 (Design & Tech Stack)

- **純靜態架構（Zero-Build Deployment）**：
  - 前端使用原生 `HTML5 + CSS3 + Vanilla JavaScript`，**禁止引入**需要 Node.js / Webpack / Vite 編譯的框架，確保專案可直接透過 **GitHub Pages** 部署。
  - 資料編譯與格式驗證使用 Python 3 標準函式庫（`scripts/build_wiki.py`），無需額外第三方套件。
- **視覺設計語言**：
  - 採用「學術知識庫 × 系統藍圖」風格：淺色紙張基底（`#f8fafc`）、深石板字體（`#0f172a`），搭配三種固定語意色：
    - **瓶頸 (Bottleneck)**：琥珀紅 `#dc2626` / 淺紅底 `#fef2f2`
    - **解法 (Solution)**：深藍綠 `#0f766e` / 淺青底 `#f0fdfa`
    - **組合構想 (Synthesis)**：靛藍色 `#2563eb` / 淺藍底 `#eff6ff`
  - 排版清爽、卡片資訊密度適中，支援即時關鍵字搜尋、領域標籤篩選與單頁詳情檢視。

---

## 3. 目錄結構與檔案職責 (Directory Structure)

```text
paper-synthesis-wiki/
├── AGENTS.md                  # 本專案核心規則（主要規範）
├── CLAUDE.md                  # Claude Code 專用入口（同步指向 AGENTS.md）
├── README.md                  # 專案說明與本地預覽/部署方式
├── index.html                 # 網站主入口（SPA 知識庫瀏覽器）
├── assets/
│   ├── css/
│   │   └── style.css          # 全站樣式與語意色變數
│   └── js/
│       └── app.js             # 前端渲染、搜尋、篩選、詳情與 Idea Mixer 邏輯
├── entries/                   # 【唯一可編輯內容層】Markdown 原始資料
│   ├── papers/                # 單篇論文萃取（命名：<slug>.md）
│   └── syntheses/             # 跨論文瓶頸組合分析（命名：<slug>.md）
├── data/
│   └── wiki.json              # 【自動生成】由 scripts/build_wiki.py 編譯輸出
└── scripts/
    └── build_wiki.py          # 解析 entries/、檢查規範與雙向連結、生成 data/wiki.json
```

---

## 4. 檔案命名與放置規則 (Naming & Placement Rules)

1. **檔名格式**：一律使用全小寫英文與連字號 `kebab-case`（例如：`halo-25d-llm.md`、`gemini-dcim-adaptation.md`）。
   - **禁止**使用空白、大寫字母或中文作為檔名，確保 URL Hash 路由與 GitHub Pages 跨平台相容。
2. **放置位置**：
   - 單篇論文的瓶頸與解法萃取 → `entries/papers/<slug>.md`
   - 多篇論文的融合構想或橫向比較 → `entries/syntheses/<slug>.md`
3. **編碼規範**：所有 `.md`、`.json`、`.html`、`.css`、`.js` 與 `.py` 檔案一律使用 **UTF-8** 編碼。

---

## 5. 新增內容的標準格式 (Content Schema)

### 5.1 單篇論文條目 (`entries/papers/<slug>.md`)

必須包含完整的 YAML Frontmatter 與以下五個固定 `##` 章節：

```markdown
---
id: halo-25d-llm
title: "HALO: 異構 2.5D Chiplet 邊緣端 LLM 推理系統"
venue: "IEEE JETCAS 2024"
category: "2.5D Chiplet / IMC"
tags: [chiplet, reram-imc, nop, communication-aware, llm]
bottleneck_summary: "ReRAM 寫入延遲與能耗過高不適合動態矩陣，且跨 chiplet NoP 通信佔總延遲達 62%。"
solution_summary: "以 ReRAM-IMC + CMOS 異構分工，搭配 branch-and-bound 通信感知映射。"
combinable_modules: ["ReRAM/CMOS 異構算子切分", "Phase-wise 通信感知映射"]
related: [gemini-hpca2024, gemini-dcim-adaptation]
last_updated: "2026-11-17"
---

## 研究瓶頸 (Bottleneck)
說明此論文要解決的核心痛點、量化數據與物理/系統限制。

## 核心解法 (Solution)
說明論文提出的架構、演算法或調度機制如何化解上述瓶頸。

## 關鍵實驗數據
條列主要對比基線與量化改善幅度（加速比、能效比、面積/延遲降低等）。

## 可組合模組 (Combinable Modules)
列出此論文中可被抽離出來、與其他論文重新組合的「技術積木」或未解盲區。

## 關聯條目
簡述與其他論文或綜合分析（Synthesis）的關聯與差異。
```

### 5.2 跨論文組合條目 (`entries/syntheses/<slug>.md`)

```markdown
---
id: gemini-dcim-adaptation
title: "將 Gemini 映射框架適配至 Multi-DCIM Chiplet 系統"
category: "架構融合 (Architecture Synthesis)"
tags: [gemini, dcim, weight-rewrite, mapping, cost-model]
source_papers: [gemini-hpca2024, streamdcim-2025, halo-25d-llm]
bottleneck_summary: "通用加速器映射框架忽略了 DCIM 切換層時高達 88.9% 的權重重寫延遲。"
solution_summary: "保留 Gemini 的 LMS+SA 跨核搜索，將核內搜索簡化為查表並新增 Rewrite Cost 與 Ping-Pong 隱藏項。"
related: [gemini-hpca2024, streamdcim-2025, halo-25d-llm]
last_updated: "2026-11-17"
---

## 組合動機與研究缺口
說明為什麼需要把這幾篇論文的瓶頸與解法組合在一起。

## 融合架構設計
逐一拆解「沿用自論文 A 的模組」、「替換/簡化的部分」與「新增的機制」。

## 新論文切入點 (Research Opportunity)
總結此組合能產生的創新貢獻與可驗證的實驗方向。
```

---

## 6. AI 新增或修改內容的標準作業流程 (SOP)

當使用者要求「新增一篇論文」、「新增一個組合構想」或「擴充知識庫」時，AI 必須嚴格依序執行以下步驟：

1. **先讀再寫**：讀取 `data/wiki.json` 或 `entries/` 目錄，確認既有條目的 `id` 與 `tags`，避免重複建立或標籤名稱不一致。
2. **依 Schema 建立檔案**：在 `entries/papers/` 或 `entries/syntheses/` 建立符合 `kebab-case` 命名的 `.md` 檔案，填滿所有必填 YAML 欄位與固定章節。
3. **維護雙向關聯**：若新條目 A 的 `related` 引用了既有條目 B，**必須同步檢查並更新條目 B 的 `related`**，確保知識圖譜不產生單向斷鏈或孤島條目。
4. **執行編譯與驗證**：在專案根目錄執行：
   ```bash
   python scripts/build_wiki.py
   ```
   確認終端機輸出 `[OK]` 且無任何缺失欄位、重複 `id` 或無效 `related` 引用警告。
5. **本地瀏覽確認**：使用本地靜態伺服器預覽 `index.html`，確認新條目能正確顯示於列表、篩選器、詳情頁與 Idea Mixer 中。

---

## 7. 不可逾越的規則紅線 (Hard Constraints)

- **禁止直接手動編輯 `data/wiki.json`**：`data/wiki.json` 為編譯產物，所有資料變更必須透過修改 `entries/*.md` 後執行 `scripts/build_wiki.py` 生成。
- **禁止編造實驗數據**：論文的加速比、延遲佔比、發表會議與 DOI 等數據必須來自真實論文或既有筆記，未經確認不可杜撰。
- **保持零建置相容**：不可修改前端使之依賴外部建置工具或後端伺服器，必須維持 GitHub Pages 開箱即用。
