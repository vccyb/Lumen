# Security Rules

## 🔒 Security Principles

### Core Principle
**Never commit secrets, keys, or sensitive information to the repository.**

---

## 🚫 Forbidden Practices

### 1. Secrets Management

#### ❌ Never Commit
- ❌ API keys (Supabase, Stripe, OpenAI, etc.)
- ❌ Database connection strings
- ❌ Private keys or certificates
- ❌ Passwords or auth tokens
- ❌ Environment-specific configuration

#### ✅ Instead Use
- ✅ Environment variables (`.env.local`)
- ✅ Secret management services
- ✅ Environment-specific configs (`.env.development`, `.env.production`)
- ✅ Supabase secrets management

### 2. .env Files

#### File Handling
```bash
# .env.local - Local development (DO NOT COMMIT)
.env.local

# .env.example - Template (COMMIT THIS)
.env.example
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

#### .gitignore
```
# Environment variables
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
```

### 3. Supabase Security

#### RLS Policies
- ✅ Always enable Row Level Security (RLS) on all tables
- ✅ Use `auth.uid()` for user-specific data
- ✅ Test RLS policies before deployment
- ✅ Use service role key only in server-side code

#### Example RLS Policy
```sql
-- ✅ Good: User-specific data access
CREATE POLICY "Users can view own data"
  ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);

-- ❌ Bad: No user check
CREATE POLICY "All can view data"
  ON table_name
  FOR SELECT
  USING (true);
```

---

## 🔐 Input Validation

### 1. User Input
- ✅ Validate all user input
- ✅ Sanitize data before database operations
- ✅ Use Zod or similar for runtime validation
- ✅ Validate file uploads (type, size, content)

### 2. API Input
```typescript
// ✅ Good: Validate input
import { z } from 'zod';

const MilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(['foundation', 'experience', 'strategic-asset']),
});

// Validate before using
const validated = MilestoneSchema.parse(input);
```

### 3. SQL Injection Prevention
- ✅ Use parameterized queries (Supabase client handles this)
- ❌ Never concatenate user input into SQL queries
- ✅ Use Supabase's query builder instead of raw SQL

---

## 🛡️ API Security

### 1. Authentication
- ✅ Use Supabase Auth for authentication
- ✅ Check user session before protected operations
- ✅ Implement proper logout and session cleanup

### 2. Authorization
- ✅ Verify user permissions for data access
- ✅ Use RLS policies for database-level authorization
- ✅ Implement role-based access control if needed

### 3. Rate Limiting
- ✅ Implement rate limiting on public APIs
- ✅ Use Supabase Edge Functions with proper auth
- ✅ Add request throttling where appropriate

---

## 🔍 Security Auditing

### Regular Checks
- [ ] Review `.env.local` before committing
- [ ] Check for committed secrets using `git log`
- [ ] Audit third-party dependencies for vulnerabilities
- [ ] Review RLS policies before deployment
- [ ] Test authentication flows
- [ ] Validate input sanitization

### Secret Scanning
```bash
# Scan for secrets in git history
git log --all --full-history --source -- "*password*" "*key*" "*secret*"

# Use tools like truffleHog or git-secrets
```

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
