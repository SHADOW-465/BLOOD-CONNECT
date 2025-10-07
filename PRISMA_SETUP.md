# Prisma Setup Guide for Blood Connect

This guide will help you set up Prisma ORM for better database management in your Blood Connect application.

## Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project set up
2. **Node.js**: Version 18 or higher
3. **PostgreSQL**: Your Supabase database

## Installation

1. **Install Prisma dependencies**:
   ```bash
   pnpm add prisma @prisma/client
   pnpm add -D tsx
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in your project root with:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:5000/dashboard

   # Database Configuration (for Prisma)
   # Use your Supabase PostgreSQL connection string
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

   # Optional: For development
   NEXT_PUBLIC_BASE_URL=http://localhost:5000
   ```

## Database Setup

1. **Generate Prisma Client**:
   ```bash
   pnpm run db:generate
   ```

2. **Push schema to database**:
   ```bash
   pnpm run db:push
   ```

3. **Seed the database** (optional):
   ```bash
   pnpm run db:seed
   ```

## Available Scripts

- `pnpm run db:generate` - Generate Prisma client
- `pnpm run db:push` - Push schema changes to database
- `pnpm run db:migrate` - Create and run migrations
- `pnpm run db:studio` - Open Prisma Studio (database GUI)
- `pnpm run db:seed` - Seed database with sample data
- `pnpm run db:reset` - Reset database (⚠️ destructive)

## Database Schema

The Prisma schema includes the following models:

### Core Models
- **Profile**: User profiles with blood type, location, availability
- **EmergencyRequest**: Blood requests with patient details
- **RequestMatch**: Matches between requests and donors
- **Donation**: Blood donation records
- **Appointment**: Donation appointments

### Supporting Models
- **Hospital**: Hospital information and locations
- **Inventory**: Blood inventory tracking
- **MedicalHistory**: Donor medical records
- **Notification**: User notifications
- **DonationCalendar**: Scheduled donations
- **WeatherAlert**: Weather-based alerts
- **DonationQueue**: Queue management
- **RequestShare**: Social sharing tracking

## Usage Examples

### Creating a Blood Request
```typescript
import { DatabaseService } from '@/lib/database'

const request = await DatabaseService.createEmergencyRequest({
  requesterId: 'user-id',
  bloodType: 'O',
  rh: 'POSITIVE',
  urgency: 'CRITICAL',
  locationLat: 40.7128,
  locationLng: -74.0060,
  patientName: 'John Doe',
  hospital: 'City General Hospital'
})
```

### Finding Nearby Donors
```typescript
const nearbyDonors = await DatabaseService.findNearbyDonors(
  40.7128, // latitude
  -74.0060, // longitude
  10 // radius in km
)
```

### Getting Request Statistics
```typescript
const stats = await DatabaseService.getRequestStats()
console.log(`Total requests: ${stats.total}`)
console.log(`Completion rate: ${stats.completionRate}%`)
```

## Migration from Direct Supabase

The application now supports both approaches:

1. **Legacy API** (`/api/requests`): Uses direct Supabase calls
2. **New API** (`/api/requests-v2`): Uses Prisma ORM

To migrate completely to Prisma:

1. Update frontend calls to use the new API endpoints
2. Replace direct Supabase queries with DatabaseService methods
3. Remove old API routes once migration is complete

## Benefits of Prisma

1. **Type Safety**: Full TypeScript support with auto-generated types
2. **Better Developer Experience**: IntelliSense, auto-completion
3. **Database Agnostic**: Easy to switch between databases
4. **Migration Management**: Version-controlled schema changes
5. **Query Optimization**: Built-in query optimization
6. **Relations**: Easy handling of complex relationships
7. **Validation**: Built-in data validation

## Troubleshooting

### Common Issues

1. **Connection Issues**: Verify your DATABASE_URL is correct
2. **Schema Conflicts**: Use `npm run db:reset` to start fresh (⚠️ data loss)
3. **Type Errors**: Run `npm run db:generate` after schema changes
4. **Migration Issues**: Check Prisma logs for detailed error messages

### Getting Help

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)
- Check the console logs for detailed error messages

## Next Steps

1. Set up your environment variables
2. Run the database setup commands
3. Test the new API endpoints
4. Gradually migrate your frontend to use Prisma
5. Add new features using the Prisma schema

Happy coding! 🩸❤️
