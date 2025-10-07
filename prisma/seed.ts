import { PrismaClient, BloodType, RhFactor, UrgencyLevel, RequestStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample hospitals
  const hospitals = await Promise.all([
    prisma.hospital.create({
      data: {
        name: 'City General Hospital',
        locationLat: 40.7128,
        locationLng: -74.0060,
        contactPhone: '+1-555-0101'
      }
    }),
    prisma.hospital.create({
      data: {
        name: 'Regional Medical Center',
        locationLat: 40.7589,
        locationLng: -73.9851,
        contactPhone: '+1-555-0102'
      }
    }),
    prisma.hospital.create({
      data: {
        name: 'Community Health Center',
        locationLat: 40.7505,
        locationLng: -73.9934,
        contactPhone: '+1-555-0103'
      }
    })
  ])

  console.log(`✅ Created ${hospitals.length} hospitals`)

  // Create sample blood inventory
  const bloodTypes: BloodType[] = ['O', 'A', 'B', 'AB']
  const rhFactors: RhFactor[] = ['POSITIVE', 'NEGATIVE']

  for (const hospital of hospitals) {
    for (const bloodType of bloodTypes) {
      for (const rh of rhFactors) {
        await prisma.inventory.create({
          data: {
            hospitalId: hospital.id,
            bloodType,
            rh,
            units: Math.floor(Math.random() * 20) + 5, // 5-25 units
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        })
      }
    }
  }

  console.log('✅ Created blood inventory records')

  // Create sample emergency requests (these will be associated with actual users when they create requests)
  const sampleRequests = [
    {
      bloodType: 'O' as BloodType,
      rh: 'POSITIVE' as RhFactor,
      urgency: 'CRITICAL' as UrgencyLevel,
      unitsNeeded: 2,
      locationLat: 40.7128,
      locationLng: -74.0060,
      patientName: 'John Doe',
      patientAge: 45,
      hospital: 'City General Hospital',
      contact: '+1-555-0123',
      status: 'OPEN' as RequestStatus
    },
    {
      bloodType: 'A' as BloodType,
      rh: 'NEGATIVE' as RhFactor,
      urgency: 'HIGH' as UrgencyLevel,
      unitsNeeded: 1,
      locationLat: 40.7589,
      locationLng: -73.9851,
      patientName: 'Jane Smith',
      patientAge: 32,
      hospital: 'Regional Medical Center',
      contact: '+1-555-0456',
      status: 'OPEN' as RequestStatus
    }
  ]

  // Note: These requests won't have a requesterId since we don't have actual users yet
  // In a real scenario, you'd create these through the API with authenticated users
  console.log('ℹ️  Sample emergency requests would be created here (requires authenticated users)')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
