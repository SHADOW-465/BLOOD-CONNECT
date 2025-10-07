# Blood Connect - Data Requirements Specification

This document outlines the data requirements for the Blood Connect application, inferred from a comprehensive analysis of the frontend codebase, API endpoints, and database schema.

---

## Feature: User Authentication & Profile Management

**Description & User Flow:**
- Users can register and login using email/password or Google OAuth through Supabase Auth
- After login, users are redirected to the dashboard with session persistence
- Users can view and update their profile information including personal details, blood type, and location

**Inferred Data Model:**
- **Entity:** `Profile`
- **Attributes:**
    - `id`: `String (UUID)` - Primary key, references auth.users
    - `name`: `String` - User's full name
    - `phone`: `String` - Contact phone number
    - `bloodType`: `BloodType` - User's blood type (O, A, B, AB)
    - `rh`: `RhFactor` - Rh factor (POSITIVE, NEGATIVE)
    - `lastDonationDate`: `DateTime` - Date of last blood donation
    - `locationLat`: `Float` - Latitude for location-based matching
    - `locationLng`: `Float` - Longitude for location-based matching
    - `radiusKm`: `Int` - Notification radius in kilometers
    - `availabilityStatus`: `AvailabilityStatus` - Current availability (AVAILABLE, UNAVAILABLE)
    - `availabilityReason`: `String` - Reason for unavailability
    - `medicalNotes`: `String` - Medical notes and conditions
    - `createdAt`: `DateTime` - Profile creation timestamp
    - `updatedAt`: `DateTime` - Last profile update timestamp

**Required Data Operations (CRUD):**
- **Create:** New profiles are automatically created when users register via Supabase Auth trigger
- **Read:** Profile data is fetched for dashboard display and user information
- **Update:** Users can update their profile information through the profile page
- **Delete:** Profile deletion cascades when auth user is deleted

**Evidence from Code:**
- `app/login/page.tsx` - Authentication flow with Supabase
- `app/profile/page.tsx` - Profile management interface
- `app/api/profile/route.ts` - Profile CRUD operations
- `prisma/schema.prisma` - Profile model definition with relationships

---

## Feature: Emergency Blood Request System (SOS)

**Description & User Flow:**
- Users can create emergency blood requests through a prominent SOS button
- Request form collects patient details, blood type requirements, urgency level, and location
- System automatically matches compatible donors and creates match records
- Requests are displayed in real-time to nearby compatible donors

**Inferred Data Model:**
- **Entity:** `EmergencyRequest`
- **Attributes:**
    - `id`: `String (UUID)` - Unique request identifier
    - `requesterId`: `String (UUID)` - ID of user creating the request
    - `bloodType`: `BloodType` - Required blood type
    - `rh`: `RhFactor` - Required Rh factor
    - `urgency`: `UrgencyLevel` - Request urgency (LOW, MEDIUM, HIGH, CRITICAL)
    - `unitsNeeded`: `Int` - Number of blood units required
    - `locationLat`: `Float` - Request location latitude
    - `locationLng`: `Float` - Request location longitude
    - `radiusKm`: `Int` - Search radius for donor matching
    - `status`: `RequestStatus` - Current status (OPEN, MATCHED, FULFILLED, CANCELED)
    - `patientName`: `String` - Name of patient needing blood
    - `patientAge`: `Int` - Age of patient
    - `hospital`: `String` - Hospital name where blood is needed
    - `contact`: `String` - Contact information
    - `createdAt`: `DateTime` - Request creation timestamp
    - `expiresAt`: `DateTime` - Request expiration time (24 hours default)

**Required Data Operations (CRUD):**
- **Create:** New emergency requests are created via SOS modal form
- **Read:** Requests are fetched for dashboard display and donor matching
- **Update:** Request status is updated when donors accept or when fulfilled
- **Delete:** Requests are soft-deleted by setting status to CANCELED

**Evidence from Code:**
- `app/AppLayoutClient.tsx` - SOS modal and request creation form
- `app/api/requests-v2/route.ts` - Request creation and retrieval API
- `app/dashboard/page.tsx` - Request display on dashboard
- `prisma/schema.prisma` - EmergencyRequest model with relationships

---

## Feature: Intelligent Donor Matching System

**Description & User Flow:**
- System automatically finds compatible donors based on blood type, location, and availability
- Creates match records when compatible donors are found
- Tracks donor response status and response times
- Calculates compatibility scores and distances

**Inferred Data Model:**
- **Entity:** `RequestMatch`
- **Attributes:**
    - `id`: `String (UUID)` - Unique match identifier
    - `requestId`: `String (UUID)` - Associated emergency request
    - `donorId`: `String (UUID)` - Matched donor profile
    - `distanceKm`: `Float` - Distance between donor and request location
    - `score`: `Float` - Compatibility score (0-1)
    - `status`: `MatchStatus` - Match status (NOTIFIED, ACCEPTED, DECLINED, EN_ROUTE, ARRIVED)
    - `responseTimeSeconds`: `Int` - Time taken for donor to respond
    - `createdAt`: `DateTime` - Match creation timestamp

**Required Data Operations (CRUD):**
- **Create:** Matches are automatically created when compatible donors are found
- **Read:** Matches are retrieved to show donor responses and status
- **Update:** Match status is updated when donors respond or change status
- **Delete:** Matches are deleted when request is canceled or fulfilled

**Evidence from Code:**
- `app/api/requests-v2/route.ts` - Automatic matching logic in request creation
- `app/api/requests/[id]/accept/route.ts` - Donor acceptance handling
- `lib/database.ts` - DatabaseService methods for match management
- `prisma/schema.prisma` - RequestMatch model with relationships

---

## Feature: Donation Tracking & History

**Description & User Flow:**
- Users can record blood donations with QR code confirmation
- System tracks donation history and eligibility periods
- Donations are linked to specific requests when applicable
- QR codes are generated for donation verification

**Inferred Data Model:**
- **Entity:** `Donation`
- **Attributes:**
    - `id`: `String (UUID)` - Unique donation identifier
    - `donorId`: `String (UUID)` - Donor profile ID
    - `requestId`: `String (UUID)` - Associated emergency request (optional)
    - `volumeMl`: `Int` - Volume of blood donated in milliliters
    - `donatedAt`: `DateTime` - Donation timestamp
    - `status`: `DonationStatus` - Donation status (RECORDED, VERIFIED)
    - `confirmationToken`: `String (UUID)` - QR code confirmation token
    - `confirmedAt`: `DateTime` - Confirmation timestamp
    - `confirmedBy`: `String (UUID)` - User who confirmed the donation
    - `qrCodeUrl`: `String` - URL to QR code for verification
    - `tokenExpiresAt`: `DateTime` - Token expiration time (7 days)

**Required Data Operations (CRUD):**
- **Create:** New donations are recorded when users complete blood donation
- **Read:** Donation history is displayed on user profiles and dashboards
- **Update:** Donation status is updated when QR code is scanned and verified
- **Delete:** Donations are not deleted, only status is updated

**Evidence from Code:**
- `app/api/donations/route.ts` - Donation creation and retrieval
- `app/api/donations/[id]/qr/route.ts` - QR code generation and verification
- `app/api/donations/confirm/route.ts` - Donation confirmation process
- `prisma/schema.prisma` - Donation model with confirmation system

---

## Feature: Appointment Scheduling System

**Description & User Flow:**
- Users can schedule blood donation appointments at hospitals
- System tracks appointment status and sends reminders
- Appointments can be rescheduled or canceled
- Integration with hospital availability and queue management

**Inferred Data Model:**
- **Entity:** `Appointment`
- **Attributes:**
    - `id`: `String (UUID)` - Unique appointment identifier
    - `donorId`: `String (UUID)` - Donor profile ID
    - `scheduledAt`: `DateTime` - Scheduled appointment time
    - `location`: `String` - Appointment location/hospital
    - `status`: `AppointmentStatus` - Appointment status (PENDING, CONFIRMED, COMPLETED, CANCELED)
    - `createdAt`: `DateTime` - Appointment creation timestamp

**Required Data Operations (CRUD):**
- **Create:** New appointments are created when users schedule donations
- **Read:** Appointments are displayed on user calendars and dashboards
- **Update:** Appointment status is updated when confirmed, completed, or canceled
- **Delete:** Appointments are soft-deleted by setting status to CANCELED

**Evidence from Code:**
- `app/api/appointments/route.ts` - Appointment CRUD operations
- `app/schedule/page.tsx` - Appointment scheduling interface
- `prisma/schema.prisma` - Appointment model definition

---

## Feature: Medical History Management

**Description & User Flow:**
- Users can maintain their medical history including health checks, vaccinations, and medications
- Medical records are stored securely with doctor and clinic information
- File attachments can be uploaded for medical documents
- History is used for eligibility assessment and health tracking

**Inferred Data Model:**
- **Entity:** `MedicalHistory`
- **Attributes:**
    - `id`: `String (UUID)` - Unique record identifier
    - `donorId`: `String (UUID)` - Donor profile ID
    - `recordType`: `RecordType` - Type of record (DONATION, HEALTH_CHECK, VACCINATION, MEDICATION, ALLERGY)
    - `title`: `String` - Record title
    - `description`: `String` - Detailed description
    - `dateRecorded`: `DateTime` - Date when record was created
    - `doctorName`: `String` - Doctor's name
    - `clinicName`: `String` - Clinic or hospital name
    - `fileUrl`: `String` - URL to attached medical file
    - `createdAt`: `DateTime` - Record creation timestamp

**Required Data Operations (CRUD):**
- **Create:** New medical records are added through the medical history interface
- **Read:** Medical history is displayed on user profiles and used for eligibility
- **Update:** Medical records can be updated with additional information
- **Delete:** Medical records can be deleted by the user

**Evidence from Code:**
- `app/api/medical-history/route.ts` - Medical history CRUD operations
- `prisma/schema.prisma` - MedicalHistory model with file support

---

## Feature: Notification System

**Description & User Flow:**
- Users receive notifications for emergency requests, appointment reminders, and system updates
- Notifications can be marked as read/unread
- Different notification types with structured data payloads
- Real-time notification delivery through Supabase

**Inferred Data Model:**
- **Entity:** `Notification`
- **Attributes:**
    - `id`: `String (UUID)` - Unique notification identifier
    - `userId`: `String (UUID)` - Recipient user ID
    - `type`: `NotificationType` - Notification type (EMERGENCY_REQUEST, APPOINTMENT_REMINDER, DONATION_REMINDER, SYSTEM_UPDATE)
    - `title`: `String` - Notification title
    - `message`: `String` - Notification message content
    - `data`: `Json` - Structured data payload (request details, appointment info, etc.)
    - `read`: `Boolean` - Read status
    - `createdAt`: `DateTime` - Notification creation timestamp

**Required Data Operations (CRUD):**
- **Create:** Notifications are created when events occur (requests, appointments, etc.)
- **Read:** Notifications are fetched for user notification center
- **Update:** Notification read status is updated when user views them
- **Delete:** Notifications can be deleted after being read

**Evidence from Code:**
- `app/api/notifications/route.ts` - Notification CRUD operations
- `app/notifications/page.tsx` - Notification center interface
- `prisma/schema.prisma` - Notification model with JSON data support

---

## Feature: Donation Calendar & Scheduling

**Description & User Flow:**
- Users can schedule future donations and set reminders
- Calendar tracks donation eligibility periods and optimal timing
- Integration with appointment system and reminder notifications
- Personal donation history and streak tracking

**Inferred Data Model:**
- **Entity:** `DonationCalendar`
- **Attributes:**
    - `id`: `String (UUID)` - Unique calendar entry identifier
    - `donorId`: `String (UUID)` - Donor profile ID
    - `scheduledDate`: `DateTime` - Scheduled donation date
    - `location`: `String` - Donation location
    - `status`: `CalendarStatus` - Calendar status (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED)
    - `reminderSent`: `Boolean` - Whether reminder has been sent
    - `notes`: `String` - Additional notes
    - `createdAt`: `DateTime` - Calendar entry creation timestamp

**Required Data Operations (CRUD):**
- **Create:** Calendar entries are created when users schedule donations
- **Read:** Calendar entries are displayed on user calendars and dashboards
- **Update:** Calendar status is updated when appointments are confirmed or completed
- **Delete:** Calendar entries are soft-deleted by setting status to CANCELLED

**Evidence from Code:**
- `app/api/donation-calendar/route.ts` - Calendar CRUD operations
- `prisma/schema.prisma` - DonationCalendar model with reminder system

---

## Feature: Hospital & Inventory Management

**Description & User Flow:**
- System maintains a database of hospitals and blood banks
- Tracks blood inventory levels by type and expiration dates
- Location-based hospital search and contact information
- Integration with appointment scheduling and queue management

**Inferred Data Model:**
- **Entity:** `Hospital`
- **Attributes:**
    - `id`: `String (UUID)` - Unique hospital identifier
    - `name`: `String` - Hospital name
    - `locationLat`: `Float` - Hospital latitude
    - `locationLng`: `Float` - Hospital longitude
    - `contactPhone`: `String` - Hospital contact phone
    - `createdAt`: `DateTime` - Hospital creation timestamp

- **Entity:** `Inventory`
- **Attributes:**
    - `id`: `String (UUID)` - Unique inventory record identifier
    - `hospitalId`: `String (UUID)` - Associated hospital
    - `bloodType`: `BloodType` - Blood type in inventory
    - `rh`: `RhFactor` - Rh factor
    - `units`: `Int` - Number of units available
    - `expiresAt`: `DateTime` - Expiration date
    - `updatedAt`: `DateTime` - Last inventory update

**Required Data Operations (CRUD):**
- **Create:** Hospitals and inventory records are created by administrators
- **Read:** Hospital and inventory data is used for location search and availability
- **Update:** Inventory levels are updated when blood is received or used
- **Delete:** Records are soft-deleted when hospitals are deactivated

**Evidence from Code:**
- `prisma/schema.prisma` - Hospital and Inventory models
- `lib/database.ts` - DatabaseService methods for hospital management

---

## Feature: Queue Management System

**Description & User Flow:**
- Real-time queue management for donation centers
- Tracks wait times and queue positions
- Integration with appointment scheduling
- Status updates for queue progression

**Inferred Data Model:**
- **Entity:** `DonationQueue`
- **Attributes:**
    - `id`: `String (UUID)` - Unique queue entry identifier
    - `locationId`: `String (UUID)` - Hospital or donation center
    - `donorId`: `String (UUID)` - Donor in queue
    - `checkInTime`: `DateTime` - When donor checked in
    - `estimatedWaitMinutes`: `Int` - Estimated wait time
    - `position`: `Int` - Current position in queue
    - `status`: `QueueStatus` - Queue status (WAITING, IN_PROGRESS, COMPLETED, CANCELLED)
    - `completedAt`: `DateTime` - When donation was completed

**Required Data Operations (CRUD):**
- **Create:** Queue entries are created when donors check in
- **Read:** Queue status is displayed to users and staff
- **Update:** Queue position and status are updated in real-time
- **Delete:** Queue entries are completed when donation is finished

**Evidence from Code:**
- `prisma/schema.prisma` - DonationQueue model with status tracking

---

## Feature: Social Sharing & Request Distribution

**Description & User Flow:**
- Users can share emergency requests on social media and messaging platforms
- Tracks sharing activity and platform usage
- Integration with request matching system
- Amplifies request reach beyond the app

**Inferred Data Model:**
- **Entity:** `RequestShare`
- **Attributes:**
    - `id`: `String (UUID)` - Unique share record identifier
    - `requestId`: `String (UUID)` - Shared emergency request
    - `sharedBy`: `String (UUID)` - User who shared the request
    - `platform`: `String` - Sharing platform (native, clipboard, whatsapp, etc.)
    - `createdAt`: `DateTime` - Share timestamp

**Required Data Operations (CRUD):**
- **Create:** Share records are created when users share requests
- **Read:** Share analytics are used for request reach tracking
- **Update:** Share records are not typically updated
- **Delete:** Share records are retained for analytics

**Evidence from Code:**
- `app/api/requests/[id]/share/route.ts` - Request sharing functionality
- `prisma/schema.prisma` - RequestShare model for analytics

---

## Feature: Weather Integration & Alerts

**Description & User Flow:**
- System monitors weather conditions that might affect donation appointments
- Sends alerts for severe weather that could impact travel
- Integrates with appointment rescheduling system
- Location-based weather monitoring

**Inferred Data Model:**
- **Entity:** `WeatherAlert`
- **Attributes:**
    - `id`: `String (UUID)` - Unique alert identifier
    - `locationLat`: `Float` - Alert location latitude
    - `locationLng`: `Float` - Alert location longitude
    - `alertType`: `AlertType` - Type of weather alert (SEVERE_WEATHER, EXTREME_HEAT, EXTREME_COLD, STORM)
    - `severity`: `SeverityLevel` - Alert severity (LOW, MEDIUM, HIGH, EXTREME)
    - `message`: `String` - Alert message content
    - `startTime`: `DateTime` - Alert start time
    - `endTime`: `DateTime` - Alert end time
    - `createdAt`: `DateTime` - Alert creation timestamp

**Required Data Operations (CRUD):**
- **Create:** Weather alerts are created by external weather services
- **Read:** Alerts are fetched for location-based notification
- **Update:** Alert status is updated as weather conditions change
- **Delete:** Expired alerts are automatically cleaned up

**Evidence from Code:**
- `prisma/schema.prisma` - WeatherAlert model for external integration

---

## Feature: User Onboarding & Eligibility

**Description & User Flow:**
- 3-step onboarding process for new users
- Eligibility check based on age, weight, and health requirements
- Profile setup with blood type and location information
- Availability and consent management

**Inferred Data Model:**
- Uses existing `Profile` entity with additional onboarding-specific fields
- Onboarding state is managed through the application flow
- Eligibility is calculated based on profile data and medical history

**Required Data Operations (CRUD):**
- **Create:** Profile is created during onboarding process
- **Read:** Onboarding progress is tracked through application state
- **Update:** Profile is updated as user completes each onboarding step
- **Delete:** Incomplete profiles can be deleted if user abandons onboarding

**Evidence from Code:**
- `app/blood-onboarding/eligibility/page.tsx` - Eligibility check interface
- `app/blood-onboarding/profile/page.tsx` - Profile setup interface
- `app/blood-onboarding/availability/page.tsx` - Availability and consent setup

---

## Feature: Dashboard & Analytics

**Description & User Flow:**
- Central dashboard showing user's donation impact and statistics
- Real-time display of nearby emergency requests
- Eligibility status and next donation date tracking
- Quick actions for common tasks

**Inferred Data Model:**
- Aggregates data from multiple entities (Profile, Donation, EmergencyRequest, etc.)
- Calculates statistics and impact metrics
- Real-time data updates through Supabase subscriptions

**Required Data Operations (CRUD):**
- **Read:** Dashboard aggregates data from multiple sources
- **Update:** Dashboard updates in real-time as data changes
- **Create/Delete:** Dashboard itself doesn't create or delete data

**Evidence from Code:**
- `app/dashboard/page.tsx` - Main dashboard interface
- `app/dashboard/layout.tsx` - Dashboard layout with header
- `components/MyImpact.tsx` - Impact statistics component
- `components/EligibilityStatus.tsx` - Eligibility status component

---

## Feature: Settings & Preferences

**Description & User Flow:**
- Users can manage their account settings and preferences
- Notification preferences and frequency settings
- Privacy settings and data sharing controls
- Account management and logout functionality

**Inferred Data Model:**
- Uses existing `Profile` entity for user preferences
- Settings are stored as part of the user profile
- Notification preferences are managed through the notification system

**Required Data Operations (CRUD):**
- **Read:** Settings are loaded from user profile
- **Update:** Settings are updated through the settings interface
- **Create/Delete:** Settings are part of the profile entity

**Evidence from Code:**
- `app/settings/page.tsx` - Settings management interface
- `app/profile/page.tsx` - Profile and preference management

---

## Feature: Emergency Request Details & Management

**Description & User Flow:**
- Detailed view of individual emergency requests
- Donor response tracking and status updates
- Request sharing and social media integration
- Request fulfillment and completion tracking

**Inferred Data Model:**
- Uses existing `EmergencyRequest` and `RequestMatch` entities
- Additional request-specific data and status tracking
- Integration with sharing and notification systems

**Required Data Operations (CRUD):**
- **Read:** Request details are displayed on dedicated pages
- **Update:** Request status is updated as donors respond and fulfill
- **Create/Delete:** Requests are managed through the main request system

**Evidence from Code:**
- `app/emergency-requests/[id]/page.tsx` - Individual request details
- `app/emergency-requests/page.tsx` - Request listing and management
- `app/api/requests/[id]/route.ts` - Individual request API operations

---

This comprehensive specification covers all major features identified in the Blood Connect application, providing a complete data model and operational requirements for each feature.