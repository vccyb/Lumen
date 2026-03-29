# External System Integration Documentation

## 📚 Documentation Rule (CRITICAL)

### When
**Any operation involving external systems** (Supabase, Vercel, databases, APIs, etc.)

### Requirement
**MUST create a guide document in `guides/` directory**

---

## 📂 Directory Structure

```
guides/
├── supabase/           # Supabase相关操作
├── deployment/         # 部署相关
├── development/        # 开发环境相关
└── api/               # 第三方API集成
```

---

## 📝 Document Requirements

### Must Include Elements

#### 1. Header Section (MUST include)
```markdown
## 📅 文档信息
- **创建时间**: YYYY-MM-DD
- **最后更新**: YYYY-MM-DD
- **解决的问题**: [简述问题和原因]
```

#### 2. Problem Description
- 问题描述/现象
- 根本原因分析
- 设计决策（为什么选择这个方案）

#### 3. Step-by-Step Guide
- 清晰的操作步骤
- 可直接复制的代码/命令
- 验证步骤

#### 4. Troubleshooting
- 常见错误和解决方法
- Q&A

#### 5. Verification
- 如何确认操作成功
- 预期结果

#### 6. Checklist
- 操作前检查清单
- 每步骤完成后的验证点

### File Naming Convention

Use `kebab-case-with-context.md`:
- ✅ `data-migration-no-foreign-keys.md`
- ✅ `supabase-rls-setup.md`
- ❌ `guide1.md`
- ❌ `temp.md`

---

## 🎯 Examples

### Good Document Example
- `guides/supabase/data-migration-no-foreign-keys.md`
- `guides/supabase/database-schema-management-rules.md`
- `guides/development/code-review-rules.md`

### Future Examples
- `guides/deployment/vercel-deployment.md`
- `guides/api/stripe-integration.md`

---

## 🔍 Why This Rule

1. **Knowledge Accumulation** - Avoid repeating mistakes
2. **Team Onboarding** - Help new team members get started quickly
3. **Troubleshooting** - Have documented solutions for common issues
4. **Best Practices** - Follow "docs as code" best practices

---

## ✅ Quick Checklist

Before any external system operation:

- [ ] Check if documentation already exists
- [ ] Create/update guide in `guides/` directory
- [ ] Include all required sections
- [ ] Add verification steps
- [ ] Update README.md index
- [ ] Test the documentation yourself

---

## 📚 Related Rules

- [Database Schema Rules](./database-schema.md) - For database-specific operations
- [Code Review Rules](./code-review-rules.md) - Review requirements
