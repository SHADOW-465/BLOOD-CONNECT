# BloodConnect Pro - Setup Guide

This guide will walk you through the steps to set up and run the BloodConnect Pro web application on your local machine.

## Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or later)
*   [pnpm](https://pnpm.io/installation) (or your preferred package manager)
*   A [Supabase](https://supabase.io/) account

## 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/your-repo/bloodconnect-pro.git
cd bloodconnect-pro
```

## 2. Install Dependencies

Install the project dependencies using pnpm:

```bash
pnpm install
```

## 3. Set up Supabase

1.  **Create a new Supabase project:**
    *   Go to the [Supabase Dashboard](https://app.supabase.io/) and create a new project.
    *   Save your database password securely.

2.  **Get your API keys:**
    *   In your Supabase project dashboard, go to **Project Settings** > **API**.
    *   You will need the **Project URL** and the **`anon` public key**.

3.  **Run the database schema:**
    *   Go to the **SQL Editor** in your Supabase project dashboard.
    *   Copy the content of `scripts/sql/001_init.sql` from this repository and paste it into the SQL editor.
    *   Click **Run** to create the necessary tables and policies.

4.  **Enable Google Authentication (Optional):**
    *   To enable Google OAuth, you will need to create a new project in the [Google Cloud Console](https://console.cloud.google.com/) and configure the OAuth consent screen and credentials.
    *   Follow the official [Supabase guide](https://supabase.com/docs/guides/auth/social-login/auth-google) for detailed instructions.
    *   Once you have your Google client ID and secret, add them to your Supabase project under **Authentication** > **Providers** > **Google**.

## 4. Set up Environment Variables

Create a new file named `.env.local` in the root of the project. Copy the content of `.env.example` (if it exists) or add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_KEY` with the values you obtained from your Supabase project settings.

## 5. Run the Development Server

Now you can run the development server:

```bash
pnpm dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## How to Log In

1.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
2.  You will be redirected to the login page.
3.  You can sign up with a new email and password, or use Google OAuth if you have configured it.
4.  After signing up, you will be taken through the 3-step onboarding process.
5.  Once onboarding is complete, you will be redirected to the main dashboard.
