# BloodConnect Pro - Implemented Features (Phase 1)

This document outlines the features that have been implemented in the first phase of development for BloodConnect Pro.

## Core Functionality

*   **User Authentication:**
    *   Secure user registration and login with email/password and Google OAuth.
    *   Powered by Supabase Auth.
    *   Neumorphic UI for the login screen.

*   **Donor Onboarding:**
    *   A comprehensive 3-step onboarding flow for new donors:
        1.  **Eligibility Check:** A quick check to ensure the donor meets the basic requirements (age, weight, etc.).
        2.  **Profile Setup:** Collects essential information like blood type, Rh factor, and notification radius.
        3.  **Availability & Consent:** Allows donors to set their availability status and provide consent for contact sharing.
    *   Onboarding progress is saved to the user's profile in the Supabase database.

## Dashboard

*   **Main Dashboard:**
    *   A central hub for logged-in users.
    *   Built with a consistent neumorphic UI.

*   **Emergency Request System (SOS):**
    *   A prominent "SOS" button to initiate an emergency blood request.
    *   A modal form allows the user to specify the required blood type, Rh factor, and urgency level.
    *   The request is saved to the database and displayed to other users in real-time.

*   **Impact Summary:**
    *   A card that displays the user's donation impact:
        *   Total number of donations.
        *   Estimated number of lives saved.
        *   Current donation streak (to be fully implemented).

*   **Next Donation Tracker:**
    *   A card that shows the user's eligibility for their next donation.
    *   Displays a countdown to the next eligible date based on their last donation.
    *   Shows upcoming confirmed appointments.

*   **Nearby Requests:**
    *   A real-time list of nearby emergency blood requests.
    *   Displays the blood type, urgency, and distance for each request.

*   **Quick Actions:**
    *   A card with quick links to:
        *   Schedule a donation.
        *   Update availability.
        *   View/edit profile.

## Backend and Database

*   **Supabase Backend:**
    *   Uses Supabase for database, authentication, and real-time features.
*   **PostgreSQL Database:**
    *   A well-defined database schema with tables for profiles, requests, donations, appointments, etc.
    *   Row-level security policies to protect user data.
*   **API Routes:**
    *   Next.js API routes for handling actions like creating emergency requests.
*   **Real-time Functionality:**
    *   Uses Supabase real-time subscriptions to keep the dashboard updated with new requests.
 

# BloodConnect Pro - Features and Technical Specification

This document outlines the features for the BloodConnect Pro application. It is intended to be a comprehensive guide for the development team to build a full-stack, production-ready, mobile-first application. Each feature is described in detail, including its purpose, user stories, and the corresponding backend database schema with SQL scripts.

## 1. Core Feature: User Authentication and Profile Management

### 1.1. Feature Description

This feature provides a secure and robust system for user authentication and profile management. It allows users to create an account, log in, log out, and manage their personal and medical information. The system supports different user roles (Donor, Recipient, Both) and includes a verification process to ensure the authenticity of donors.

### 1.2. User Stories

*   **As a new user,** I want to be able to register for an account by providing my basic personal and medical information so that I can either donate or request blood.
*   **As a registered user,** I want to be able to log in to my account securely using my email and password.
*   **As a logged-in user,** I want to be able to view and edit my profile information, including my contact details, medical information, and availability status.
*   **As a donor,** I want my profile to be verified by the platform to increase my credibility.
*   **As a user who has forgotten my password,** I want to be able to reset my password securely through a link sent to my email.

### 1.3. Database Schema and SQL

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role ENUM('donor', 'recipient', 'both') NOT NULL DEFAULT 'donor',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    availability_status ENUM('available', 'unavailable') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    date_of_birth DATE,
    blood_type VARCHAR(5),
    rh_factor ENUM('+', '-') NOT NULL,
    weight_kg DECIMAL(5, 2),
    location VARCHAR(255),
    last_donation_date DATE,
    medical_conditions TEXT,
    emergency_contact VARCHAR(255),
    profile_picture_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Emergency Request System

### 2.1. Feature Description

The Emergency Request System is a critical component of BloodConnect Pro, enabling users to post urgent requests for blood. This system is designed to quickly notify nearby compatible donors in emergency situations. It includes a smart matching algorithm to connect requesters with the most suitable donors based on blood type, location, and availability.

### 2.2. User Stories

*   **As a user in need of blood,** I want to be able to create an emergency request with all the necessary details (e.g., blood type, units needed, hospital, urgency) so that I can find a donor quickly.
*   **As a donor,** I want to be notified of new blood requests that match my blood type and are in my vicinity.
*   **As a donor,** I want to be able to view the details of a blood request and respond to it if I am available to donate.
*   **As a requester,** I want to see the responses from donors for my request and be able to track the status of my request (e.g., active, fulfilled, expired).

### 2.3. Database Schema and SQL

```sql
CREATE TABLE blood_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_id INT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    rh_factor ENUM('+', '-') NOT NULL,
    units_needed INT NOT NULL,
    urgency ENUM('moderate', 'urgent', 'critical') NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    notes TEXT,
    status ENUM('active', 'fulfilled', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
    required_by DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE request_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    donor_id INT NOT NULL,
    response_status ENUM('accepted', 'declined', 'pending') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (request_id, donor_id)
);
```

## 3. Advanced Donor Management

### 3.1. Feature Description

The Advanced Donor Management feature provides donors with a comprehensive set of tools to manage their donation activities. This includes a dynamic profile that tracks donation history, eligibility status, and personal health data. The system also suggests optimal donation times and provides a secure vault for medical records.

### 3.2. User Stories

*   **As a donor,** I want to see my complete donation history, including dates, locations, and the number of units donated.
*   **As a donor,** I want the system to automatically calculate and display my next eligible donation date based on my last donation.
*   **As a donor,** I want to be able to set my availability status (e.g., available, temporarily unavailable) so that I don't receive requests when I'm unable to donate.
*   **As a donor,** I want to securely store my health records and test results in a medical history vault.

### 3.3. Database Schema and SQL

```sql
CREATE TABLE donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    donation_date DATE NOT NULL,
    units_donated INT NOT NULL,
    location VARCHAR(255),
    donation_type ENUM('whole_blood', 'platelets', 'plasma') NOT NULL DEFAULT 'whole_blood',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE health_screenings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    screening_date DATE NOT NULL,
    hemoglobin_level DECIMAL(5, 2),
    blood_pressure VARCHAR(10),
    temperature DECIMAL(4, 2),
    is_eligible BOOLEAN NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 4. Intelligent Scheduling System

### 4.1. Feature Description

The Intelligent Scheduling System simplifies the process of booking and managing appointments for both donors and blood banks. It provides a user-friendly interface for scheduling donations and health screenings, with features like multi-channel reminders, real-time queue management, and flexible rescheduling options.

### 4.2. User Stories

*   **As a donor,** I want to be able to schedule a blood donation appointment at a nearby blood bank at a convenient time for me.
*   **As a donor,** I want to receive reminders for my upcoming appointments via push notifications, SMS, and email.
*   **As a donor,** I want to be able to easily reschedule or cancel my appointment if my plans change.
*   **As a blood bank staff member,** I want to be able to manage the appointment calendar, see real-time wait times, and manage the queue of donors.

### 4.3. Database Schema and SQL

```sql
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    hospital_id INT,
    appointment_type ENUM('donation', 'screening', 'consultation') NOT NULL,
    appointment_datetime DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
```

## 5. Inventory & Hospital Integration

### 5.1. Feature Description

This feature provides a centralized system for managing blood inventory across a network of partner hospitals and blood banks. It allows medical staff to view real-time stock levels, receive alerts for low inventory and expiring blood units, and facilitate transfers between facilities.

### 5.2. User Stories

*   **As a hospital staff member,** I want to view the real-time inventory of all blood types at my hospital and other nearby facilities.
*   **As a hospital staff member,** I want to receive automated alerts when the stock of a particular blood type is critically low or when blood units are nearing their expiration date.
*   **As a hospital staff member,** I want to be able to request blood transfers from other hospitals in the network when we have a shortage.
*   **As a donor,** I want to be able to see the current inventory levels at nearby blood banks to understand where my blood type is most needed.

### 5.3. Database Schema and SQL

```sql
CREATE TABLE hospitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM('hospital', 'blood_bank') NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    phone_number VARCHAR(20),
    operating_hours VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blood_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    rh_factor ENUM('+', '-') NOT NULL,
    quantity_in_units INT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
```

## 6. Blood Journey & Gamification

### 6.1. Feature Description

This feature aims to enhance donor engagement and motivation by gamifying the donation experience. It allows donors to track the journey of their donated blood (anonymously) and see the impact of their contribution. The system includes an achievement and badge system, leaderboards, and social sharing capabilities.

### 6.2. User Stories

*   **As a donor,** I want to be able to see the journey of my blood donation, from the blood bank to the hospital where it was used, to understand the real-world impact of my donation.
*   **As a donor,** I want to earn badges and achievements for reaching donation milestones (e.g., first donation, 5th donation, donating on a special day).
*   **As a donor,** I want to see how I rank against other donors on local and national leaderboards to feel a sense of friendly competition and community.
*   **As a donor,** I want to be able to share my achievements and donation milestones on social media to inspire others to donate.

### 6.3. Database Schema and SQL

```sql
CREATE TABLE donation_journey (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT NOT NULL,
    recipient_id INT,
    hospital_id INT,
    status ENUM('donated', 'in_transit', 'at_hospital', 'transfused') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);

CREATE TABLE achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255),
    points_reward INT DEFAULT 0
);

CREATE TABLE user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, achievement_id)
);
```

## 7. Education & Trust Hub

### 7.1. Feature Description

The Education & Trust Hub is a comprehensive resource center designed to inform and build trust with users. It provides evidence-based content, including articles, videos, and interactive FAQs, to debunk myths and educate users about the entire blood donation process. The hub also features a smart chatbot for instant answers and culturally sensitive content.

### 7.2. User Stories

*   **As a new user,** I want to access easy-to-understand articles and videos about the blood donation process, eligibility, and safety to feel more comfortable and prepared.
*   **As a user,** I want to be able to ask questions and get instant answers from a smart chatbot.
*   **As a user,** I want to read myth-busting content to clear up any misconceptions I have about blood donation.
*   **As a user,** I want to learn about the health benefits of donating blood and get wellness tips.

### 7.3. Database Schema and SQL

```sql
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    author_id INT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    read_time_minutes INT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE faqs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 8. Community Features

### 8.1. Feature Description

The Community Features are designed to foster a sense of community and collective action among donors. This includes local donor groups, corporate and family networks, and volunteer opportunities. These features aim to increase engagement and create a supportive ecosystem for blood donation.

### 8.2. User Stories

*   **As a donor,** I want to be able to join or create a local donor group to connect with other donors in my area and participate in group donation drives.
*   **As a company representative,** I want to be able to create a corporate partnership to organize a blood donation drive for our employees.
*   **As a user,** I want to be able to link my family members' accounts to coordinate our donations and support each other.
*   **As a user,** I want to find and sign up for volunteer opportunities at local blood drive events.

### 8.3. Database Schema and SQL

```sql
CREATE TABLE communities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('local_group', 'corporate', 'family_network') NOT NULL,
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE community_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    community_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('member', 'admin') NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (community_id, user_id)
);

CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('blood_drive', 'webinar', 'volunteer_opportunity') NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    location VARCHAR(255),
    organized_by_community_id INT,
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organized_by_community_id) REFERENCES communities(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE event_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_status ENUM('registered', 'attended', 'cancelled') NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (event_id, user_id)
);
```

