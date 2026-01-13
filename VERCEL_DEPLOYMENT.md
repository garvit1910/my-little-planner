# Vercel Deployment Guide

## What Was Fixed

1. **CSS Import Order** - Fixed `@import` statement placement in `index.css`
2. **SPA Routing Configuration** - Added `vercel.json` to properly handle client-side routing

## Steps to Deploy on Vercel

### 1. **Set Up Environment Variables in Vercel**

When deploying to Vercel, you must add your Supabase credentials as environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   ```
   VITE_SUPABASE_URL=https://pqditvsdzwopwcvynmkr.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```
   (Replace with your actual values from Supabase)

### 2. **Important: How Vite Handles Environment Variables**

- Vite only includes environment variables that **start with `VITE_`** in the production build
- These variables are embedded into the JavaScript bundle at build time
- They are NOT secret - they're exposed in the browser (that's why it's the "anon key")

### 3. **Commit and Push**

Once environment variables are set in Vercel:

```bash
git add .
git commit -m "Fix: CSS import order and add Vercel deployment config"
git push origin main
```

Vercel will automatically:
- Detect the push
- Run `npm run build` 
- Deploy the `dist` folder

### 4. **Verify Deployment**

After deployment:
- Visit your Vercel domain
- Check the browser console for any errors (F12 → Console tab)
- Try logging in to verify Supabase connection works

## Why You Were Getting a White Screen

The white screen happened because:
1. **Missing environment variables** - Your app couldn't connect to Supabase
2. **Routing issues** - Without `vercel.json`, client-side routes were failing
3. **JavaScript errors** - The app couldn't initialize without Supabase credentials

## Additional Notes

- The `vercel.json` file ensures that all routes are served by `index.html` (necessary for React Router)
- Your `.gitignore` is correctly configured to not commit `.env.local`
- Vercel will rebuild automatically when you push to the main branch
- You can monitor builds in the Vercel dashboard → Deployments

## Troubleshooting

If you still see a white screen after deploying:

1. **Check Environment Variables**
   - Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel
   - Redeploy after adding them

2. **Check Browser Console**
   - Press F12, go to Console tab
   - Look for error messages about Supabase or missing environment variables

3. **Check Vercel Logs**
   - Go to your Vercel project → Deployments
   - Click on your latest deployment → Logs
   - Look for build errors

4. **Verify CORS Settings**
   - In Supabase, go to Project Settings → API
   - Make sure your Vercel domain is allowed in CORS settings
   - Add: `https://your-domain.vercel.app`
