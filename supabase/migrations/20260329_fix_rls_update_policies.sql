-- =====================================================
-- 修复 RLS UPDATE 策略 - 添加 WITH CHECK 子句
-- =====================================================
-- 版本: 1.0.0
-- 日期: 2026-03-29
-- 说明: 修复软删除功能的 RLS 策略问题
--
-- 问题:
--   Timeline 页面删除功能报错: "new row violates row-level security policy"
--
-- 根本原因:
--   wealth_records 表的 UPDATE 策略缺少 WITH CHECK 子句
--   软删除实际执行的是 UPDATE 操作 (update deleted_at)
--   没有 WITH CHECK 导致更新后的行无法通过策略检查
--
-- 影响:
--   - wealth_records 表的软删除失败
--   - milestones 表正常（已有 WITH CHECK）
--   - life_goals 和 projects 表正常（使用 ALL 策略）
--
-- 修复:
--   为 wealth_records 表的 UPDATE 策略添加 WITH CHECK 子句
-- =====================================================

-- 修复 wealth_records 表的 UPDATE 策略
DROP POLICY IF EXISTS "Users can update own wealth records" ON wealth_records;

CREATE POLICY "Users can update own wealth records"
  ON wealth_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 验证修复
-- =====================================================

-- 检查策略是否正确创建
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'wealth_records'
    AND policyname = 'Users can update own wealth records'
    AND cmd = 'UPDATE'
    AND with_check IS NOT NULL;

  IF policy_count = 1 THEN
    RAISE NOTICE '✅ wealth_records UPDATE 策略修复成功';
  ELSE
    RAISE EXCEPTION '❌ wealth_records UPDATE 策略修复失败';
  END IF;
END $$;

-- 显示修复后的策略
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN with_check IS NOT NULL THEN '✅ OK'
    ELSE '❌ MISSING'
  END as with_check_status
FROM pg_policies
WHERE tablename IN ('milestones', 'wealth_records')
  AND cmd = 'UPDATE'
ORDER BY tablename;
