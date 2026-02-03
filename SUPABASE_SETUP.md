# 🚀 Supabase Backend Setup Guide

## Step-by-Step Connection Guide

### Step 1: Create/Access Supabase Project

1. Go to https://supabase.com/dashboard
2. Sign in or create a free account
3. Click **"New Project"**
4. Fill in:
   - **Name:** `biometric-attendance` (or any name you prefer)
   - **Database Password:** Create a strong password ⚠️ **SAVE THIS!**
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free tier is sufficient
5. Click **"Create new project"** (takes ~2 minutes to provision)

### Step 2: Get Connection String

1. In your Supabase project dashboard, click **Settings** (⚙️) in the sidebar
2. Click **Database**
3. Scroll to **Connection string** section
4. You'll see two options:

#### Option A: Connection Pooling (Recommended for this app)
- Select **"URI"** tab
- Copy the connection string, it looks like:
  ```
  postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
  ```

#### Option B: Direct Connection (For migrations)
- Select **"Direct connection"** 
- Toggle to **"URI"** format
- Copy the connection string, it looks like:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
  ```

**⚠️ IMPORTANT:** Replace `[YOUR-PASSWORD]` with the actual password you created in Step 1!

### Step 3: Update Your .env File

1. Open the `.env` file in your project folder
2. Replace the DATABASE_URL with your Supabase connection string
3. Make sure to replace `[YOUR-PASSWORD]` with your actual password

**Example:**
```env
DATABASE_URL=postgresql://postgres.abcdefghijk:MySecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 4: Install Dependencies (if not done)

```powershell
npm install
```

### Step 5: Create Database Tables

Run the Drizzle migration to create all necessary tables:

```powershell
npm run db:push
```

You should see:
```
✓ Tables created successfully
```

### Step 6: Start the Application

```powershell
npm run dev
```

Or use the start script:
```powershell
./start.ps1
```

### Step 7: Verify Connection

1. Open browser: http://localhost:5000
2. You should see the dashboard
3. The app will automatically seed sample data (Alice, Bob, Charlie)
4. Check Supabase dashboard → Table Editor to see your data!

---

## 🔍 Verify in Supabase Dashboard

After running the app, check your Supabase project:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `users`
   - `fingerprints`
   - `attendance_logs`
   - `system_settings`
   - `drizzle` (migration tracking table)

---

## 🛠️ Troubleshooting

### Error: "Connection refused" or "Could not connect"
- Check your internet connection
- Verify the connection string is correct
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Try the Direct Connection URL instead of pooled connection

### Error: "Password authentication failed"
- Your password in the connection string is wrong
- Reset password: Supabase Dashboard → Settings → Database → Reset Database Password
- Update `.env` file with new password

### Error: "SSL connection required"
- Supabase requires SSL. Make sure your connection string ends with:
  - For pooled: `?pgbouncer=true`
  - For direct: `?sslmode=require` or just nothing (SSL is default)

### Tables not created
- Run: `npm run db:push` again
- Check Supabase logs: Dashboard → Logs → Postgres Logs

### Want to reset everything?
In Supabase Dashboard → SQL Editor, run:
```sql
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS fingerprints CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS drizzle CASCADE;
```
Then run `npm run db:push` again.

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database password saved
- [ ] Connection string copied to `.env`
- [ ] Password replaced in connection string
- [ ] `npm install` completed
- [ ] `npm run db:push` successful
- [ ] App starts with `npm run dev`
- [ ] Can access http://localhost:5000
- [ ] Tables visible in Supabase Table Editor

---

## 🎯 Next Steps

Once connected, you can:
- View data in Supabase Table Editor
- Use Supabase SQL Editor for custom queries
- Set up Row Level Security (RLS) if needed
- Monitor logs and usage in Supabase dashboard

**Pro Tip:** Bookmark your Supabase project URL for easy access to your database!
