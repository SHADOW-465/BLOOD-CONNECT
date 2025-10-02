# BloodConnect Pro - Advanced Blood Donation Management System

A comprehensive, production-ready blood donation management application built with Next.js, Supabase, and neumorphic UI design. BloodConnect Pro connects donors with emergency blood requests through intelligent matching algorithms and real-time notifications.

## 🚀 Features

### 1. Emergency Request System (Priority 1)
- **SOS Emergency Button**: One-tap emergency blood request with comprehensive patient information
- **Smart Matching Algorithm**: Advanced compatibility matching based on blood type, availability, donation history, and response rates
- **Real-time Status Updates**: Live tracking of donor responses and estimated arrival times
- **Patient Details**: Complete patient information including name, age, hospital, and contact details

### 2. Advanced Donor Management
- **Smart Onboarding**: 3-step eligibility checker before full registration
- **Dynamic Profiles**: Auto-updating eligibility based on donation history
- **Donation Calendar**: Personal donation schedule with optimal timing suggestions
- **Medical History Vault**: Secure storage of health records and test results
- **Availability Status**: Quick toggle for temporary unavailability with reason

### 3. Intelligent Scheduling System
- **Multi-Channel Reminders**: Push, SMS, email, and voice call reminders
- **Weather Integration**: Reschedule alerts during extreme weather conditions
- **Queue Management**: Real-time wait times and queue position tracking
- **Flexible Rescheduling**: One-tap reschedule with alternative suggestions

### 4. Neumorphic UI Design
- **Consistent Soft UI**: Beautiful neumorphic design throughout the application
- **Responsive Components**: Mobile-first design with smooth animations
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS with custom neumorphic components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Form Management**: React Hook Form with Zod validation

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── requests/             # Emergency request endpoints
│   │   ├── medical-history/      # Medical record management
│   │   ├── notifications/        # Notification system
│   │   └── donation-calendar/    # Scheduling endpoints
│   ├── blood-onboarding/         # 3-step onboarding flow
│   │   ├── eligibility/          # Eligibility checker
│   │   ├── profile/              # Profile setup
│   │   └── availability/         # Availability & consent
│   ├── dashboard/                # Main dashboard
│   ├── emergency-requests/       # Emergency request management
│   ├── profile/                  # Profile management
│   ├── schedule/                 # Donation scheduling
│   └── login/                    # Authentication
├── components/                   # Reusable components
│   ├── nui.tsx                   # Neumorphic UI components
│   └── ...                       # Other components
├── lib/                          # Utility libraries
│   ├── compatibility.ts          # Blood type compatibility logic
│   ├── supabase/                 # Supabase client configuration
│   └── utils.ts                  # General utilities
├── scripts/                      # Database scripts
│   └── sql/                      # SQL initialization scripts
└── public/                       # Static assets
```

## 🗄️ Database Schema

The database schema is defined in the `scripts/sql/001_init.sql` file. This script creates all the necessary tables, columns, and relationships for the application to function correctly.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended)
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blood-connect-pro
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new project on [Supabase](https://supabase.com/).
   - Navigate to the **SQL Editor** in your Supabase project dashboard.
   - Open the `scripts/sql/001_init.sql` file from this repository, copy its contents, and run it in the SQL Editor. This will create all the necessary database tables.
   - **(Optional but Recommended)** To populate your database with sample data for testing, run the contents of `scripts/seed.sql` in the SQL Editor.

4. **Environment Variables**
   Create a `.env.local` file in the root of the project and add the following, replacing the placeholder values with your actual Supabase project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   You can find these keys in your Supabase project settings under **API**.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Supabase Setup
1. Enable Row Level Security (RLS) on all tables
2. Configure OAuth providers (Google) in Supabase Auth settings
3. Set up email templates for notifications
4. Configure real-time subscriptions for live updates

### Google OAuth Setup
1. Create a Google Cloud Console project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Configure in Supabase Auth settings

## 📱 Key Features Implementation

### Smart Matching Algorithm
The application uses a sophisticated matching algorithm that considers:
- Blood type compatibility (ABO and Rh factors)
- Geographic proximity
- Donor availability status
- Donation history and reliability
- Response rates to previous requests
- Urgency-based weighting

### Real-time Updates
- Supabase real-time subscriptions for live data
- WebSocket connections for instant notifications
- Optimistic UI updates for better user experience

### Neumorphic Design System
- Custom component library with consistent styling
- Soft shadows and highlights for depth
- Responsive design with mobile-first approach
- Accessibility features and keyboard navigation

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication with Supabase Auth
- Secure API routes with user validation
- Input sanitization and validation
- HTTPS enforcement in production

## 📊 Performance Optimizations

- Server-side rendering with Next.js
- Image optimization and lazy loading
- Database query optimization
- Caching strategies for frequently accessed data
- Bundle splitting and code optimization

## 🧪 Testing

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📈 Monitoring & Analytics

- Built-in error tracking
- Performance monitoring
- User analytics
- Real-time metrics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Contact the development team

## 🔮 Future Enhancements

- Mobile app development (React Native)
- AI-powered donor recommendations
- Integration with hospital systems
- Advanced analytics and reporting
- Multi-language support
- Blockchain-based donor verification

---

**BloodConnect Pro** - Connecting lives through technology 💉❤️