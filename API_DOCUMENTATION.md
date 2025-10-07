# Blood Connect API Documentation

This document provides comprehensive documentation for all API endpoints in the Blood Connect application.

## Base URL
- Development: `http://localhost:5000`
- Production: `https://your-domain.com`

## Authentication
All protected endpoints require authentication via Supabase. The user must be logged in and have a valid session.

## API Endpoints

### Emergency Requests

#### GET `/api/requests-v2`
Fetch all active emergency requests.

**Response:**
```json
[
  {
    "id": "uuid",
    "requesterId": "uuid",
    "bloodType": "O",
    "rh": "POSITIVE",
    "urgency": "CRITICAL",
    "unitsNeeded": 2,
    "locationLat": 40.7128,
    "locationLng": -74.0060,
    "status": "OPEN",
    "patientName": "John Doe",
    "patientAge": 45,
    "hospital": "City General Hospital",
    "contact": "+1-555-0123",
    "createdAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-01-02T00:00:00Z",
    "requester": {
      "id": "uuid",
      "name": "Requester Name",
      "phone": "+1-555-0123"
    }
  }
]
```

#### POST `/api/requests-v2`
Create a new emergency request.

**Request Body:**
```json
{
  "bloodType": "O",
  "rh": "POSITIVE",
  "urgency": "CRITICAL",
  "unitsNeeded": 2,
  "locationLat": 40.7128,
  "locationLng": -74.0060,
  "patientName": "John Doe",
  "patientAge": 45,
  "hospital": "City General Hospital",
  "contact": "+1-555-0123"
}
```

**Response:**
```json
{
  "message": "Request created successfully",
  "data": {
    "id": "uuid",
    "requesterId": "uuid",
    "bloodType": "O",
    "rh": "POSITIVE",
    "urgency": "CRITICAL",
    "unitsNeeded": 2,
    "locationLat": 40.7128,
    "locationLng": -74.0060,
    "status": "OPEN",
    "patientName": "John Doe",
    "patientAge": 45,
    "hospital": "City General Hospital",
    "contact": "+1-555-0123",
    "createdAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-01-02T00:00:00Z"
  },
  "id": "uuid"
}
```

### Profiles

#### GET `/api/profile`
Get current user's profile.

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "phone": "+1-555-0123",
  "bloodType": "O",
  "rh": "POSITIVE",
  "lastDonationDate": "2023-12-01",
  "locationLat": 40.7128,
  "locationLng": -74.0060,
  "radiusKm": 10,
  "availabilityStatus": "AVAILABLE",
  "availabilityReason": null,
  "medicalNotes": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/profile`
Create or update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1-555-0123",
  "bloodType": "O",
  "rh": "POSITIVE",
  "locationLat": 40.7128,
  "locationLng": -74.0060,
  "radiusKm": 10,
  "availabilityStatus": "AVAILABLE",
  "medicalNotes": "No known allergies"
}
```

### Request Matches

#### POST `/api/requests/[id]/accept`
Accept a blood request.

**Response:**
```json
{
  "message": "Request accepted successfully",
  "matchId": "uuid"
}
```

### Donations

#### GET `/api/donations`
Get user's donation history.

**Response:**
```json
[
  {
    "id": "uuid",
    "donorId": "uuid",
    "requestId": "uuid",
    "volumeMl": 450,
    "donatedAt": "2024-01-01T00:00:00Z",
    "status": "VERIFIED",
    "confirmationToken": "uuid",
    "confirmedAt": "2024-01-01T00:00:00Z",
    "qrCodeUrl": "https://example.com/qr/uuid",
    "request": {
      "id": "uuid",
      "patientName": "John Doe",
      "hospital": "City General Hospital",
      "bloodType": "O",
      "rh": "POSITIVE"
    }
  }
]
```

#### POST `/api/donations`
Record a new donation.

**Request Body:**
```json
{
  "requestId": "uuid",
  "volumeMl": 450
}
```

### Appointments

#### GET `/api/appointments`
Get user's appointments.

**Response:**
```json
[
  {
    "id": "uuid",
    "donorId": "uuid",
    "scheduledAt": "2024-01-15T10:00:00Z",
    "location": "City General Hospital",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/api/appointments`
Create a new appointment.

**Request Body:**
```json
{
  "scheduledAt": "2024-01-15T10:00:00Z",
  "location": "City General Hospital"
}
```

### Notifications

#### GET `/api/notifications`
Get user's notifications.

**Query Parameters:**
- `unreadOnly` (optional): If true, only return unread notifications

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "EMERGENCY_REQUEST",
    "title": "New Blood Request Nearby",
    "message": "A patient needs O+ blood at City General Hospital",
    "data": {
      "requestId": "uuid",
      "distance": 2.5
    },
    "read": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### PUT `/api/notifications`
Mark notifications as read.

**Request Body:**
```json
{
  "notificationIds": ["uuid1", "uuid2"]
}
```

### Medical History

#### GET `/api/medical-history`
Get user's medical history.

**Response:**
```json
[
  {
    "id": "uuid",
    "donorId": "uuid",
    "recordType": "DONATION",
    "title": "Blood Donation",
    "description": "Regular blood donation",
    "dateRecorded": "2024-01-01",
    "doctorName": "Dr. Smith",
    "clinicName": "City General Hospital",
    "fileUrl": null,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/api/medical-history`
Add a medical record.

**Request Body:**
```json
{
  "recordType": "HEALTH_CHECK",
  "title": "Annual Health Check",
  "description": "Routine health examination",
  "dateRecorded": "2024-01-01",
  "doctorName": "Dr. Smith",
  "clinicName": "City General Hospital",
  "fileUrl": "https://example.com/report.pdf"
}
```

### Donation Calendar

#### GET `/api/donation-calendar`
Get user's donation calendar.

**Response:**
```json
[
  {
    "id": "uuid",
    "donorId": "uuid",
    "scheduledDate": "2024-01-15",
    "location": "City General Hospital",
    "status": "SCHEDULED",
    "reminderSent": false,
    "notes": "Regular donation",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/api/donation-calendar`
Schedule a donation.

**Request Body:**
```json
{
  "scheduledDate": "2024-01-15",
  "location": "City General Hospital",
  "notes": "Regular donation"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Data Types

### Blood Types
- `O`, `A`, `B`, `AB`

### Rh Factors
- `POSITIVE` (+)
- `NEGATIVE` (-)

### Urgency Levels
- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

### Request Status
- `OPEN`
- `MATCHED`
- `FULFILLED`
- `CANCELED`

### Match Status
- `NOTIFIED`
- `ACCEPTED`
- `DECLINED`
- `EN_ROUTE`
- `ARRIVED`

### Appointment Status
- `PENDING`
- `CONFIRMED`
- `COMPLETED`
- `CANCELED`

### Donation Status
- `RECORDED`
- `VERIFIED`

### Availability Status
- `AVAILABLE`
- `UNAVAILABLE`

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per user
- 1000 requests per hour per user

## Webhooks

The API supports webhooks for real-time notifications:
- Request created
- Request matched
- Donation completed
- Appointment scheduled

## SDKs and Libraries

### JavaScript/TypeScript
```typescript
import { DatabaseService } from '@/lib/database'

// Create a request
const request = await DatabaseService.createEmergencyRequest({
  requesterId: 'user-id',
  bloodType: 'O',
  rh: 'POSITIVE',
  urgency: 'CRITICAL',
  locationLat: 40.7128,
  locationLng: -74.0060
})
```

## Support

For API support and questions:
- Check the console logs for detailed error messages
- Review the Prisma setup guide
- Contact the development team

## Changelog

### v2.0.0 (Current)
- Added Prisma ORM integration
- Improved type safety
- Enhanced error handling
- Added comprehensive validation
- Implemented automatic donor matching

### v1.0.0 (Legacy)
- Basic Supabase integration
- Simple CRUD operations
- Manual donor matching
