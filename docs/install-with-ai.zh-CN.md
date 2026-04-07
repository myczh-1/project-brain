# 用 AI 助手安装

Project Brain 更适合由您的编码助手完成安装，而不是手动编辑一长串配置文件。

推荐流程：

1. 在当前仓库中打开您的 AI 编码工具。
2. 让它按照本文档执行安装。
3. 让它检查本地环境、提出合适的配置修改方案，并在得到您的确认后完成修改。

推荐话术：

```text
请按照 docs/install-with-ai.zh-CN.md 在这个仓库里安装 Project Brain。
请检测当前环境是 Codex、Claude 还是 OpenCode，通过 `project-brain stdio` 配置 Project Brain，并更新对应的项目级或全局 prompt / 配置文件。
优先使用项目级配置。编辑前请先说明你准备修改哪些文件。
```

## 助手应该做什么

1. 检查当前仓库。
   - 确认仓库根目录。
   - 检查 `.project-brain/` 是否已存在。
   - 检查 `protocol/` 是否存在。
   - 检查是否存在 OpenSpec。

2. 在需要时初始化 Project Brain。
   - 如果 `.project-brain/manifest.json` 缺失，运行：

   ```bash
   npx -y @myczh/project-brain setup
   ```

   - 如果仓库已经初始化，不要覆盖已有记忆。

3. 检测当前要配置的 AI 工具。
   - Codex
   - Claude
   - OpenCode

4. 优先使用项目级集成。
   - 如果目标工具支持项目级 prompt 或工具配置，优先使用项目级。
   - 只有当项目级不可用，或用户明确要求时，才使用全局配置。

5. 通过 `stdio` 配置 Project Brain。
   - 运行时入口是：

   ```bash
   project-brain stdio
   ```

   - 助手应按目标工具支持的格式，把这条命令写入对应的本地工具 / MCP / agent 配置。

6. 添加或更新 prompt / instructions。
   - 助手应向目标工具配置中加入一段简短的 Project Brain 集成提示。
   - 推荐 prompt：

   ```text
   Use Project Brain as the durable memory layer for this repository.
   When you need project memory or task context, call the Project Brain stdio tools.
   When updating `.project-brain/`, follow the `protocol/` contract.
   Prefer module-scoped retrieval before broad historical search.
   ```

7. 说明变更结果。
   - 列出修改了哪些文件。
   - 说明本次集成是项目级还是全局级。
   - 确认运行时入口是 `project-brain stdio`。

## 重要规则

- 不要发明未文档化的 `.project-brain/` 字段。
- 除非确实要更新，否则不要覆盖已有的 Project Brain 记录。
- 即使当前工作目录在子目录，也要把 `.project-brain/` 当成仓库根目录级状态。
- 保留仓库中已有的 OpenSpec 工作流。
- 如果目标工具有多个可用配置位置，请解释选项，并优先选择项目级配置。

## 最小验证

安装完成后，助手应验证：

1. 仓库中存在合法的 `.project-brain/` 目录。
2. 目标 AI 工具配置已指向 `project-brain stdio`。
3. prompt / instructions 中提到了 Project Brain 和 `protocol/`。
4. 一个简单的 stdio 请求可以成功，例如：

```bash
printf '%s\n' '{"id":"smoke-1","message":{"type":"get_state","repo_path":"'"$(pwd)"'"}}' | project-brain stdio
```

## 兜底方案

如果助手无法安全地自动修改目标工具配置：

- 请输出所需的精确配置片段，
- 说明这些内容应该放到哪里，
- 不要做带猜测性质的修改。
