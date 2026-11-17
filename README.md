# 論文「瓶頸 × 解法」組合研究知識庫 (Paper Bottleneck × Solution Wiki)

本專案是基於 **LLM Wiki** 理念建構的純靜態研究知識庫網站，目標是將閱讀過的論文（聚焦於 Chiplet、Digital CIM、NoP 互連與 DNN/LLM 排程映射）拆解為標準化的 **研究瓶頸 (Bottleneck)**、**核心解法 (Solution)** 與 **可組合模組 (Combinable Modules)**，並透過跨論文融合發想新的研究切入點。

## 專案特色

- **完整的 AI 協作規範**：透過 [`AGENTS.md`](./AGENTS.md)（與 [`CLAUDE.md`](./CLAUDE.md)）明確定義目錄職責、Markdown Schema、`kebab-case` 命名、雙向連結規則與擴充 SOP，讓任何 AI Agent 都能直接依循同一套規則新增論文或融合構想。
- **單一真相來源與自動驗證**：所有內容以 Markdown 撰寫於 `entries/`，透過 `scripts/build_wiki.py` 檢查必填欄位與雙向關聯後，編譯為 `data/wiki.json`。
- **純靜態零建置前端**：使用原生 HTML/CSS/JS，可直接部署至 **GitHub Pages**，提供論文卡片庫、瓶頸×解法矩陣、跨論文融合構想與互動式「瓶頸組合實驗室 (Idea Mixer)」。

## 本地預覽

```bash
# 1. 重新編譯與驗證知識庫資料
python scripts/build_wiki.py

# 2. 啟動本地靜態伺服器
python -m http.server 8000
```

接著在瀏覽器開啟 `http://localhost:8000`。

## 新增內容流程（摘要）

1. 依 `AGENTS.md` 第 5 節格式於 `entries/papers/` 或 `entries/syntheses/` 新增 `kebab-case.md`。
2. 同步更新關聯條目的 `related` 欄位。
3. 執行 `python scripts/build_wiki.py` 確認 `[OK]` 無警告。
