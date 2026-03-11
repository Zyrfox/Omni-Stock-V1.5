# Migration to Supabase

## Steps to Complete Migration

### 1. Update your local `.env` file

Replace your current `DATABASE_URL` and add Supabase credentials:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgres://postgres.dtueaqshhqprprycpoye:rwvRGs0DEmiQ0PT2@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://dtueaqshhqprprycpoye.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dWVhcXNoaHFwcnByeWNwb3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODg1ODksImV4cCI6MjA4ODc2NDU4OX0.bBRkdBSQ3dYEi85Jnf4t7N9_qePfE6Wb29zNkVtXV2I"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dWVhcXNoaHFwcnByeWNwb3llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE4ODU4OSwiZXhwIjoyMDg4NzY0NTg5fQ.rbT_vfEqyHU7m4FtoTEkLB43dkS9vhF7h6PNicdpZD8"
```

### 2. Push database schema to Supabase

Run the following command to push your Drizzle schema to Supabase:

```bash
npm run db:push
```

### 3. (Optional) Seed the database

If you need to seed initial data:

```bash
npm run db:seed
```

### 4. Verify connection

Start the development server and verify everything works:

```bash
npm run dev
```

## Notes

- The existing code using `@neondatabase/serverless` is compatible with Supabase's Postgres
- No code changes required - just environment variable updates
- Supabase uses standard PostgreSQL, so all existing queries work as-is
- The pooler connection (port 6543) is used for better performance with serverless functions

## Vercel Environment Variables

Don't forget to update these in your Vercel project settings:

1. `DATABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_URL`
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `SUPABASE_SERVICE_ROLE_KEY`
