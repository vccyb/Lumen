# 外键约束状态分析

## 📅 文档信息
- **创建时间**: 2026-03-29
- **最后更新**: 2026-03-29
- **分析目的**: 评估当前外键约束状态，决定是否需要清理

---

## 🎯 外键现状

### 当前存在的外键约束

截至2026-03-29，数据库中存在以下外键约束：

#### 1. goal_milestones 表（目标-里程碑关联）
```sql
goal_milestones_goal_id_fkey
  - goal_id → life_goals(id)
  - ON DELETE CASCADE

goal_milestones_milestone_id_fkey
  - milestone_id → milestones(id)
  - ON DELETE CASCADE
```

#### 2. milestone_tags 表（里程碑标签）
```sql
milestone_tags_milestone_id_fkey
  - milestone_id → milestones(id)
  - ON DELETE CASCADE
```

#### 3. project_links 表（项目链接）
```sql
project_links_project_id_fkey
  - project_id → projects(id)
  - ON DELETE CASCADE
```

#### 4. project_tech_stack 表（项目技术栈）
```sql
project_tech_stack_project_id_fkey
  - project_id → projects(id)
  - ON DELETE CASCADE
```

---

## 📊 分析

### ✅ 保留这些外键的理由

1. **数据完整性保证**
   - 防止孤立记录（orphaned records）
   - 确保引用的数据存在
   - 维护表之间的参照完整性

2. **级联删除保护**
   - 所有的外键都设置了`ON DELETE CASCADE`
   - 删除主记录时自动删除关联记录
   - 防止数据不一致

3. **这些是"安全的"外键**
   - 它们只关联到业务表（不关联到auth.users）
   - 不会造成数据导入困难
   - 不会影响开发工作流

### ⚠️ 需要注意的点

1. **导入数据时需要正确的顺序**
   - 先插入主表记录（life_goals, milestones, projects）
   - 再插入关联表记录（goal_milestones, milestone_tags, project_links, project_tech_stack）

2. **删除主记录会影响关联记录**
   - 删除milestone会删除所有关联的tags和goal_milestones
   - 删除project会删除所有关联的links和tech_stack

3. **性能考虑**
   - 外键约束会带来轻微的性能开销
   - 对于小到中等规模的应用，这个开销可以忽略

---

## 🔍 与之前决策的对比

### 之前的问题（已解决）
之前的文档中提到的问题主要是指向`auth.users`表的外键约束：
```sql
-- 之前的问题外键（这些已经不存在了）
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```

### 当前的外键（不同的性质）
现在的外键都是业务表之间的关联：
- `life_goals.id` ← `goal_milestones.goal_id`
- `milestones.id` ← `goal_milestones.milestone_id`
- `milestones.id` ← `milestone_tags.milestone_id`
- `projects.id` ← `project_links.project_id`
- `projects.id` ← `project_tech_stack.project_id`

这些外键**不会**造成之前遇到的问题，因为：
1. 不涉及系统表（auth.users）
2. 可以通过正确的数据导入顺序来解决
3. 提供了数据完整性保证

---

## ✅ 建议

### 建议：保留当前的外键约束

**理由**：
1. **数据完整性** - 防止孤立记录
2. **级联删除** - 自动清理关联数据
3. **文档化关系** - 外键本身就是表关系的文档
4. **性能影响小** - 对于当前规模的应用可以忽略

### 操作建议

#### 数据导入时的正确顺序
```sql
-- 1. 先插入主表
INSERT INTO life_goals (...) VALUES (...);
INSERT INTO milestones (...) VALUES (...);
INSERT INTO projects (...) VALUES (...);

-- 2. 再插入关联表（引用主表的ID）
INSERT INTO goal_milestones (goal_id, milestone_id) VALUES (...);
INSERT INTO milestone_tags (milestone_id, tag) VALUES (...);
INSERT INTO project_links (project_id, url) VALUES (...);
INSERT INTO project_tech_stack (project_id, technology) VALUES (...);
```

#### 如果确实需要临时移除外键
```sql
-- 禁用触发器（包括外键检查）
SET session_replication_role = 'replica';

-- 执行数据导入操作

-- 重新启用触发器
SET session_replication_role = 'origin';
```

---

## 🔍 如何查询外键状态

### 查询所有外键
```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;
```

### 查询特定表的外键
```sql
-- 替换 'your_table_name' 为表名
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'your_table_name'
ORDER BY tc.constraint_name;
```

---

## 📚 相关文档

- [数据库Schema管理规则](./database-schema-management-rules.md)
- [数据迁移指南](./data-migration-no-foreign-keys.md)
- [API连通性测试报告](./api-connectivity-test-report.md)

---

**最后更新**: 2026-03-29
