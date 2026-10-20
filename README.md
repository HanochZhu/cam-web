# cam-web — Official Website & Showcase for cam (CodeAgent Memory)

<div align="center">
  <img src="assets/logo.svg" alt="cam logo" width="96" height="96">
  <h3>Stop Grepping. Start Surgical Reading.</h3>
  <p>专为 AI 编程 Agent 打造的本地多轮对话记忆与代码图系统官方介绍网页</p>
</div>

---

## 概述

本项目是 [cam (CodeAgent Memory)](https://github.com/HanochZhu/codeagent_memory) 的官方展示网页仓库，旨在为开发者和 AI Coding Agent 用户提供清晰、直观、可交互的网页端介绍。

网页包含：
- **Hero 对抗视窗**：真实模拟传统 Agent 全文件倾倒（63,000+ tokens 且跨会话失忆）vs cam 赋能 Agent（精准 24 行切片 + 毫秒级记忆秒回，节省 98% Token）。
- **一句话 Agent 安装提示词**：一键复制给 Cursor、Claude Code、Codex 等智能体即可全自动编译安装建图。
- **交互式 Dual-Plane 游乐场**：
  - **代码图（Code Graph）**：可操作的虚拟文件系统（`cam ls` ➔ `cam read src/main.rs/main` ➔ `cam ref`），查看切片与整文件 Token 对比。
  - **记忆树（Memory Tree）**：输入或点击示例问题，实时演示向量与 BM25 的 RRF 融合打分与艾宾浩斯记忆保留衰减曲线（$R = e^{-t/S}$）。
- **Bento 微光跟踪光卡片**：100% 本地 SQLite、虚拟路径精准读取、原子事实知识图谱、艾宾浩斯抗遗忘、MCP+CLI 双接口架构、增量监听同步。
- **宿主 IDE 专属一键装配面板**：针对 Cursor、Claude Code、Windsurf、Codex、VS Code Copilot 与 JetBrains 提供开箱即用的配置与 Subagent 终端指令。
- **Token 与成本节省计算器**：动态拖动滑块直观计算每日/每月节省的 Token 与 API 费用。

---

## 本地预览

本项目采用原生现代 Web 标准（Vanilla HTML5 + CSS3 + 纯原生 ES6+），无需安装繁重的 NPM 依赖或构建工具。

你可以使用任何本地静态服务器打开：

```bash
# 使用 Python 快速启动本地预览
python3 -m http.server 8080

# 或使用 Node / npx
npx serve .
```

在浏览器打开 `http://localhost:8080` 即可浏览。

---

## 部署到 GitHub Pages

### 方式一：GitHub 仓库 Settings 直出（推荐）
1. 在 GitHub 上新建仓库（如 `cam-web`），将本项目推送到 `main` 分支。
2. 进入仓库 **Settings** ➔ **Pages**。
3. 在 **Build and deployment** 下，选择 **Deploy from a branch**。
4. Branch 选择 `main`，Folder 选择 `/ (root)`，点击 **Save**。
5. 几秒后即可通过 `https://<your-username>.github.io/cam-web` 访问。

### 方式二：使用 GitHub Actions 自动发布
仓库中已内置 `.github/workflows/deploy.yml` 自动化工作流，每次 push 到 `main` 分支即可自动发布到 GitHub Pages。

---

## 项目结构

```text
cam-web/
├── index.html                  # 语义化响应式单页
├── styles.css                  # 严格遵循 DESIGN.md 的暗黑科技风设计规范
├── app.js                      # 交互引擎（双平面游乐场、Spotlight 跟踪、Token 计算器）
├── DESIGN.md                   # 完整的 9 章节 UI/UX 视觉与交互规范
├── assets/                     # 矢量 logo 与品牌图标
├── docs/images/                # 架构原理 SVG 拓扑图
└── .github/workflows/deploy.yml # GitHub Pages 自动化发布 Action
```

---

## 关联项目

- 核心系统：[HanochZhu/codeagent_memory](https://github.com/HanochZhu/codeagent_memory) (Rust 内核, MCP + CLI)
- 许可证：[MIT License](https://opensource.org/licenses/MIT)
