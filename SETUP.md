# BloodConnect Pro - Complete Setup Guide

This guide will walk you through setting up BloodConnect Pro from scratch, including database configuration, environment setup, and deployment.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** or **pnpm** package manager
- **Git** for version control
- **Supabase account** (free tier available)
- **Google Cloud Console account** (for OAuth)

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `blood-connect-pro`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### Step 2: Run Database Scripts

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `scripts/sql/001_init.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the script

This will create all necessary tables, relationships, and security policies.

### Step 3: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/callback`
   - Your production domain (when deploying)

### Step 4: Set up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**
8. In Supabase, go to **Authentication** → **Providers**
9. Enable **Google** provider and enter your credentials

## 🔧 Local Development Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd blood-connect-pro

# Install dependencies
npm install
# or
pnpm install
```

### Step 2: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Development Redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

**Where to find these values:**
- Go to your Supabase project dashboard
- Click **Settings** → **API**
- Copy **Project URL** and **anon public** key

### Step 3: Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏥 Sample Data Setup

### Add Sample Hospitals

Run this SQL in your Supabase SQL Editor to add sample hospitals:

```sql
INSERT INTO public.hospitals (name, location_lat, location_lng, contact_phone) VALUES
('City General Hospital', 40.7128, -74.0060, '+1-555-0101'),
('Metro Medical Center', 40.7589, -73.9851, '+1-555-0102'),
('Regional Blood Bank', 40.7505, -73.9934, '+1-555-0103'),
('University Hospital', 40.6892, -74.0445, '+1-555-0104'),
('Community Health Center', 40.7282, -73.7949, '+1-555-0105');
```

### Add Sample Weather Alerts (Optional)

```sql
INSERT INTO public.weather_alerts (location_lat, location_lng, alert_type, severity, message, start_time, end_time) VALUES
(40.7128, -74.0060, 'severe_weather', 'high', 'Heavy snow expected. Consider rescheduling non-essential travel.', NOW(), NOW() + INTERVAL '24 hours'),
(40.7589, -73.9851, 'extreme_heat', 'medium', 'High temperatures expected. Stay hydrated and avoid prolonged outdoor activities.', NOW(), NOW() + INTERVAL '12 hours');
```

## 🚀 Production Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository

2. **Configure Environment Variables**
   - In Vercel dashboard, go to **Settings** → **Environment Variables**
   - Add all variables from your `.env.local` file
   - Update URLs to use your production domain

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

4. **Update Supabase Settings**
   - In Supabase, update **Site URL** to your Vercel domain
   - Add your production domain to **Redirect URLs**

### Option 2: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "New site from Git"
   - Choose your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add your environment variables

### Option 3: Railway

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure**
   - Railway will auto-detect Next.js
   - Add environment variables in dashboard

## 🔍 Testing Your Setup

### 1. Test Authentication
- Go to `/login`
- Try signing up with email/password
- Test Google OAuth (if configured)
- Verify redirect to onboarding flow

### 2. Test Onboarding Flow
- Complete the 3-step onboarding process
- Verify profile data is saved to database
- Check that you're redirected to dashboard

### 3. Test Emergency Request System
- Create an emergency request from dashboard
- Verify request appears in database
- Test the matching algorithm

### 4. Test Real-time Features
- Open multiple browser tabs
- Create a request in one tab
- Verify it appears in real-time in other tabs

## 🛠️ Troubleshooting

### Common Issues

**1. Database Connection Errors**
- Verify your Supabase URL and anon key
- Check that RLS policies are properly configured
- Ensure your IP is not blocked

**2. Authentication Issues**
- Verify redirect URLs in Supabase settings
- Check OAuth provider configuration
- Ensure email templates are configured

**3. Build Errors**
- Clear `.next` folder and rebuild
- Check for TypeScript errors
- Verify all dependencies are installed

**4. Real-time Notifications Not Working**
- Check Supabase real-time is enabled
- Verify WebSocket connections
- Check browser console for errors

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
NEXT_PUBLIC_DEBUG=true
```

## 📊 Monitoring Setup

### Vercel Analytics
1. Go to Vercel dashboard
2. Navigate to **Analytics** tab
3. Enable analytics for your project
4. Add the analytics ID to your environment variables

### Supabase Monitoring
1. Go to Supabase dashboard
2. Navigate to **Reports** tab
3. Monitor database performance
4. Set up alerts for errors

## 🔒 Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Strong database passwords
- [ ] HTTPS enabled in production
- [ ] Environment variables secured
- [ ] OAuth providers properly configured
- [ ] Input validation implemented
- [ ] Error handling in place

## 📱 Mobile Testing

Test your application on mobile devices:

1. **Chrome DevTools**
   - Open DevTools (F12)
   - Click device toggle icon
   - Test responsive design

2. **Real Devices**
   - Use ngrok for local testing
   - Deploy to staging environment
   - Test on actual mobile devices

## 🎯 Performance Optimization

### Database Optimization
- Add indexes for frequently queried columns
- Use database views for complex queries
- Implement connection pooling

### Frontend Optimization
- Enable Next.js Image Optimization
- Implement code splitting
- Use React.memo for expensive components
- Optimize bundle size

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check Next.js documentation
4. Create an issue in the repository
5. Contact the development team

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
- Update dependencies monthly
- Monitor database performance
- Review and update security policies
- Backup database regularly
- Monitor error logs

### Version Updates
- Test updates in staging environment
- Update documentation
- Notify users of breaking changes
- Plan rollback strategy

---

**Congratulations!** 🎉 You now have a fully functional BloodConnect Pro application. The system is ready to help save lives through efficient blood donation management.