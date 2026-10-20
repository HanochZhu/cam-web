# DESIGN.md — cam (CodeAgent Memory) Web Introduction Design System

> "Stop Grepping. Start Surgical Reading." — 专为 AI Coding Agent 打造的本地多轮对话记忆与代码图系统。

---

## 1. Visual Theme & Atmosphere

- **Style**: Dark Tech / Developer-First Cybernetic Minimal (暗黑极客科技风)
- **Keywords**: 深邃、霓虹微光、高密度工程感、毫秒级响应、局部手术式精准、代码拓扑图
- **Tone**: 精准、极客、克制且充满工程张力 — NOT 浮夸游戏风、NOT 刺眼彩虹渐变、NOT 笨重企业后台
- **Feel**: 如同在深空工作站的高精终端中，一束冷青与电光紫色的光纤探针精准切入百万行代码网络，既沉静内敛又充满算力爆发感。
- **Interaction Tier**: L2 流畅交互（微光聚光灯、双平面互动演示、终端对比模拟器、Agent 宿主配置生成器、卡片悬浮提升）
- **Dependencies**: 零外部 JS 库（原生现代 Vanilla HTML5 + CSS3 + 纯原生 ES 脚本，60fps 无卡顿，即开即用）

---

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #070B14;                                /* 主背景：极深靛青黑 */
  --bg-secondary: #0B1120;                      /* 次级背景：深舱黑 */
  --surface: #0E172A;                          /* 卡片与模块表面 */
  --surface-alt: #131E36;                      /* 交互状态表面 / 次级卡片 */
  --surface-hover: #182544;                    /* 悬停态表面 */

  /* Borders */
  --border: rgba(96, 230, 255, 0.12);          /* 默认微弱发光边框 */
  --border-hover: rgba(96, 230, 255, 0.35);    /* 悬停强调边框 */
  --border-subtle: rgba(255, 255, 255, 0.06);  /* 辅助分割线 */

  /* Text Hierarchy */
  --text: #F3F7FC;                             /* 主标题与关键文字 */
  --text-secondary: #94A3B8;                   /* 正文与次要说明 */
  --text-tertiary: #64748B;                    /* 标签、时间戳与次级注释 */
  --text-muted: #475569;                       /* 辅助占位与弱化元素 */

  /* Accent Colors (Branded from logo.svg) */
  --accent: #60E6FF;                           /* 主品牌青蓝（Neon Cyan） */
  --accent-hover: #8DEEFF;                      /* 悬停微亮青 */
  --accent-purple: #6C7CFF;                    /* 次品牌电光紫（Electric Indigo） */
  --accent-gradient: linear-gradient(135deg, #60E6FF 0%, #6C7CFF 100%);
  --accent-gradient-glow: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(96, 230, 255, 0.12), transparent 40%);

  /* RGB variants for rgba() computations */
  --bg-rgb: 7, 11, 20;
  --surface-rgb: 14, 23, 42;
  --accent-rgb: 96, 230, 255;
  --accent-purple-rgb: 108, 124, 255;

  /* Semantic */
  --success: #10B981;                          /* 成功/通过绿 */
  --success-rgb: 16, 185, 129;
  --warning: #F59E0B;                          /* 警告/注意橙 */
  --error: #EF4444;                            /* 错误/劣势红 */
  --code-bg: #090E1A;                          /* 终端与代码块背景 */
}
```

**Color Rules:**
1. 所有颜色必须严格通过 CSS 变量（`var(--*)`）引用，全站严禁硬编码 hex 颜色。
2. 强调色以青蓝（`--accent`）作为行为引导（CTA、活跃 Tab、关键高亮），电光紫（`--accent-purple`）作为结构与记忆图谱辅助色。
3. 警告与错误色（红/绿）仅用于基准测试对比与终端模拟器（如 63,000 tokens vs 1,000 tokens）。

---

## 3. Typography Rules

**Font Stack:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap');
```

| Role | Font Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Hero H1 | Inter, Noto Sans SC, sans-serif | 3.5rem (56px) | 800 | 1.15 | -0.03em |
| Section H2 | Inter, Noto Sans SC, sans-serif | 2.25rem (36px) | 700 | 1.25 | -0.02em |
| Card H3 | Inter, Noto Sans SC, sans-serif | 1.25rem (20px) | 600 | 1.4 | -0.01em |
| Body / Lead | Inter, Noto Sans SC, sans-serif | 1.05rem (17px) | 400 | 1.7 | 0.01em |
| Body / Small | Inter, Noto Sans SC, sans-serif | 0.9rem (14.5px) | 400 | 1.6 | 0 |
| Mono / Code | Fira Code, monospace | 0.875rem (14px) | 500 | 1.6 | 0 |
| Label / Badge | Inter, sans-serif | 0.75rem (12px) | 600 | 1.2 | 0.05em (UPPERCASE) |

**Typography Rules:**
- 中文排版：`Noto Sans SC` 结合 `Inter`，行高保持 ≥ 1.7，保障极佳的代码和文本可读性。
- 代码与虚拟路径必须使用 `Fira Code` 并启用等宽数字与连字支持。
- **NEVER use**: Comic Sans, Papyrus, 纯英文字体在中文回退为宋体、过细字重 (< 400)。

**Text Decoration:**
- Hero H1：使用品牌双色渐变裁切（`background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`）。
- 正文与二级标题：坚决保持纯色，绝不滥用全篇彩虹字。

---

## 4. Component Stylings

### Buttons
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #070B14;
  background: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
}
.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.4);
  transform: translateY(-2px);
}
.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--border-hover);
  color: var(--accent);
  transform: translateY(-2px);
}
```

### Cards & Bento Spotlight
```css
.spotlight-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 28px;
  overflow: hidden;
  transition: border-color 0.3s ease, transform 0.25s ease;
}
.spotlight-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(400px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(96, 230, 255, 0.12), transparent 45%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.spotlight-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-3px);
}
.spotlight-card:hover::before {
  opacity: 1;
}
```

### Terminal Simulator Frame
```css
.terminal-window {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  font-family: 'Fira Code', monospace;
}
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--border-subtle);
}
```

### Copy Badges & Quick Command Box
```css
.copy-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(14, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 16px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.copy-pill:hover {
  border-color: var(--accent);
  color: var(--text);
  background: rgba(96, 230, 255, 0.05);
}
```

---

## 5. Layout Principles

- **Max Container Width**: 1200px (居中对齐，自适应留白)
- **Container Padding**: 移动端 20px，桌面端 32px
- **Vertical Rhythm**:
  - Section Spacing: 100px - 140px
  - Title to Content Gap: 48px - 64px
  - Card Inner Padding: 24px - 32px
- **Grid Layout**: 弹性 Bento Grid（12 列网格，支持跨 4 列、6 列、8 列的不对称高级编排）

---

## 6. Depth & Elevation

| Level | Treatment | Use Case |
|---|---|---|
| L0 (Base) | 纯背景 `--bg` + 极细暗纹网格 | 页面底座 |
| L1 (Surface) | `--surface` + 1px `--border-subtle` | 默认内容卡片、次要模块 |
| L2 (Elevated) | `--surface` + 1px `--border` + 16px 投影 | 交互式 Playground、活动卡片 |
| L3 (Highlight) | 48px 模糊软投影 + 渐变边框 + 霓虹发光 | Hero 终端对比窗、突出展示卡片 |

---

## 7. Animation & Interaction (L2 流畅交互)

- **Philosophy**: 精准、轻快、无感知迟滞。遵循物理惯性，严禁为了动而动。
- **Entrance Animation**: CSS 类 `.fade-in-up` 配合 `IntersectionObserver` 逐屏 reveal，每次位移不超过 18px，时延 0.4s。
- **Spotlight Tracking**: 鼠标进入 Bento 卡片时，通过 `rAF` 节流更新 CSS 变量 `--mouse-x` 与 `--mouse-y`，呈现柔和聚光灯。
- **Interactive Dual Plane**:
  - Tab 1: **代码图 (Code Graph)** — 模拟 Agent 虚拟路径穿透：点击文件大纲展开为切片符号源码，并即时呈现 1-hop 调用关系。
  - Tab 2: **记忆树 (Memory Tree)** — 模拟 RRF 混合打分器：展示不同 Query 下向量检索、BM25 分词与艾宾浩斯遗忘衰减的加权曲线。
- **Host Config Switcher**: 点击 Cursor、Claude Code、Windsurf、Copilot 等宿主 Tab，即时无闪烁切换对应 MCP 配置及 Subagent 一句话指令。
- **Reduced Motion 降级**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 8. Do's and Don'ts

### Do
1. 所有数据（评测基准、Token 节省比例、延迟指标）均严格遵循 `codeagent_memory` 官方实测结论。
2. 突出“主 Agent (MCP) + Subagent (CLI)”的双门并立架构与 100% 本地 SQLite 本质。
3. 提供极其便捷的“一键复制 Agent Prompt 安装”体验，带有即时 Toast 反馈。
4. 提供移动端极佳的横向防溢出处理与触控热区保证。
5. 所有图标采用内联简洁高质感 SVG，保证高 DPI 屏幕下绝对锐利。

### Don't
1. ❌ 绝对不要硬编码任何 hex 颜色。
2. ❌ 绝对不要使用外部重量级 NPM 打包依赖阻碍直接打开，保证独立单页随时能在本地或 GitHub Pages 极速渲染。
3. ❌ 绝对不要出现纯色块占位或低质假图。
4. ❌ 绝对不要使用刺眼高频闪烁动画。
5. ❌ 绝对不要滥用弹窗中断用户阅读动线。
6. ❌ 绝对不要在中文正文中缺少合理行高导致文字拥挤。
7. ❌ 绝对不要缺失 hover / active / focus / disabled 等完整交互状态。
8. ❌ 绝对不要将 `cam` 称为“云端 SaaS”或“付费商业软件”，必须明确 100% 本地开源、零 API 开销。

---

## 9. Responsive Behavior

- **Desktop (≥ 1024px)**: 完整 12 列 Bento Grid，双列终端横向对比，宽屏拓扑交互。
- **Tablet (768px - 1023px)**: 终端自适应单列堆叠，Bento 自动变为双列，维持 24px 边距。
- **Mobile (< 768px)**:
  - 导航栏自适应为紧凑折叠 / 极简模式。
  - 核心对比卡片按单列呈现，字体按比例自适应（Hero H1 从 3.5rem 响应式平滑降至 2.2rem）。
  - 所有按钮与点击目标尺寸 ≥ 44px × 44px，完全消除横向滚动条（0 horizontal overflow）。
