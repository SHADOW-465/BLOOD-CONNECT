import { prisma } from './prisma'
import { 
  BloodType, 
  RhFactor, 
  UrgencyLevel, 
  RequestStatus,
  MatchStatus,
  AppointmentStatus,
  DonationStatus,
  AvailabilityStatus,
  RecordType,
  NotificationType,
  CalendarStatus,
  AlertType,
  SeverityLevel,
  QueueStatus
} from '@prisma/client'

// Re-export types for convenience
export {
  BloodType,
  RhFactor,
  UrgencyLevel,
  RequestStatus,
  MatchStatus,
  AppointmentStatus,
  DonationStatus,
  AvailabilityStatus,
  RecordType,
  NotificationType,
  CalendarStatus,
  AlertType,
  SeverityLevel,
  QueueStatus
}

// Database service class for better organization
export class DatabaseService {
  // Emergency Requests
  static async createEmergencyRequest(data: {
    requesterId: string
    bloodType: BloodType
    rh: RhFactor
    urgency?: UrgencyLevel
    unitsNeeded?: number
    locationLat?: number
    locationLng?: number
    patientName?: string
    patientAge?: number
    hospital?: string
    contact?: string
    expiresAt?: Date
  }) {
    return await prisma.emergencyRequest.create({
      data: {
        ...data,
        status: RequestStatus.OPEN,
        expiresAt: data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours default
      }
    })
  }

  static async getEmergencyRequests(filters?: {
    status?: RequestStatus
    bloodType?: BloodType
    rh?: RhFactor
    urgency?: UrgencyLevel
    limit?: number
  }) {
    return await prisma.emergencyRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.bloodType && { bloodType: filters.bloodType }),
        ...(filters?.rh && { rh: filters.rh }),
        ...(filters?.urgency && { urgency: filters.urgency })
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })
  }

  static async getEmergencyRequestById(id: string) {
    return await prisma.emergencyRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        matches: {
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                phone: true,
                bloodType: true,
                rh: true
              }
            }
          }
        }
      }
    })
  }

  // Profiles
  static async createProfile(data: {
    id: string
    name?: string
    phone?: string
    bloodType?: BloodType
    rh?: RhFactor
    locationLat?: number
    locationLng?: number
  }) {
    return await prisma.profile.create({
      data
    })
  }

  static async getProfileById(id: string) {
    return await prisma.profile.findUnique({
      where: { id }
    })
  }

  static async updateProfile(id: string, data: {
    name?: string
    phone?: string
    bloodType?: BloodType
    rh?: RhFactor
    locationLat?: number
    locationLng?: number
    availabilityStatus?: AvailabilityStatus
    availabilityReason?: string
    medicalNotes?: string
    lastDonationDate?: Date
  }) {
    return await prisma.profile.update({
      where: { id },
      data
    })
  }

  // Request Matches
  static async createRequestMatch(data: {
    requestId: string
    donorId: string
    distanceKm?: number
    score?: number
  }) {
    return await prisma.requestMatch.create({
      data: {
        ...data,
        status: MatchStatus.NOTIFIED
      }
    })
  }

  static async acceptRequest(requestId: string, donorId: string) {
    // Update request status
    await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.MATCHED }
    })

    // Create match record
    return await prisma.requestMatch.create({
      data: {
        requestId,
        donorId,
        status: MatchStatus.ACCEPTED
      }
    })
  }

  // Donations
  static async createDonation(data: {
    donorId: string
    requestId?: string
    volumeMl?: number
  }) {
    return await prisma.donation.create({
      data: {
        ...data,
        status: DonationStatus.RECORDED
      }
    })
  }

  static async getDonationsByDonor(donorId: string) {
    return await prisma.donation.findMany({
      where: { donorId },
      orderBy: { donatedAt: 'desc' },
      include: {
        request: {
          select: {
            id: true,
            patientName: true,
            hospital: true,
            bloodType: true,
            rh: true
          }
        }
      }
    })
  }

  // Appointments
  static async createAppointment(data: {
    donorId: string
    scheduledAt: Date
    location?: string
  }) {
    return await prisma.appointment.create({
      data: {
        ...data,
        status: AppointmentStatus.PENDING
      }
    })
  }

  static async getAppointmentsByDonor(donorId: string) {
    return await prisma.appointment.findMany({
      where: { donorId },
      orderBy: { scheduledAt: 'asc' }
    })
  }

  // Notifications
  static async createNotification(data: {
    userId: string
    type: NotificationType
    title: string
    message: string
    data?: any
  }) {
    return await prisma.notification.create({
      data
    })
  }

  static async getNotificationsByUser(userId: string, unreadOnly = false) {
    return await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false })
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async markNotificationAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { read: true }
    })
  }

  // Medical History
  static async createMedicalRecord(data: {
    donorId: string
    recordType: RecordType
    title: string
    description?: string
    dateRecorded: Date
    doctorName?: string
    clinicName?: string
    fileUrl?: string
  }) {
    return await prisma.medicalHistory.create({
      data
    })
  }

  static async getMedicalHistoryByDonor(donorId: string) {
    return await prisma.medicalHistory.findMany({
      where: { donorId },
      orderBy: { dateRecorded: 'desc' }
    })
  }

  // Hospitals
  static async getHospitals() {
    return await prisma.hospital.findMany({
      orderBy: { name: 'asc' }
    })
  }

  static async createHospital(data: {
    name: string
    locationLat?: number
    locationLng?: number
    contactPhone?: string
  }) {
    return await prisma.hospital.create({
      data
    })
  }

  // Donation Calendar
  static async createDonationCalendarEntry(data: {
    donorId: string
    scheduledDate: Date
    location?: string
    notes?: string
  }) {
    return await prisma.donationCalendar.create({
      data: {
        ...data,
        status: CalendarStatus.SCHEDULED
      }
    })
  }

  static async getDonationCalendarByDonor(donorId: string) {
    return await prisma.donationCalendar.findMany({
      where: { donorId },
      orderBy: { scheduledDate: 'asc' }
    })
  }

  // Request Shares
  static async trackRequestShare(data: {
    requestId: string
    sharedBy: string
    platform?: string
  }) {
    return await prisma.requestShare.create({
      data
    })
  }

  // Utility methods
  static async findNearbyDonors(lat: number, lng: number, radiusKm: number = 10) {
    // This would need a more sophisticated query for actual distance calculation
    // For now, we'll use a simple bounding box approach
    const latDelta = radiusKm / 111 // Rough conversion: 1 degree ≈ 111 km
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

    return await prisma.profile.findMany({
      where: {
        locationLat: {
          gte: lat - latDelta,
          lte: lat + latDelta
        },
        locationLng: {
          gte: lng - lngDelta,
          lte: lng + lngDelta
        },
        availabilityStatus: AvailabilityStatus.AVAILABLE
      }
    })
  }

  static async getRequestStats() {
    const [total, open, matched, fulfilled] = await Promise.all([
      prisma.emergencyRequest.count(),
      prisma.emergencyRequest.count({ where: { status: RequestStatus.OPEN } }),
      prisma.emergencyRequest.count({ where: { status: RequestStatus.MATCHED } }),
      prisma.emergencyRequest.count({ where: { status: RequestStatus.FULFILLED } })
    ])

    return {
      total,
      open,
      matched,
      fulfilled,
      completionRate: total > 0 ? (fulfilled / total) * 100 : 0
    }
  }
}

export default prisma
