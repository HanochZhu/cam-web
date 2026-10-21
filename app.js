/**
 * cam (CodeAgent Memory) Web Introduction Interactive Engine
 * Zero external dependencies, pure ES6+, 60fps performance
 * Complete i18n support: en, zh, ja, ko, ar (with RTL)
 */

let currentLang = 'zh';

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initNavbarScroll();
  initSpotlightCards();
  initCopyButtons();
  initDualPlanePlayground();
  initSavingsCalculator();
  initIdeConfigurator();
  initFaqAccordion();
  initScrollReveal();
});

/* ==========================================================================
   0. Internationalization (i18n) Engine
   ========================================================================== */
function getCurrentDict() {
  if (window.CAM_TRANSLATIONS && window.CAM_TRANSLATIONS[currentLang]) {
    return window.CAM_TRANSLATIONS[currentLang];
  }
  return (window.CAM_TRANSLATIONS && window.CAM_TRANSLATIONS['zh']) || {};
}

function initI18n() {
  const supported = ['en', 'zh', 'ja', 'ko', 'ar'];
  const urlParams = new URLSearchParams(window.location.search);
  const requestedLang = urlParams.get('lang');
  const storedLang = localStorage.getItem('cam_lang');

  let targetLang = 'zh';

  if (requestedLang && supported.includes(requestedLang.toLowerCase())) {
    targetLang = requestedLang.toLowerCase();
  } else if (storedLang && supported.includes(storedLang.toLowerCase())) {
    targetLang = storedLang.toLowerCase();
  } else if (navigator.language) {
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith('zh')) targetLang = 'zh';
    else if (nav.startsWith('ja')) targetLang = 'ja';
    else if (nav.startsWith('ko')) targetLang = 'ko';
    else if (nav.startsWith('ar')) targetLang = 'ar';
    else targetLang = 'en';
  }

  setLanguage(targetLang, false);

  // Dropdown toggle
  const wrapper = document.querySelector('.lang-selector-wrapper');
  const menuBtn = document.getElementById('lang-menu-btn');
  const optionBtns = document.querySelectorAll('.lang-option-btn');

  if (menuBtn && wrapper) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrapper.classList.contains('open')) {
        wrapper.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang && lang !== currentLang) {
        setLanguage(lang, true);
      }
      if (wrapper) wrapper.classList.remove('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Listen to browser popstate (e.g. back/forward navigation)
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search);
    const l = p.get('lang');
    if (l && supported.includes(l.toLowerCase()) && l.toLowerCase() !== currentLang) {
      setLanguage(l.toLowerCase(), false);
    }
  });
}

function setLanguage(lang, updateUrl = true) {
  if (!window.CAM_TRANSLATIONS || !window.CAM_TRANSLATIONS[lang]) return;
  currentLang = lang;
  const dict = window.CAM_TRANSLATIONS[lang];

  // 1. HTML attributes (lang & dir for RTL)
  const isRtl = lang === 'ar';
  document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : lang;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

  // 2. Page Title & Meta
  if (dict.page_title) document.title = dict.page_title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict.page_desc) metaDesc.setAttribute('content', dict.page_desc);

  // 3. Text content replacement (data-i18n)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  // 4. HTML content replacement (data-i18n-html)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // 5. Attribute replacement (data-i18n-attr="attr:key|attr2:key2")
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const mappings = el.dataset.i18nAttr.split('|');
    mappings.forEach(m => {
      const [attr, key] = m.split(':');
      if (attr && key && dict[key] !== undefined) {
        el.setAttribute(attr, dict[key]);
      }
    });
  });

  // 6. Architecture diagram & documentation links
  const archImg = document.getElementById('arch-visual-img');
  if (archImg) {
    archImg.src = (lang === 'zh') ? 'docs/images/how-it-works.zh.svg' : 'docs/images/how-it-works.svg';
  }

  const agentsLink = document.getElementById('footer-link-agents');
  if (agentsLink) {
    agentsLink.href = (lang === 'zh')
      ? 'https://github.com/HanochZhu/codeagent_memory/blob/main/docs/agents.zh.md'
      : 'https://github.com/HanochZhu/codeagent_memory/blob/main/docs/agents.md';
  }
  const mcpLink = document.getElementById('footer-link-mcp');
  if (mcpLink) {
    mcpLink.href = (lang === 'zh')
      ? 'https://github.com/HanochZhu/codeagent_memory/blob/main/docs/mcp.zh.md'
      : 'https://github.com/HanochZhu/codeagent_memory/blob/main/docs/mcp.md';
  }

  // 7. Language Selector button label and active item
  const currentLangText = document.getElementById('current-lang-text');
  if (currentLangText && dict.current_lang_label) {
    currentLangText.textContent = dict.current_lang_label;
  }
  document.querySelectorAll('.lang-option-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // 8. Refresh dynamic interactive components
  refreshActiveGraphSlice();
  refreshActiveIdeConfig();
  if (typeof updateCalc === 'function') updateCalc();

  // 9. URL sync & storage
  localStorage.setItem('cam_lang', lang);
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  }
}

/* ==========================================================================
   1. Navbar Scrolled State
   ========================================================================== */
function initNavbarScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   2. Bento Spotlight Cards Hover Effect
   ========================================================================== */
function initSpotlightCards() {
  const cards = document.querySelectorAll('.spotlight-card, .bento-card');
  let rafId = null;

  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  });
}

/* ==========================================================================
   3. Clipboard Copy & Toast Feedback
   ========================================================================== */
function showToast(message) {
  const dict = getCurrentDict();
  const fallback = dict.toast_copied_generic || '已复制到剪贴板！';
  const text = message || fallback;

  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${text}</span>
  `;

  toast.classList.add('show');
  clearTimeout(toast.timeoutId);
  toast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function initCopyButtons() {
  document.querySelectorAll('[data-copy-target], [data-copy-text]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      let textToCopy = '';
      if (btn.dataset.copyText) {
        textToCopy = btn.dataset.copyText;
      } else if (btn.dataset.copyTarget) {
        const targetEl = document.querySelector(btn.dataset.copyTarget);
        if (targetEl) textToCopy = targetEl.innerText || targetEl.textContent;
      }

      const dict = getCurrentDict();
      let copyMsg = btn.dataset.copyMsg;
      if (btn.dataset.copyTarget === '#agent-prompt-text' && dict.toast_copied_prompt) {
        copyMsg = dict.toast_copied_prompt;
      } else if (btn.dataset.copyTarget === '#ide-config-json' && dict.toast_copied_json) {
        copyMsg = dict.toast_copied_json;
      } else if (btn.dataset.copyTarget === '#ide-config-subagent' && dict.toast_copied_subagent) {
        copyMsg = dict.toast_copied_subagent;
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
          showToast(copyMsg);
        }).catch(() => {
          fallbackCopyText(textToCopy, copyMsg);
        });
      }
    });
  });
}

function fallbackCopyText(text, copyMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(copyMsg);
  } catch (err) {
    console.error('Copy fallback failed', err);
  }
  document.body.removeChild(textArea);
}

/* ==========================================================================
   4. Interactive Dual-Plane Playground
   ========================================================================== */
const graphDemoData = {
  'main': {
    path: 'src/main.rs/main',
    type: 'function',
    fileTotalLines: 412,
    sliceLines: 24,
    tokensSurgical: 310,
    tokensFull: 5800,
    savedPercent: '94.6%',
    code: `pub fn main() -> Result<()> {
    let cli = Cli::parse();
    let project_root = resolve_project_root(&cli.project)?;

    match cli.command {
        Commands::Mcp => run_mcp_server(project_root),
        Commands::Recall(args) => run_recall(&project_root, args),
        Commands::Read(args) => run_surgical_read(&project_root, args),
        Commands::Ref(args) => run_ref_graph(&project_root, args),
        Commands::Index => rebuild_code_graph(&project_root),
        Commands::Sync => incremental_sync(&project_root),
    }
}`,
    callers: ['cli::entrypoint'],
    callees: ['run_mcp_server', 'run_recall', 'run_surgical_read', 'resolve_project_root']
  },
  'fuse_rrf': {
    path: 'src/memory/recall/fuse.rs/fuse_rrf',
    type: 'function',
    fileTotalLines: 711,
    sliceLines: 32,
    tokensSurgical: 420,
    tokensFull: 10400,
    savedPercent: '96.0%',
    code: `pub fn fuse_rrf(
    vector_hits: &[MemoryHit], 
    bm25_hits: &[MemoryHit], 
    k: f32,
    retention_curve: bool
) -> Vec<FusedResult> {
    // RRF Score: sum(1.0 / (k + rank)) scaled by (0.9 + 0.1 * retention)
    let mut scores = HashMap::new();
    
    apply_pruned_ranks(vector_hits, &mut scores, k, 0.80);
    apply_pruned_ranks(bm25_hits, &mut scores, k, 0.30);
    
    scores.into_iter()
        .map(|(id, rrf)| {
            let retention = calculate_ebbinghaus_r(id);
            let final_score = rrf * (0.9 + 0.1 * retention);
            FusedResult { id, score: final_score, retention }
        })
        .collect()
}`,
    callers: ['recall::execute_hybrid_recall'],
    callees: ['apply_pruned_ranks', 'calculate_ebbinghaus_r']
  },
  'trace_callers': {
    path: 'src/graph/callers.rs/trace_callers',
    type: 'function',
    fileTotalLines: 540,
    sliceLines: 19,
    tokensSurgical: 260,
    tokensFull: 7900,
    savedPercent: '96.7%',
    code: `pub fn trace_callers(
    db: &Connection, 
    target_symbol: &str, 
    dir: Direction
) -> Result<Vec<CallEdge>> {
    let mut stmt = db.prepare(
        "SELECT caller_id, callee_id, file_path, line_no 
         FROM code_edges 
         WHERE callee_id = ?1 AND edge_type = 'call'"
    )?;
    stmt.query_map([target_symbol], |row| CallEdge::from_row(row))
}`,
    callers: ['mcp::cam_ref', 'cli::cam_ref'],
    callees: ['db::prepare', 'CallEdge::from_row']
  }
};

let currentSymbolKey = 'main';

function refreshActiveGraphSlice() {
  const dict = getCurrentDict();
  const data = graphDemoData[currentSymbolKey];
  if (!data) return;

  const slicePath = document.getElementById('slice-path-display');
  const sliceCode = document.getElementById('slice-code-display');
  const sliceSurgicalTokens = document.getElementById('slice-tokens-surgical');
  const sliceFullTokens = document.getElementById('slice-tokens-full');
  const sliceSaved = document.getElementById('slice-saved-ratio');
  const callersList = document.getElementById('slice-callers');

  if (slicePath) slicePath.textContent = data.path;
  if (sliceCode) sliceCode.textContent = data.code;

  const surgicalSuffix = dict.slice_tokens_surgical_suffix || ' 行切片';
  const fullSuffix = dict.slice_tokens_full_suffix || ' 行整文件';

  if (sliceSurgicalTokens) sliceSurgicalTokens.textContent = `${data.tokensSurgical} tokens (${data.sliceLines}${surgicalSuffix})`;
  if (sliceFullTokens) sliceFullTokens.textContent = `${data.tokensFull} tokens (${data.fileTotalLines}${fullSuffix})`;

  if (sliceSaved) {
    if (dict.slice_saved_ratio) {
      sliceSaved.textContent = dict.slice_saved_ratio.replace('94.6%', data.savedPercent);
    } else {
      sliceSaved.textContent = `节省 ${data.savedPercent} Token`;
    }
  }

  if (callersList) {
    callersList.innerHTML = data.callers.map(c => `<span class="tree-badge">${c}</span>`).join(' ');
  }
}

const memoryDemoQueries = {
  'hybrid': {
    query: 'how does hybrid recall fuse BM25 and vectors',
    results: [
      {
        id: 'mem_01J9X8K4',
        summary: 'Hybrid recall fuses model2vec dense vectors and identifier-aware BM25 with RRF',
        body: 'Vectors provide semantic similarity while BM25 preserves exact token/camelCase matches. Both lists are filtered by top-score thresholds (80% vector, 30% BM25) and fused via Reciprocal Rank Fusion (k=60).',
        score: '1.98',
        vecScore: '0.94 (rank 1)',
        bm25Score: '0.88 (rank 1)',
        retention: '0.96 (S=11.9d)',
        status: 'latest'
      },
      {
        id: 'mem_01J9X8K5',
        summary: 'BM25 pre-filtering strips stop words and splits camelCase and snake_case',
        body: 'Identifiers like bundledToolSchemas are indexed as whole tokens and stems so queries on bundled tool schemas hit reliably.',
        score: '1.12',
        vecScore: '0.62 (rank 4)',
        bm25Score: '0.84 (rank 2)',
        retention: '0.91 (S=7.0d)',
        status: 'latest'
      }
    ]
  },
  'ebbinghaus': {
    query: 'ebbinghaus retention decay formula and stability',
    results: [
      {
        id: 'mem_01J9YA20',
        summary: 'Ebbinghaus retention formula R = exp(-t / S) gently weights final ranking',
        body: 'Final score = relevance * (0.9 + 0.1 * R). Retention impacts up to 10% of score. When R < 0.3, memory is flagged as needs_update. Each recall hit multiplies stability S by 1.7.',
        score: '1.95',
        vecScore: '0.96 (rank 1)',
        bm25Score: '0.82 (rank 1)',
        retention: '0.98 (S=19.2d)',
        status: 'latest'
      }
    ]
  },
  'subagent': {
    query: 'why subagents must use CLI instead of MCP',
    results: [
      {
        id: 'mem_01J9ZB12',
        summary: 'Subagents do not inherit MCP from host and must run cam --json CLI directly',
        body: 'Host IDEs (Cursor Task/explore, Claude Code bash subagents) only grant MCP to main session. Subagents run cam --json in shell, sharing the exact same .cam/cam.db SQLite store.',
        score: '1.92',
        vecScore: '0.91 (rank 1)',
        bm25Score: '0.86 (rank 1)',
        retention: '0.94 (S=14.0d)',
        status: 'latest'
      }
    ]
  }
};

function renderMemoryResults(key) {
  const dict = getCurrentDict();
  const data = memoryDemoQueries[key] || memoryDemoQueries['hybrid'];
  const queryInput = document.getElementById('mem-query-input');
  const resultsContainer = document.getElementById('mem-results-container');

  if (queryInput) queryInput.value = data.query;

  const rrfLabel = dict.mem_score_rrf_label || 'RRF 融合分: ';
  const vecLabel = dict.mem_score_vec_label || '向量分: ';
  const bm25Label = dict.mem_score_bm25_label || 'BM25 分: ';
  const retentionLabel = dict.mem_score_retention_label || '保留率 R: ';

  if (resultsContainer) {
    resultsContainer.innerHTML = data.results.map(r => `
      <div class="memory-card">
        <div class="memory-card-header">
          <span class="memory-id">${r.id}</span>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="terminal-badge success">${r.status}</span>
            <span class="memory-score-tag">${rrfLabel}${r.score}</span>
          </div>
        </div>
        <div class="memory-summary">${r.summary}</div>
        <div class="memory-body">${r.body}</div>
        <div class="memory-meta-footer">
          <span>${vecLabel}${r.vecScore}</span>
          <span>·</span>
          <span>${bm25Label}${r.bm25Score}</span>
          <span>·</span>
          <span>${retentionLabel}${r.retention}</span>
        </div>
      </div>
    `).join('');
  }
}

function initDualPlanePlayground() {
  // Tab switcher
  const tabs = document.querySelectorAll('.playground-tab');
  const panes = document.querySelectorAll('.plane-content-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.planeTarget);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Tree nodes
  const treeNodes = document.querySelectorAll('.tree-node-item');
  treeNodes.forEach(node => {
    node.addEventListener('click', () => {
      treeNodes.forEach(n => n.classList.remove('selected'));
      node.classList.add('selected');

      currentSymbolKey = node.dataset.symbolKey;
      refreshActiveGraphSlice();
    });
  });

  // Memory query simulator
  const queryInput = document.getElementById('mem-query-input');
  const queryChips = document.querySelectorAll('.sample-chip');
  const runBtn = document.getElementById('btn-run-query');

  queryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.queryKey;
      renderMemoryResults(key);
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (queryInput) {
        const val = queryInput.value.toLowerCase();
        if (val.includes('ebbinghaus') || val.includes('decay')) {
          renderMemoryResults('ebbinghaus');
        } else if (val.includes('subagent') || val.includes('cli')) {
          renderMemoryResults('subagent');
        } else {
          renderMemoryResults('hybrid');
        }
      }
    });
  }

  if (queryInput) {
    queryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = queryInput.value.toLowerCase();
        if (val.includes('ebbinghaus') || val.includes('decay')) {
          renderMemoryResults('ebbinghaus');
        } else if (val.includes('subagent') || val.includes('cli')) {
          renderMemoryResults('subagent');
        } else {
          renderMemoryResults('hybrid');
        }
      }
    });
  }

  // Initial render
  refreshActiveGraphSlice();
  renderMemoryResults('hybrid');
}

/* ==========================================================================
   5. Interactive Token & Cost Savings Calculator
   ========================================================================== */
let updateCalc = () => {};

function initSavingsCalculator() {
  const slider = document.getElementById('calc-turn-slider');
  const turnsDisplay = document.getElementById('calc-turns-val');
  const dailyTokensDisplay = document.getElementById('calc-daily-tokens');
  const monthlyCostDisplay = document.getElementById('calc-monthly-cost');
  const latencyDisplay = document.getElementById('calc-latency-reduction');

  if (!slider) return;

  updateCalc = function() {
    const dict = getCurrentDict();
    const turns = parseInt(slider.value, 10);
    const suffix = dict.calc_turns_suffix || ' 轮';
    if (turnsDisplay) turnsDisplay.textContent = `${turns}${suffix}`;

    // Tokens saved per turn ≈ 53,500
    const dailySaved = turns * 53500;
    const monthlyTokens = dailySaved * 30;
    const monthlyDollars = (monthlyTokens / 1_000_000) * 3.0;

    if (dailyTokensDisplay) {
      if (dailySaved >= 1_000_000) {
        dailyTokensDisplay.textContent = `${(dailySaved / 1_000_000).toFixed(1)}M`;
      } else {
        dailyTokensDisplay.textContent = `${Math.round(dailySaved / 1000)}K`;
      }
    }

    if (monthlyCostDisplay) {
      monthlyCostDisplay.textContent = `$${Math.round(monthlyDollars)}`;
    }

    if (latencyDisplay) {
      latencyDisplay.textContent = `P95 ~5.2ms`;
    }
  };

  slider.addEventListener('input', updateCalc);
  updateCalc();
}

/* ==========================================================================
   6. IDE Host Configurator Tabs
   ========================================================================== */
const ideConfigs = {
  cursor: {
    name: 'Cursor',
    configPath: '.cursor/mcp.json',
    mcpJson: `{
  "mcpServers": {
    "cam": {
      "command": "cam",
      "args": ["mcp"]
    }
  }
}`
  },
  claude: {
    name: 'Claude Code',
    configPath: '.mcp.json (or claude mcp add)',
    mcpJson: `{
  "mcpServers": {
    "cam": {
      "command": "cam",
      "args": ["mcp"]
    }
  }
}`
  },
  windsurf: {
    name: 'Windsurf',
    configPath: '~/.codeium/windsurf/mcp_config.json',
    mcpJson: `{
  "mcpServers": {
    "cam": {
      "command": "cam",
      "args": ["mcp"]
    }
  }
}`
  },
  codex: {
    name: 'Codex',
    configPath: '~/.codex/config.toml',
    mcpJson: `[mcp_servers.cam]
command = "cam"
args = ["mcp"]`
  },
  vscode: {
    name: 'VS Code (Copilot / Cline / Continue)',
    configPath: '.vscode/mcp.json',
    mcpJson: `{
  "mcpServers": {
    "cam": {
      "command": "cam",
      "args": ["mcp"]
    }
  }
}`
  },
  jetbrains: {
    name: 'JetBrains (IntelliJ / RustRover)',
    configPath: 'AI Assistant → MCP Settings',
    mcpJson: `{
  "name": "cam",
  "command": "cam",
  "args": ["mcp"]
}`
  }
};

let currentIdeKey = 'cursor';

function refreshActiveIdeConfig() {
  const dict = getCurrentDict();
  const config = ideConfigs[currentIdeKey];
  if (!config) return;

  const pathDisplay = document.getElementById('ide-config-path');
  const jsonDisplay = document.getElementById('ide-config-json');
  const subagentDisplay = document.getElementById('ide-config-subagent');
  const hintDisplay = document.getElementById('ide-config-hint');

  if (pathDisplay) pathDisplay.textContent = config.configPath;
  if (jsonDisplay) jsonDisplay.textContent = config.mcpJson;

  const subagentKey = `ide_subagent_${currentIdeKey}`;
  const hintKey = `ide_hint_${currentIdeKey}`;

  if (subagentDisplay) {
    if (dict[subagentKey]) {
      subagentDisplay.textContent = dict[subagentKey];
    } else {
      subagentDisplay.textContent = `Subagent (Task / explore) runs cam --json in terminal:\n\ncam --json --project /path/to/repo <command>`;
    }
  }

  if (hintDisplay && dict[hintKey]) {
    hintDisplay.textContent = dict[hintKey];
  }
}

function initIdeConfigurator() {
  const tabBtns = document.querySelectorAll('.ide-tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentIdeKey = btn.dataset.ideKey;
      refreshActiveIdeConfig();
    });
  });

  refreshActiveIdeConfig();
}

/* ==========================================================================
   7. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqCards = document.querySelectorAll('.faq-card');

  faqCards.forEach(card => {
    const question = card.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      faqCards.forEach(c => c.classList.remove('open'));
      if (!isOpen) {
        card.classList.add('open');
      }
    });
  });
}

/* ==========================================================================
   8. Scroll Reveal Animation (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll('.fade-in-up');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}
