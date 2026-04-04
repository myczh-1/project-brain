# Project Brain 上下文分层与 Token 预算执行方案

## 1. 背景

Project Brain 已经提供基于 `.project-brain/` 的结构化持久化能力与多种读取工具，但在长期演进项目中，仍需避免“全量拼接上下文”导致的 token 失控与噪声累积。

本方案目标：将 Project Brain 从“记忆存储”升级为“上下文调度”。

## 2. 核心设计：分离“内容层”和“入口策略”

### A. Context Layers（内容层）

- **L1 Global Brief**：项目级最小摘要
- **L2 Domain Brief**：领域级摘要
- **L3 Change Brief**：任务/变更级上下文
- **L4 Evidence Pack**：证据包（分页、排序、预算裁剪）

### B. Retrieval Entrypoints（检索入口）

- **E1 Standard Entrypoint**：`overview -> domain -> change -> evidence`
- **E0 Investigation Entrypoint**：`cold memory -> history links -> current mapping -> change -> evidence`

> 说明：E0/E1 是“入口路径”，不是上下文内容层；L1~L4 是“产物层级”。

## 3. E0 Investigation 的适用场景

- 古早 bug 追查
- 回归问题根因分析
- 文本/兼容性异常
- 历史决策原因复盘
- 标准路径低置信度自动回退

## 4. 必备规则

### 4.1 历史术语归一化（必选）

Investigation 必须支持术语扩展：

1. 提取任务关键词
2. 扩展别名/旧术语/缩写/曾用模块名
3. 用扩展词召回 notes/decisions/progress/changes

### 4.2 历史证据链（必选）

命中后不仅返回列表，还要构建链条：

`issue -> history note -> decision -> migration/refactor -> current module`

### 4.3 标准路径自动回退（必选）

若标准路径低置信度（例如 evidence 过少、仅 recent 命中、无 rationale 命中），自动建议：

- `Confidence is low for standard retrieval.`
- `Recommended fallback: investigation entry with timeSpan=all.`

### 4.4 why_not_found（必选）

无命中时必须说明：

- 是“历史中不存在记录”
- 还是“当前预算/范围未覆盖”

## 5. 风险与约束

### 风险 1：E0 退化为大而散的全文检索

缓解：E0 必须包含聚类去重、术语归并、当前模块反查，不能停在“搜到了”。

### 风险 2：历史数据碎片化

`notes` 通常是原始观察，不等于结论；E0 的职责是给“可验证线索”，而非直接裁决历史真相。

## 6. 实施顺序（建议）

1. 协议层补充（Layers + Entrypoints + budget modes）
2. 在 `brain_change_context` 增加 `retrieval_entrypoint` 和诊断信息
3. 增加 `why_not_found` 与自动回退建议
4. 再演进 domain-index、evidence pack、distilled memory

## 7. 成功标准

- 小项目不显著增加使用复杂度
- 大项目中，standard 与 investigation 的输出差异清晰且可解释
- 古早问题可通过 investigation 在有限轮次内找到可验证线索
- 输出包含明确的下一步检索建议
