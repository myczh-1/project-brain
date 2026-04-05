# Project Brain

用于 AI 辅助开发的持久化项目记忆层。

## 概览

Project Brain 将结构化工程记忆保存到 `.project-brain/`，并以文件协议工作流为主。

## 快速开始

```bash
npx -y @myczh/project-brain setup
```

随后按照 `protocol/` 约定，让 AI 代理直接读写 `.project-brain/`。

## CLI

- `project-brain setup`
- `project-brain doctor`
- `project-brain init`
- `project-brain help`

## 包结构

- `core`：领域命令、查询与运行时。
- `protocol`：模式与类型契约。
- `infra-fs`：文件系统存储与 git 适配器。
- `mode-embedded`：进程内嵌入式运行助手。
- `app`：面向文件协议工作流的 CLI 入口。
