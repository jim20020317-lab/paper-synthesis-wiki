(() => {
  const state = {
    data: null,
    view: "papers",
    entryId: null,
    query: "",
    category: "all",
    mixerSelected: new Set(["halo-25d-llm", "streamdcim-2025"]),
  };

  const els = {
    stats: document.getElementById("stats-pill"),
    toolbar: document.getElementById("toolbar"),
    search: document.getElementById("search-input"),
    filters: document.getElementById("category-filters"),
    view: document.getElementById("app-view"),
    tabs: document.querySelectorAll(".nav-tab"),
  };

  function esc(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderInlineMd(text) {
    let html = esc(text);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return html;
  }

  function renderMarkdownBlock(md = "") {
    const lines = md.split("\n");
    const out = [];
    let inList = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        if (inList) {
          out.push("</ul>");
          inList = false;
        }
        continue;
      }
      if (line.startsWith("- ") || /^\d+\.\s/.test(line)) {
        if (!inList) {
          out.push("<ul>");
          inList = true;
        }
        const content = line.startsWith("- ")
          ? line.slice(2)
          : line.replace(/^\d+\.\s/, "");
        out.push(`<li>${renderInlineMd(content)}</li>`);
      } else {
        if (inList) {
          out.push("</ul>");
          inList = false;
        }
        out.push(`<p>${renderInlineMd(line)}</p>`);
      }
    }
    if (inList) out.push("</ul>");
    return out.join("");
  }

  function getEntryById(id) {
    const all = [...state.data.papers, ...state.data.syntheses];
    return all.find((item) => item.id === id) || null;
  }

  function filterItems(items) {
    const q = state.query.trim().toLowerCase();
    return items.filter((item) => {
      if (state.category !== "all" && item.category !== state.category) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.title,
        item.venue || "",
        item.category,
        item.bottleneck_summary,
        item.solution_summary,
        ...(item.tags || []),
        ...(item.combinable_modules || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function updateNav() {
    els.tabs.forEach((tab) => {
      const active = tab.dataset.view === state.view && !state.entryId;
      tab.classList.toggle("active", active);
    });
    const showToolbar = ["papers", "matrix", "syntheses"].includes(state.view) && !state.entryId;
    els.toolbar.classList.toggle("hidden", !showToolbar);
  }

  function renderCategoryFilters() {
    const sourceList =
      state.view === "syntheses" ? state.data.syntheses : state.data.papers;
    const cats = ["all", ...new Set(sourceList.map((i) => i.category))];
    if (!cats.includes(state.category)) state.category = "all";

    els.filters.innerHTML = cats
      .map(
        (cat) => `
        <button class="filter-chip ${state.category === cat ? "active" : ""}" data-cat="${esc(cat)}">
          ${cat === "all" ? "全部領域" : esc(cat)}
        </button>`
      )
      .join("");

    els.filters.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.dataset.cat;
        renderCategoryFilters();
        renderCurrentView();
      });
    });
  }

  function renderPapersView() {
    const items = filterItems(state.data.papers);
    if (!items.length) {
      els.view.innerHTML = `<div class="empty-state">找不到符合「${esc(state.query)}」的論文條目。</div>`;
      return;
    }

    els.view.innerHTML = `
      <div class="cards-grid">
        ${items
          .map(
            (p) => `
          <article class="card">
            <div class="card-meta">
              <span class="venue-badge">${esc(p.venue)}</span>
              <span class="cat-badge">${esc(p.category)}</span>
            </div>
            <h2 class="card-title"><a href="#entry/${esc(p.id)}">${esc(p.title)}</a></h2>
            <div class="semantic-box bottleneck">
              <span class="semantic-label">研究瓶頸 Bottleneck</span>
              ${esc(p.bottleneck_summary)}
            </div>
            <div class="semantic-box solution">
              <span class="semantic-label">核心解法 Solution</span>
              ${esc(p.solution_summary)}
            </div>
            <div class="modules-list">
              ${(p.combinable_modules || [])
                .map((m) => `<span class="module-pill">🧩 ${esc(m)}</span>`)
                .join("")}
            </div>
            <div class="card-footer">
              <div class="tag-row">
                ${(p.tags || [])
                  .slice(0, 4)
                  .map((t) => `<span class="tag">#${esc(t)}</span>`)
                  .join("")}
              </div>
              <a href="#entry/${esc(p.id)}" class="btn-link">查看詳情 →</a>
            </div>
          </article>`
          )
          .join("")}
      </div>`;
  }

  function renderMatrixView() {
    const items = filterItems(state.data.papers);
    if (!items.length) {
      els.view.innerHTML = `<div class="empty-state">找不到符合條件的論文資料。</div>`;
      return;
    }

    els.view.innerHTML = `
      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>論文 / 會議</th>
              <th>🔴 核心瓶頸 (Bottleneck)</th>
              <th>🟢 核心解法 (Solution)</th>
              <th>🧩 可組合積木</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (p) => `
              <tr>
                <td>
                  <strong><a href="#entry/${esc(p.id)}" class="btn-link">${esc(p.title)}</a></strong>
                  <div style="margin-top:4px;font-size:0.78rem;color:#64748b;">${esc(p.venue)} · ${esc(p.category)}</div>
                </td>
                <td>${esc(p.bottleneck_summary)}</td>
                <td>${esc(p.solution_summary)}</td>
                <td>
                  ${(p.combinable_modules || [])
                    .map((m) => `<div class="module-pill" style="margin-bottom:4px;">${esc(m)}</div>`)
                    .join("")}
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
  }

  function renderSynthesesView() {
    const items = filterItems(state.data.syntheses);
    if (!items.length) {
      els.view.innerHTML = `<div class="empty-state">找不到符合條件的組合構想。</div>`;
      return;
    }

    els.view.innerHTML = `
      <div class="cards-grid">
        ${items
          .map(
            (s) => `
          <article class="card">
            <div class="card-meta">
              <span class="venue-badge">Synthesis · ${esc((s.source_papers || []).length)} 篇融合</span>
              <span class="cat-badge">${esc(s.category)}</span>
            </div>
            <h2 class="card-title"><a href="#entry/${esc(s.id)}">${esc(s.title)}</a></h2>
            <div class="semantic-box bottleneck">
              <span class="semantic-label">切入缺口 Gap</span>
              ${esc(s.bottleneck_summary)}
            </div>
            <div class="semantic-box solution">
              <span class="semantic-label">融合架構 Synthesis</span>
              ${esc(s.solution_summary)}
            </div>
            <div class="modules-list">
              ${(s.source_papers || [])
                .map((pid) => `<a href="#entry/${esc(pid)}" class="module-pill" style="text-decoration:none;">📄 ${esc(pid)}</a>`)
                .join("")}
            </div>
            <div class="card-footer">
              <div class="tag-row">
                ${(s.tags || [])
                  .slice(0, 4)
                  .map((t) => `<span class="tag">#${esc(t)}</span>`)
                  .join("")}
              </div>
              <a href="#entry/${esc(s.id)}" class="btn-link">閱讀完整構想 →</a>
            </div>
          </article>`
          )
          .join("")}
      </div>`;
  }

  function generateSynthesisMarkdown(selectedPapers) {
    if (selectedPapers.length < 2) {
      return "請在左側至少勾選 2 篇論文，系統將自動產生符合 AGENTS.md 規範的 Synthesis Markdown 草案。";
    }
    const ids = selectedPapers.map((p) => p.id);
    const slug = `synthesis-${ids.slice(0, 2).join("-x-")}`;
    const tags = [...new Set(selectedPapers.flatMap((p) => p.tags || []))].slice(0, 6);
    const bottlenecks = selectedPapers
      .map((p) => `- **${p.id}**：${p.bottleneck_summary}`)
      .join("\n");
    const modules = selectedPapers
      .map((p) => `- **來自 ${p.id}**：${(p.combinable_modules || []).join("、")}`)
      .join("\n");

    return `---
id: ${slug}
title: "融合構想：${selectedPapers.map((p) => p.id).join(" × ")}"
category: "架構融合 (Architecture Synthesis)"
tags: [${tags.join(", ")}]
source_papers: [${ids.join(", ")}]
bottleneck_summary: "結合 ${ids.join(" 與 ")} 的互補瓶頸，解決單一論文未覆蓋的系統空白。"
solution_summary: "整合 ${selectedPapers.map((p) => (p.combinable_modules || [])[0] || p.id).join(" + ")}。"
related: [${ids.join(", ")}]
last_updated: "${new Date().toISOString().slice(0, 10)}"
---

## 組合動機與研究缺口
${bottlenecks}

## 融合架構設計
${modules}

## 新論文切入點 (Research Opportunity)
- 針對上述論文各自未解的盲區，將其可組合模組串接為端到端流程，並設計對照實驗驗證改善幅度。`;
  }

  function renderMixerView() {
    const papers = state.data.papers;
    const selected = papers.filter((p) => state.mixerSelected.has(p.id));
    const draft = generateSynthesisMarkdown(selected);

    els.view.innerHTML = `
      <div class="mixer-layout">
        <div class="mixer-panel">
          <h2>1. 勾選要組合的論文（已選 ${selected.length} 篇）</h2>
          <p style="font-size:0.86rem;color:var(--text-muted);margin-top:0;">
            勾選 2 篇以上論文，將它們的「研究瓶頸」與「可組合模組」融合為符合 <code>AGENTS.md</code> 規範的新條目草案。
          </p>
          ${papers
            .map((p) => {
              const isSel = state.mixerSelected.has(p.id);
              return `
              <label class="mixer-item ${isSel ? "selected" : ""}">
                <input type="checkbox" data-id="${esc(p.id)}" ${isSel ? "checked" : ""} />
                <div>
                  <strong>${esc(p.title)}</strong>
                  <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">
                    瓶頸：${esc(p.bottleneck_summary)}
                  </div>
                </div>
              </label>`;
            })
            .join("")}
        </div>

        <div class="mixer-panel mixer-output">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;">
            <h2 style="margin:0;">2. 自動生成 Synthesis 草案</h2>
            <button class="btn-primary" id="copy-draft-btn">複製 Markdown</button>
          </div>
          <p style="font-size:0.84rem;color:var(--text-muted);margin-top:0;">
            複製後存為 <code>entries/syntheses/&lt;slug&gt;.md</code> 並執行 <code>python scripts/build_wiki.py</code> 即可加入網站。
          </p>
          <pre id="mixer-draft">${esc(draft)}</pre>
        </div>
      </div>`;

    els.view.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.dataset.id;
        if (cb.checked) state.mixerSelected.add(id);
        else state.mixerSelected.delete(id);
        renderMixerView();
      });
    });

    const copyBtn = document.getElementById("copy-draft-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(draft);
          copyBtn.textContent = "已複製！";
          setTimeout(() => (copyBtn.textContent = "複製 Markdown"), 1500);
        } catch {
          copyBtn.textContent = "請手動選取複製";
        }
      });
    }
  }

  function renderRulesView() {
    els.view.innerHTML = `
      <div class="rules-grid">
        <div class="rules-box">
          <h3>📁 單一真相來源與目錄契約</h3>
          <p>本網站的所有資料皆來自 <code>entries/papers/*.md</code> 與 <code>entries/syntheses/*.md</code>。</p>
          <ul>
            <li>檔名強制採用全小寫 <code>kebab-case</code>，且必須與 Frontmatter 中的 <code>id</code> 一致。</li>
            <li>嚴禁直接修改 <code>data/wiki.json</code>，所有變更都必須透過編譯腳本生成。</li>
          </ul>
        </div>
        <div class="rules-box">
          <h3>⚙️ AI 擴充新頁面 SOP</h3>
          <ol>
            <li>讀取 <code>AGENTS.md</code> 與現有 <code>data/wiki.json</code>，避免重複或標籤不一致。</li>
            <li>依標準 Schema 建立新的 <code>.md</code> 條目（含瓶頸、解法、實驗數據、可組合模組）。</li>
            <li>同步更新相關條目的 <code>related</code> 欄位，維持雙向連結無孤島。</li>
            <li>執行 <code>python scripts/build_wiki.py</code> 驗證格式並重新編譯。</li>
          </ol>
        </div>
        <div class="rules-box">
          <h3>🎨 語意視覺與零建置原則</h3>
          <ul>
            <li><strong>紅色區塊</strong>：研究瓶頸 (Bottleneck)</li>
            <li><strong>藍綠色區塊</strong>：核心解法 (Solution)</li>
            <li><strong>靛藍色標籤</strong>：可組合模組與跨論文融合 (Synthesis)</li>
            <li>純靜態 HTML/CSS/JS，無須 Node/Webpack 即可直接部署至 GitHub Pages。</li>
          </ul>
        </div>
      </div>`;
  }

  function renderDetailView(id) {
    const item = getEntryById(id);
    if (!item) {
      els.view.innerHTML = `<div class="empty-state">找不到條目 <code>${esc(id)}</code>。<br/><a href="#papers" class="back-link">← 返回論文列表</a></div>`;
      return;
    }

    const backHash = item.kind === "synthesis" ? "#syntheses" : "#papers";
    const relatedItems = (item.related || []).map((rid) => getEntryById(rid)).filter(Boolean);

    els.view.innerHTML = `
      <a href="${backHash}" class="back-link">← 返回列表</a>
      <article class="detail-card">
        <div class="detail-header">
          <div class="card-meta" style="justify-content:flex-start;">
            <span class="venue-badge">${esc(item.venue || "Synthesis 融合分析")}</span>
            <span class="cat-badge">${esc(item.category)}</span>
            <span class="tag">更新：${esc(item.last_updated)}</span>
          </div>
          <h2>${esc(item.title)}</h2>
          <div class="tag-row">
            ${(item.tags || []).map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}
          </div>
        </div>

        <div class="detail-summary-grid">
          <div class="semantic-box bottleneck">
            <span class="semantic-label">研究瓶頸 Bottleneck</span>
            ${esc(item.bottleneck_summary)}
          </div>
          <div class="semantic-box solution">
            <span class="semantic-label">核心解法 Solution</span>
            ${esc(item.solution_summary)}
          </div>
        </div>

        ${
          item.combinable_modules
            ? `<div class="modules-list">${item.combinable_modules
                .map((m) => `<span class="module-pill">🧩 ${esc(m)}</span>`)
                .join("")}</div>`
            : ""
        }

        ${(item.sections || [])
          .map(
            (sec) => `
          <section class="detail-section">
            <h3>${esc(sec.heading)}</h3>
            <div class="md-content">${renderMarkdownBlock(sec.content)}</div>
          </section>`
          )
          .join("")}

        <section class="detail-section">
          <h3>雙向關聯條目 (${relatedItems.length})</h3>
          <div class="related-grid">
            ${relatedItems
              .map(
                (r) =>
                  `<a href="#entry/${esc(r.id)}" class="related-chip">${
                    r.kind === "synthesis" ? "🔗" : "📄"
                  } ${esc(r.title)}</a>`
              )
              .join("")}
          </div>
        </section>
      </article>`;
  }

  function renderCurrentView() {
    updateNav();
    if (state.entryId) {
      renderDetailView(state.entryId);
      return;
    }
    if (state.view === "papers") renderPapersView();
    else if (state.view === "matrix") renderMatrixView();
    else if (state.view === "syntheses") renderSynthesesView();
    else if (state.view === "mixer") renderMixerView();
    else if (state.view === "rules") renderRulesView();
  }

  function handleHashChange() {
    const hash = window.location.hash.replace(/^#/, "") || "papers";
    if (hash.startsWith("entry/")) {
      state.entryId = hash.slice("entry/".length);
    } else if (["papers", "matrix", "syntheses", "mixer", "rules"].includes(hash)) {
      state.view = hash;
      state.entryId = null;
      renderCategoryFilters();
    } else {
      state.view = "papers";
      state.entryId = null;
    }
    renderCurrentView();
  }

  async function init() {
    try {
      const res = await fetch("data/wiki.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.data = await res.json();

      const { paper_count, synthesis_count, tags } = state.data.meta;
      els.stats.textContent = `${paper_count} 篇論文 · ${synthesis_count} 篇融合構想 · ${tags.length} 個標籤`;

      els.search.addEventListener("input", (e) => {
        state.query = e.target.value;
        renderCurrentView();
      });

      window.addEventListener("hashchange", handleHashChange);
      handleHashChange();
    } catch (err) {
      els.view.innerHTML = `<div class="empty-state">無法載入 <code>data/wiki.json</code>（${esc(
        err.message
      )}）。若在本地開啟，請使用靜態伺服器（如 <code>python -m http.server</code>）。</div>`;
    }
  }

  init();
})();
