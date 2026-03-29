# Lumen 指导文档索引

本目录包含所有外部系统操作和常见问题的指导文档。

---

## 📂 文档分类

### 🔌 Supabase (`guides/supabase/`)

| 文档 | 创建时间 | 解决的问题 |
|------|---------|-----------|
| [database-schema-management-rules.md](./supabase/database-schema-management-rules.md) | 2026-03-29 | 建立数据库schema变更的标准流程和规则 |
| [api-connectivity-test-report.md](./supabase/api-connectivity-test-report.md) | 2026-03-29 | API连通性测试结果报告 |
| [foreign-key-status-analysis.md](./supabase/foreign-key-status-analysis.md) | 2026-03-29 | 分析当前外键约束状态，提供处理建议 |
| [code-review-summary-2026-03-29.md](./supabase/code-review-summary-2026-03-29.md) | 2026-03-29 | API架构代码审查总结和重构建议 |
| [api-refactoring-complete.md](./supabase/api-refactoring-complete.md) | 2026-03-29 | API架构重构完成报告 ✅ 已完成 |
| [final-summary-2026-03-29.md](./supabase/final-summary-2026-03-29.md) | 2026-03-29 | 完整的工作总结和下一步建议 |
| [data-migration-no-foreign-keys.md](./supabase/data-migration-no-foreign-keys.md) | 2026-03-29 | 外键约束导致数据插入失败，迁移数据困难 |

### 🚀 Deployment (`guides/deployment/`)

*暂无文档*

### 💻 Development (`guides/development/`)

| 文档 | 创建时间 | 解决的问题 |
|------|---------|-----------|
| [code-review-rules.md](./development/code-review-rules.md) | 2026-03-29 | 建立代码审查的标准流程和规则 |

### 🔌 API Integration (`guides/api/`)

*暂无文档*

---

## 📝 文档规范

所有指导文档必须包含：

1. **时间信息**: 创建时间、最后更新时间
2. **问题描述**: 解决的问题和原因分析
3. **操作步骤**: 清晰的步骤和可复制代码
4. **故障排除**: 常见问题和解决方案
5. **验证方法**: 如何确认操作成功
6. **检查清单**: 操作前后的确认项

详见 [CLAUDE.md](../CLAUDE.md#external-system-integration-guidelines)

---

## 🔍 快速查找

### 按问题类型查找

**数据问题**:
- 数据导入失败 → [data-migration-no-foreign-keys.md](./supabase/data-migration-no-foreign-keys.md)

**Schema管理**:
- 表结构变更流程 → [database-schema-management-rules.md](./supabase/database-schema-management-rules.md)
- 外键约束分析 → [foreign-key-status-analysis.md](./supabase/foreign-key-status-analysis.md)

**代码质量**:
- 代码审查规则 → [code-review-rules.md](./development/code-review-rules.md)
- API架构审查 → [code-review-summary-2026-03-29.md](./supabase/code-review-summary-2026-03-29.md)
- API重构完成 → [api-refactoring-complete.md](./supabase/api-refactoring-complete.md) ✅
- 完整工作总结 → [final-summary-2026-03-29.md](./supabase/final-summary-2026-03-29.md)

**API测试**:
- 连通性测试报告 → [api-connectivity-test-report.md](./supabase/api-connectivity-test-report.md)

**权限问题**:
- 待添加...

**性能问题**:
- 待添加...

### 按操作类型查找

**数据库操作**:
- 迁移数据 → [data-migration-no-foreign-keys.md](./supabase/data-migration-no-foreign-keys.md)
- Schema管理规则 → [database-schema-management-rules.md](./supabase/database-schema-management-rules.md)
- 外键约束处理 → [foreign-key-status-analysis.md](./supabase/foreign-key-status-analysis.md)

**代码质量**:
- 代码审查规则 → [code-review-rules.md](./development/code-review-rules.md)
- API架构审查 → [code-review-summary-2026-03-29.md](./supabase/code-review-summary-2026-03-29.md)
- API重构完成 → [api-refactoring-complete.md](./supabase/api-refactoring-complete.md) ✅
- 完整工作总结 → [final-summary-2026-03-29.md](./supabase/final-summary-2026-03-29.md)

**测试操作**:
- API连通性测试 → [api-connectivity-test-report.md](./supabase/api-connectivity-test-report.md)

**部署操作**:
- 待添加...

---

## 📚 使用建议

1. **操作前先阅读文档** - 避免重复踩坑
2. **遇到问题先查文档** - 大部分问题已有解决方案
3. **发现问题及时补充** - 帮助团队积累经验

---

**最后更新**: 2026-03-29
