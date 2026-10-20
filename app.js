/**
 * cam (CodeAgent Memory) Web Introduction Interactive Engine
 * Zero external dependencies, pure ES6+, 60fps performance
 */

document.addEventListener('DOMContentLoaded', () => {
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
function showToast(message = '已复制到剪贴板！') {
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
    <span>${message}</span>
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

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
          showToast(btn.dataset.copyMsg || '已复制到剪贴板！');
        }).catch(() => {
          fallbackCopyText(textToCopy);
        });
      }
    });
  });
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('已复制到剪贴板！');
  } catch (err) {
    console.error('Copy fallback failed', err);
  }
  document.body.removeChild(textArea);
}

/* ==========================================================================
   4. Interactive Dual-Plane Playground (爆点 2)
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

  // Plane 1: Code Graph Explorer Nodes
  const treeNodes = document.querySelectorAll('.tree-node-item');
  const slicePath = document.getElementById('slice-path-display');
  const sliceCode = document.getElementById('slice-code-display');
  const sliceSurgicalTokens = document.getElementById('slice-tokens-surgical');
  const sliceFullTokens = document.getElementById('slice-tokens-full');
  const sliceSaved = document.getElementById('slice-saved-ratio');
  const callersList = document.getElementById('slice-callers');

  treeNodes.forEach(node => {
    node.addEventListener('click', () => {
      treeNodes.forEach(n => n.classList.remove('selected'));
      node.classList.add('selected');

      const key = node.dataset.symbolKey;
      const data = graphDemoData[key];
      if (!data) return;

      if (slicePath) slicePath.textContent = data.path;
      if (sliceCode) sliceCode.textContent = data.code;
      if (sliceSurgicalTokens) sliceSurgicalTokens.textContent = `${data.tokensSurgical} tokens (${data.sliceLines} 行切片)`;
      if (sliceFullTokens) sliceFullTokens.textContent = `${data.tokensFull} tokens (${data.fileTotalLines} 行整文件)`;
      if (sliceSaved) sliceSaved.textContent = `节省 ${data.savedPercent} Token`;
      if (callersList) {
        callersList.innerHTML = data.callers.map(c => `<span class="tree-badge">${c}</span>`).join(' ');
      }
    });
  });

  // Plane 2: Memory Query Simulator
  const queryInput = document.getElementById('mem-query-input');
  const queryChips = document.querySelectorAll('.sample-chip');
  const resultsContainer = document.getElementById('mem-results-container');

  function renderMemoryResults(key) {
    const data = memoryDemoQueries[key] || memoryDemoQueries['hybrid'];
    if (queryInput) queryInput.value = data.query;

    if (resultsContainer) {
      resultsContainer.innerHTML = data.results.map(r => `
        <div class="memory-card">
          <div class="memory-card-header">
            <span class="memory-id">${r.id}</span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="terminal-badge success">${r.status}</span>
              <span class="memory-score-tag">RRF 融合分: ${r.score}</span>
            </div>
          </div>
          <div class="memory-summary">${r.summary}</div>
          <div class="memory-body">${r.body}</div>
          <div class="memory-meta-footer">
            <span>向量分: ${r.vecScore}</span>
            <span>·</span>
            <span>BM25 分: ${r.bm25Score}</span>
            <span>·</span>
            <span>保留率 R: ${r.retention}</span>
          </div>
        </div>
      `).join('');
    }
  }

  queryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.queryKey;
      renderMemoryResults(key);
    });
  });

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
}

/* ==========================================================================
   5. Interactive Token & Cost Savings Calculator (巧思 1)
   ========================================================================== */
function initSavingsCalculator() {
  const slider = document.getElementById('calc-turn-slider');
  const turnsDisplay = document.getElementById('calc-turns-val');
  const dailyTokensDisplay = document.getElementById('calc-daily-tokens');
  const monthlyCostDisplay = document.getElementById('calc-monthly-cost');
  const latencyDisplay = document.getElementById('calc-latency-reduction');

  if (!slider) return;

  function updateCalc() {
    const turns = parseInt(slider.value, 10);
    if (turnsDisplay) turnsDisplay.textContent = `${turns} 轮`;

    // Without cam: ~55,000 tokens dumped per turn (code grep/read + context history)
    // With cam: ~1,500 tokens surgical read + recall
    // Tokens saved per turn ≈ 53,500
    const dailySaved = turns * 53500;
    const monthlyTokens = dailySaved * 30;
    
    // Average API cost: ~$3.00 / 1M tokens (blended input/output for Claude Sonnet 3.5 / GPT-4o)
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
  }

  slider.addEventListener('input', updateCalc);
  updateCalc();
}

/* ==========================================================================
   6. IDE Host Configurator Tabs
   ========================================================================== */
const ideConfigs = {
  cursor: {
    name: 'Cursor',
    configPath: '.cursor/mcp.json (或 ~/.cursor/mcp.json)',
    mcpJson: `{
  "mcpServers": {
    "cam": {
      "command": "cam",
      "args": ["mcp"]
    }
  }
}`,
    subagentPrompt: `Subagent (Task / explore) 无法继承 MCP，在终端中直接执行：\n\ncam --json --project /path/to/repo <command>`,
    docHint: '在 Cursor Agent 中粘贴一句话安装 Prompt，即可全自动配置。'
  },
  claude: {
    name: 'Claude Code',
    configPath: '.mcp.json (或 claude mcp add)',
    mcpJson: `{
  "mcpServers": {
    "cam": {
      "command": "cam",
      "args": ["mcp"]
    }
  }
}`,
    subagentPrompt: `或者通过 CLI 注册：\nclaude mcp add cam -- cam mcp\n\nSubagent 执行：cam --json <command>`,
    docHint: '原生支持 stdio JSON-RPC，一键即用。'
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
}`,
    subagentPrompt: `Cascade 智能体调用 cam MCP；Shell 脚本调用 cam --json`,
    docHint: '将配置填入 windsurf/mcp_config.json 即可生效。'
  },
  codex: {
    name: 'Codex',
    configPath: '~/.codex/config.toml',
    mcpJson: `[mcp_servers.cam]
command = "cam"
args = ["mcp"]`,
    subagentPrompt: `codex exec 命令中调用：cam --json <command>`,
    docHint: '使用 TOML 格式配置文件注册。'
  },
  vscode: {
    name: 'VS Code (Copilot / Cline / Continue)',
    configPath: '.vscode/mcp.json 或 ~/.continue/config.yaml',
    mcpJson: `{
  "mcpServers": {
    "cam": {
      "command": "cam",
      "args": ["mcp"]
    }
  }
}`,
    subagentPrompt: `Cline / Continue 开启终端访问后，子脚本调用 cam --json`,
    docHint: '与标准 MCP 客户端规范 100% 兼容。'
  },
  jetbrains: {
    name: 'JetBrains (IntelliJ / RustRover / GoLand)',
    configPath: 'AI Assistant → MCP 插件配置',
    mcpJson: `{
  "name": "cam",
  "command": "cam",
  "args": ["mcp"]
}`,
    subagentPrompt: `内置终端中执行：cam index && cam recall "query"`,
    docHint: '若 IDE PATH 环境变量未包含 cargo/bin，填写 cam 绝对路径。'
  }
};

function initIdeConfigurator() {
  const tabBtns = document.querySelectorAll('.ide-tab-btn');
  const pathDisplay = document.getElementById('ide-config-path');
  const jsonDisplay = document.getElementById('ide-config-json');
  const subagentDisplay = document.getElementById('ide-config-subagent');
  const hintDisplay = document.getElementById('ide-config-hint');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const ideKey = btn.dataset.ideKey;
      const config = ideConfigs[ideKey];
      if (!config) return;

      if (pathDisplay) pathDisplay.textContent = config.configPath;
      if (jsonDisplay) jsonDisplay.textContent = config.mcpJson;
      if (subagentDisplay) subagentDisplay.textContent = config.subagentPrompt;
      if (hintDisplay) hintDisplay.textContent = config.docHint;
    });
  });
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
      // Optional: close other cards
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
