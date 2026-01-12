# Supabase Backend Setup Instructions

## Step 1: Run Database Migration

1. Go to your Supabase project dashboard: https://pqditvsdzwopwcvynmkr.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the migration

This will create all the necessary tables, indexes, RLS policies, and database functions.

## Step 2: Get Your Anon Key

1. In your Supabase dashboard, go to "Project Settings" (gear icon at bottom left)
2. Click on "API" in the settings menu
3. Under "Project API keys", find the "anon public" key
4. Copy this key

## Step 3: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace `your_anon_key_here` with the anon key you copied:

```
VITE_SUPABASE_URL=https://pqditvsdzwopwcvynmkr.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Step 4: Configure GitHub OAuth (Optional but Recommended)

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: TaskFlow Planner
   - **Homepage URL**: http://localhost:5173 (for development)
   - **Authorization callback URL**: https://pqditvsdzwopwcvynmkr.supabase.co/auth/v1/callback
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it

### Add GitHub OAuth to Supabase:

1. Go to your Supabase dashboard
2. Click "Authentication" in the left sidebar
3. Click "Providers"
4. Find "GitHub" and click to enable it
5. Paste your GitHub **Client ID** and **Client Secret**
6. Click "Save"

## Step 5: Configure Email Authentication

1. In Supabase dashboard, go to "Authentication" > "Providers"
2. Ensure "Email" is enabled (it should be by default)
3. Go to "Authentication" > "Email Templates" to customize verification emails (optional)

### Disable Email Confirmations for Development (Optional):

For easier testing during development:
1. Go to "Authentication" > "Providers" > "Email"
2. Uncheck "Confirm email" (you can re-enable this for production)
3. Click "Save"

## Step 6: Test the Authentication System

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:5173

3. You should be redirected to the login page

4. Try creating an account:
   - Click "Sign up"
   - Fill in the form
   - Check your email for verification (if confirmations are enabled)

5. Try signing in with GitHub:
   - Click the "GitHub" button
   - Authorize the application

6. Try logging in with email/password

## Step 7: Verify Database Setup

After signing up, check your Supabase dashboard:

1. Go to "Table Editor"
2. You should see these tables:
   - `profiles` - Should have your user profile
   - `notification_settings` - Should have default settings for your user
   - `tasks` - Empty for now
   - `task_series` - Empty for now
   - `notifications` - Empty for now
   - And other tables

3. Click on `profiles` table
4. You should see a row with your user information

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` exists and contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables

### Email not being sent
- Check "Authentication" > "Email Templates" in Supabase
- For development, consider disabling email confirmations
- Check Supabase logs under "Logs" > "Auth Logs"

### GitHub OAuth not working
- Verify the callback URL is exactly: `https://pqditvsdzwopwcvynmkr.supabase.co/auth/v1/callback`
- Make sure the GitHub OAuth app is not in development mode restricting users
- Check that Client ID and Secret are correctly entered in Supabase

### RLS (Row Level Security) errors
- The migration should have set up all policies correctly
- If you get "permission denied" errors, check the RLS policies in the SQL migration file
- Go to "Table Editor" > select a table > "RLS" tab to view policies

## Next Steps

Once authentication is working:
1. ✅ Users can sign up and log in
2. ✅ Profiles are automatically created
3. ✅ Default notification settings are created
4. Ready to migrate the tasks system to Supabase (next phase)

## Production Deployment

When deploying to production:

1. Update GitHub OAuth app callback URL to your production domain:
   - `https://your-production-domain.com` (homepage)
   - `https://pqditvsdzwopwcvynmkr.supabase.co/auth/v1/callback` (callback)

2. Re-enable email confirmations:
   - Go to "Authentication" > "Providers" > "Email"
   - Check "Confirm email"

3. Consider setting up custom SMTP:
   - Go to "Project Settings" > "Auth" > "SMTP Settings"
   - This allows you to use your own email service instead of Supabase's

4. Add environment variables to your hosting platform (Netlify/Vercel):
   - `VITE_SUPABASE_URL=https://pqditvsdzwopwcvynmkr.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your_anon_key`

5. Update CORS settings if needed:
   - Go to "Project Settings" > "API"
   - Add your production domain to allowed origins
