# Deployment Guide for Vercel

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Git repository (your code should be pushed to GitHub/GitLab/Bitbucket)
- Supabase database already set up

## Step 1: Prepare Your Project

1. **Build the project locally to ensure it works:**
   ```powershell
   npm run build
   ```

2. **Commit and push your code to Git:**
   ```powershell
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI globally:**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```powershell
   vercel login
   ```

3. **Deploy from your project directory:**
   ```powershell
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `biometric-attendance` (or your preferred name)
   - In which directory is your code located? **./**.
   - Want to override settings? **N**

4. **Set environment variables:**
   ```powershell
   vercel env add DATABASE_URL
   ```
   Paste your Supabase connection string when prompted
   
   ```powershell
   vercel env add SESSION_SECRET
   ```
   Enter a random secure string (e.g., generate one at https://randomkeygen.com/)

5. **Deploy to production:**
   ```powershell
   vercel --prod
   ```

### Option B: Using Vercel Dashboard

1. **Go to https://vercel.com/new**

2. **Import your Git repository**
   - Connect your GitHub/GitLab/Bitbucket account
   - Select your repository

3. **Configure the project:**
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   - `DATABASE_URL` = Your Supabase connection string
   - `SESSION_SECRET` = A random secure string
   - `NODE_ENV` = `production`

5. **Click "Deploy"**

## Step 3: Post-Deployment

1. **Your app will be live at:** `https://your-project-name.vercel.app`

2. **Update Supabase settings (if needed):**
   - Go to your Supabase project
   - Add your Vercel domain to allowed origins if using direct database connections

3. **Test the deployment:**
   - Visit your Vercel URL
   - Try logging in
   - Test fingerprint registration and attendance

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally first

### Database Connection Issues
- Verify `DATABASE_URL` environment variable is correct
- Make sure you're using the **Session Pooler** connection string from Supabase
- Check if Supabase allows connections from Vercel IPs

### Session/Authentication Issues
- Ensure `SESSION_SECRET` is set in environment variables
- Check that cookies are being sent correctly (may need secure: true in production)

## Automatic Deployments

Once connected to Git:
- Every push to `main` branch = Production deployment
- Pull requests = Preview deployments
- You can configure this in Vercel dashboard → Settings → Git

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## Important Notes

⚠️ **WebAuthn/Fingerprint Scanning:**
- WebAuthn requires HTTPS (Vercel provides this automatically)
- Users must access via the Vercel URL or custom domain
- Localhost won't work in production

⚠️ **Database:**
- Keep your Supabase database connection string secure
- Never commit `.env` file to Git
- Use Vercel's environment variables for sensitive data

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Check deployment logs in Vercel dashboard
- Review build output for errors
