# BloodConnect Pro - Replit Setup

## Project Overview
BloodConnect Pro is a comprehensive blood donation management system built with Next.js 14, React 18, and Supabase. It connects blood donors with emergency requests through intelligent matching algorithms and real-time notifications.

## Current Setup Status
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with neumorphic design components
- **Backend**: Supabase (requires configuration)
- **Port**: 5000 (configured for Replit)
- **Environment**: Development mode ready

## Architecture
- **Frontend**: Next.js App Router structure
- **Authentication**: Supabase Auth with OAuth support
- **Database**: PostgreSQL via Supabase
- **Real-time**: Supabase subscriptions
- **Deployment**: Configured for production deployment

## Key Features
1. Emergency blood request system with SOS button
2. Smart donor matching algorithm
3. 3-step onboarding process for donors
4. Donation scheduling and calendar
5. Medical history management
6. Real-time notifications
7. Neumorphic UI design

## Setup Completed
- ✅ Next.js configured for Replit environment (port 5000, 0.0.0.0 host)
- ✅ Environment file created (.env.local)
- ✅ Dependencies installed
- ✅ TypeScript configuration working
- ✅ Development workflow configured
- ✅ Cache control headers for Replit proxy
- ✅ Deployment configuration ready

## Required Configuration (User Action Needed)
To fully activate the application, you need to:

1. **Set up Supabase account**:
   - Create a new Supabase project
   - Copy the project URL and anon key
   - Update `.env.local` with real credentials

2. **Run database migrations**:
   - Execute the SQL script from `scripts/sql/001_init.sql` in Supabase SQL Editor

3. **Configure authentication**:
   - Set up redirect URLs in Supabase Auth settings
   - Optionally configure Google OAuth

## File Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable UI components
- `lib/` - Utility functions and Supabase clients
- `scripts/sql/` - Database initialization scripts
- `styles/` - Global CSS and styling

## Recent Changes (September 24, 2025)
- Configured Next.js for Replit environment
- Set up development workflow on port 5000
- Created environment configuration template
- Added cache control headers for proper Replit proxy handling
- Fixed TypeScript module resolution issues

## User Preferences
- Development environment: Replit
- Frontend framework: Next.js with TypeScript
- Styling: Tailwind CSS with neumorphic design
- Database: Supabase PostgreSQL