# Project Brain 安装指南

本文档面向 AI 助手，介绍如何安装和使用 Project Brain MCP Server。

---

## 1. 快速安装

在任意项目的根目录执行：

```bash
npx -y github:huanghe/project-brain
```

这将直接通过 GitHub 仓库安装并运行 MCP Server。

---

## 2. MCP Client 配置

### 2.1 通用配置

在 AI 助手的 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "project-brain": {
      "command": "npx",
      "args": ["-y", "github:huanghe/project-brain"]
    }
  }
}
```

### 2.2 常见 AI 助手配置位置

| AI 助手 | 配置文件位置 |
|---------|-------------|
| OpenCode | `~/.opencode/mcp.json` |
| Cursor | `~/.cursor/settings.json` (MCP 配置区域) |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Zed | `~/.config/zed/mcp.json` |

---

## 3. 初始化项目

首次使用需要初始化 Project Brain。调用 `brain_init` 工具：

```json
{
  "answers": {
    "project_name": "你的项目名称",
    "one_liner": "一句话描述项目",
    "goals": ["目标1", "目标2"],
    "constraints": ["约束1", "约束2"],
    "tech_stack": ["技术栈1", "技术栈2"]
  }
}
```

### 最小必需参数

```json
{
  "answers": {
    "project_name": "MyProject",
    "one_liner": "一个很棒的项目"
  }
}
```

---

## 4. 可用工具

| 工具名 | 功能 |
|--------|------|
| `brain_init` | 初始化项目脑 |
| `brain_context` | 生成 AI 可读的项目上下文 |
| `brain_recent_activity` | 获取最近 Git 活动 |
| `brain_capture_note` | 记录项目笔记 |
| `brain_record_progress` | 记录进度/决策/里程碑 |
| `brain_estimate_progress` | 估算里程碑进度 |
| `brain_suggest_actions` | 推荐下一步行动 |

---

## 5. 典型使用场景

### 5.1 理解项目

```json
{
  "name": "brain_context",
  "arguments": {
    "depth": "normal",
    "include_recent_activity": true
  }
}
```

### 5.2 记录里程碑

```json
{
  "name": "brain_record_progress",
  "arguments": {
    "type": "milestone",
    "milestone": {
      "name": "功能完成",
      "status": "in_progress",
      "confidence": "high"
    }
  }
}
```

### 5.3 记录决策

```json
{
  "name": "brain_record_progress",
  "arguments": {
    "type": "decision",
    "decision": {
      "decision": "使用 MCP 协议",
      "reason": "便于 AI 助手调用"
    }
  }
}
```

### 5.4 记录进度

```json
{
  "name": "brain_record_progress",
  "arguments": {
    "type": "progress",
    "progress": {
      "summary": "完成了用户认证模块",
      "confidence": "high"
    }
  }
}
```

### 5.5 记录笔记

```json
{
  "name": "brain_capture_note",
  "arguments": {
    "note": "需要优化数据库查询性能",
    "tags": ["优化", "性能"]
  }
}
```

### 5.6 估算进度

```json
{
  "name": "brain_estimate_progress",
  "arguments": {
    "recent_commits": 50
  }
}
```

### 5.7 推荐下一步行动

```json
{
  "name": "brain_suggest_actions",
  "arguments": {
    "limit": 5
  }
}
```

---

## 6. 数据存储

Project Brain 会在项目根目录创建 `.project-brain/` 文件夹：

```
.project-brain/
├── manifest.json      # 项目初始化信息
├── milestones.json    # 里程碑记录
├── progress.json      # 进度记录
├── decisions.json     # 决策记录
├── notes.ndjson       # 笔记
└── repo_root.json     # 仓库根路径
```

---

## 7. 常见问题

### Q: 如何更新到最新版本？

```bash
npx -y github:huanghe/project-brain
```

每次 npx 会拉取最新版本。

### Q: 需要先安装依赖吗？

不需要，`npx -y` 会自动处理依赖。

### Q: 支持本地开发吗？

支持。克隆仓库后：

```bash
git clone https://github.com/huanghe/project-brain.git
cd project-brain
pnpm install
pnpm build
```

然后配置本地路径：

```json
{
  "mcpServers": {
    "project-brain": {
      "command": "node",
      "args": ["./project-brain/dist/index.js"]
    }
  }
}
```

---

## 8. AI 助手使用建议

1. **首次交互时**：调用 `brain_init` 初始化项目
2. **理解项目时**：调用 `brain_context` 获取上下文
3. **发现决策时**：调用 `brain_record_progress` 记录
4. **遇到问题时**：调用 `brain_capture_note` 记录笔记
5. **需要行动建议时**：调用 `brain_suggest_actions`
