# Project Brain 入门指南

本指南将为您提供在开发环境中安装、配置和使用 Project Brain 的逐步说明。

## 前置条件

在开始之前，请确保您已安装以下软件：
- Node.js 18 或更高版本
- 一个打算使用 Project Brain 的 git 仓库

## 安装

建议先走 setup 流程：

```bash
npx -y @myczh/project-brain setup
```

这个命令会初始化 `.project-brain/`，并输出推荐的基于文件的工作流说明。

如果您更希望安装成可复用命令，也可以：

```bash
npm install -g @myczh/project-brain
project-brain setup
```

## 使用您的 AI 助手

Project Brain 现在使用基于文件的协议工作流。您的 AI 助手应当：

1. 读取 `protocol/` 了解数据契约。
2. 在写入前先读取当前 `.project-brain/` 状态。
3. 直接向 `.project-brain/` 写入结构化 JSON 或 NDJSON 记录。

如果您已经在使用 OpenSpec，可以让助手同时使用 OpenSpec 进行规划，再由 Project Brain 记录持久化执行状态。

## 首次使用 — 初始化项目

初始化后，您的 AI 助手即可通过直接读取和更新 `.project-brain/` 与 Project Brain 交互。

1. **初始化项目**：运行 `project-brain init` 或 `project-brain setup`。
2. **检查上下文**：读取 `.project-brain/manifest.json`、`project-spec.json` 和最近的 NDJSON 记录。

## 日常工作流

遵循此模式以维护持久的项目记忆：

1. **工作前**：调用 `brain_context` 为助手注入当前目标和近期进展。
2. **开始有意义的工作**：在开始新功能或修复时调用 `brain_start_work`。
3. **工作中**：
   - 调用 `brain_checkpoint` 记录里程碑。
   - 在做出架构或实现选择时调用 `brain_log_decision`。
   - 调用 `brain_capture_note` 记录观察结果或后续事项。
4. **工作结束**：调用 `brain_finish_work` 总结更改并更新项目状态。

## 了解您的数据

Project Brain 将所有数据存储在仓库根目录的 `.project-brain/` 目录中：

- `manifest.json`：项目身份（名称、摘要、仓库类型、技术栈）。
- `project-spec.json`：稳定的项目真相和规则。
- `changes/<id>.json`：单个实现任务的结构化记录。
- `decisions.ndjson`：工程决策的追加日志。
- `notes.ndjson`：捕获的片段和观察结果。
- `progress.ndjson`：执行更新和阻塞事项的时间轴。
- `milestones.json`：宽泛的阶段和里程碑跟踪。

您可以直接在仓库中查看这些文件。

## 故障排除

- **缺少 `.project-brain/`**：运行 `project-brain setup`。
- **助手写入无效数据**：让它重新读取 `protocol/`，并确保先读后写。
- **并发更新冲突**：替换 JSON 快照文件前先重新读取当前内容。

## 后续步骤

- 查看 [OpenSpec 集成指南](./guide-openspec-integration.zh-CN.md) 以学习如何在规范驱动开发中使用 Project Brain。
