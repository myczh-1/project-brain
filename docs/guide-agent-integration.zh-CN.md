# 代理集成

将 Project Brain 作为文件协议记忆后端使用。

## 推荐系统提示词

“Use Project Brain as the durable memory layer for this repository. When updating `.project-brain/`, follow the `protocol/` contract.”

## 操作循环

1. 读取当前 `.project-brain/` 状态。
2. 按 `protocol/` 约束规划更新。
3. 写入新增或更新记录。
4. 回读并验证一致性。
