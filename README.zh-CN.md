# Project Brain
为 AI 辅助开发提供持久化项目记忆。

## 功能介绍

- 为 AI 辅助开发循环提供持久化项目记忆机制。
- 在 `.project-brain/` 目录下存储项目上下文、变更（changes）、决策（decisions）和进度（progress）。
- 使用基于文件的轻量工作流，AI 工具直接读写 `.project-brain/`。

## 实际体验

| 功能         | 体验                        |
|:-----------|:--------------------------|
| **变更记录**   | AI 变得更有“记性”，不再反复犯同样的架构错误。 |
| **架构索引**   | AI 处理跨文件修改时，不再丢三落四。       |
| **偏好配置**   | AI 写出来的代码风格和你亲手写的几乎一模一样¹。  |
| **失败尝试记录** | AI 不会再给你推荐你已经试过并证明无效的方法。  |

## 快速开始

把下面这段话复制给你的 AI 助手，让它完成安装：

```text
Please install Project Brain in this repository by following docs/install.md.
Use project-level configuration when possible.
Configure Project Brain through `project-brain stdio`.
Explain which files you plan to modify before editing them.
```

详细工作流说明请参阅 [docs/guide-openspec-integration.zh-CN.md](./docs/guide-openspec-integration.zh-CN.md)。简而言之，AI 助手读取 `protocol/` 中的定义，并直接向 `.project-brain/` 写入结构化数据。

1. 先为仓库做 bootstrap：
   ```bash
   npx -y @myczh/project-brain setup
   ```
2. 让 AI 助手按照 `docs/install.md` 完成接入。
3. 让助手把目标工具接到 `project-brain stdio`，并更新对应的 prompt / 配置。

写入这些文件时请保持严格结构:

- `manifest.json`、`project-spec.json`、`changes/<id>.json`、`milestones.json` 必须是合法 JSON。
- `decisions.ndjson`、`notes.ndjson`、`progress.ndjson` 必须是合法 NDJSON，每行一个 JSON 对象。
- 如果文件损坏或结构不合法，Project Brain 现在会显式报错，而不是把坏数据静默当成空数据。

## CLI 命令

- `project-brain setup`：为当前仓库做 bootstrap，并指向 AI 安装文档。
- `project-brain doctor`：检查当前仓库在 AI 安装前后是否处于正确状态。
- `project-brain init`：为当前仓库创建最小可用的 `.project-brain/` 初始化结构。
- `project-brain stdio`：通过 stdin/stdout 暴露 Project Brain 的工具接口。

## 核心数据模型

Project Brain 在 `.project-brain/` 目录下管理结构化状态：

- `manifest.json`: 可选的项目标识（名称、简介、技术栈）。
- `project-spec.json`: 稳定的项目事实和架构规则。
- `changes/`: 包含单个变更结构化记录的目录。
- `decisions.ndjson`: 项目和实现决策的依据。
- `notes.ndjson`: 原始观察结果和未解决的代码片段。
- `progress.ndjson`: 执行更新、阻塞点和状态。
- `milestones.json`: 宏观阶段和里程碑跟踪。

```text
.project-brain/
  manifest.json
  project-spec.json
  changes/
    <change-id>.json
  decisions.ndjson
  notes.ndjson
  progress.ndjson
  milestones.json
```

## 核心操作

Project Brain 的主要操作以库函数形式暴露，适合由工具宿主封装到文件协议工作流中：

- 读取与检查：`brain_context`、`brain_dashboard`、`brain_change_context`、`brain_recent_activity`、`brain_analyze`、`brain_suggest_actions`
- 写入与记录：`brain_create_change`、`brain_start_work`、`brain_checkpoint`、`brain_finish_work`、`brain_update_change`、`brain_log_decision`、`brain_record_progress`、`brain_capture_note`、`brain_ingest_memory`
- 初始化：`brain_init`

## 集成指南

- [Install](./docs/install.md)
- [入门指南](./docs/guide-getting-started.zh-CN.md)
- [OpenSpec 集成](./docs/guide-openspec-integration.zh-CN.md)

## 架构

Project Brain 采用分层架构：

- **protocol**: 纯类型定义和 Schema。
- **core**: 领域逻辑、命令、查询和端口。
- **infra-fs**: 存储和 Git 端口的本地文件系统实现。
- **mode-embedded**: 仓库内文件工作流的集成辅助层。
- **app**: Bootstrap CLI 与 stdio 入口。

## 开发

```bash
npm install
npm run build
npm test
npm run test:watch
```

## 开源协议

MIT

---

[English](./README.md)

<small>
1: 目标成为
</small>
