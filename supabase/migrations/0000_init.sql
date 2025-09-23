-- Create custom types for enums
CREATE TYPE user_role AS ENUM ('donor', 'recipient', 'both');
CREATE TYPE availability_status AS ENUM ('available', 'unavailable');
CREATE TYPE rh_factor_type AS ENUM ('+', '-');
CREATE TYPE request_urgency AS ENUM ('moderate', 'urgent', 'critical');
CREATE TYPE request_status AS ENUM ('active', 'fulfilled', 'expired', 'cancelled');
CREATE TYPE response_status AS ENUM ('accepted', 'declined', 'pending');
CREATE TYPE donation_type AS ENUM ('whole_blood', 'platelets', 'plasma');
CREATE TYPE appointment_type AS ENUM ('donation', 'screening', 'consultation');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE hospital_type AS ENUM ('hospital', 'blood_bank');
CREATE TYPE journey_status AS ENUM ('donated', 'in_transit', 'at_hospital', 'transfused');
CREATE TYPE community_type AS ENUM ('local_group', 'corporate', 'family_network');
CREATE TYPE community_member_role AS ENUM ('member', 'admin');
CREATE TYPE event_type AS ENUM ('blood_drive', 'webinar', 'volunteer_opportunity');
CREATE TYPE registration_status AS ENUM ('registered', 'attended', 'cancelled');

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for users
CREATE TABLE users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role user_role NOT NULL DEFAULT 'donor',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    availability_status availability_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table for user_profiles
CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY,
    date_of_birth DATE,
    blood_type VARCHAR(5),
    rh_factor rh_factor_type NOT NULL,
    weight_kg NUMERIC(5, 2),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    last_donation_date DATE,
    medical_conditions TEXT,
    emergency_contact VARCHAR(255),
    profile_picture_url VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for password_resets
CREATE TABLE password_resets (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table for blood_requests
CREATE TABLE blood_requests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    requester_id BIGINT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    rh_factor rh_factor_type NOT NULL,
    units_needed INT NOT NULL,
    urgency request_urgency NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    notes TEXT,
    status request_status NOT NULL DEFAULT 'active',
    required_by TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON blood_requests
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table for request_responses
CREATE TABLE request_responses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    request_id BIGINT NOT NULL,
    donor_id BIGINT NOT NULL,
    response_status response_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (request_id, donor_id)
);
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON request_responses
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table for donations
CREATE TABLE donations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    donor_id BIGINT NOT NULL,
    donation_date DATE NOT NULL,
    units_donated INT NOT NULL,
    location VARCHAR(255),
    donation_type donation_type NOT NULL DEFAULT 'whole_blood',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for health_screenings
CREATE TABLE health_screenings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    donor_id BIGINT NOT NULL,
    screening_date DATE NOT NULL,
    hemoglobin_level NUMERIC(5, 2),
    blood_pressure VARCHAR(10),
    temperature NUMERIC(4, 2),
    is_eligible BOOLEAN NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for hospitals
CREATE TABLE hospitals (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    type hospital_type NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    phone_number VARCHAR(20),
    operating_hours VARCHAR(255),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table for appointments
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    hospital_id BIGINT,
    appointment_type appointment_type NOT NULL,
    appointment_datetime TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table for blood_inventory
CREATE TABLE blood_inventory (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    hospital_id BIGINT NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    rh_factor rh_factor_type NOT NULL,
    quantity_in_units INT NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON blood_inventory
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table for donation_journey
CREATE TABLE donation_journey (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    donation_id BIGINT NOT NULL,
    recipient_id BIGINT,
    hospital_id BIGINT,
    status journey_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
);
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON donation_journey
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table for achievements
CREATE TABLE achievements (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255),
    points_reward INT DEFAULT 0
);

-- Table for user_achievements
CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE (user_id, achievement_id)
);

-- Table for articles
CREATE TABLE articles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    author_id BIGINT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    read_time_minutes INT,
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Table for faqs
CREATE TABLE faqs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table for communities
CREATE TABLE communities (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type community_type NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for community_members
CREATE TABLE community_members (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    community_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role community_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (community_id, user_id)
);

-- Table for events
CREATE TABLE events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    organized_by_community_id BIGINT,
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organized_by_community_id) REFERENCES communities(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for event_participants
CREATE TABLE event_participants (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    registration_status registration_status NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (event_id, user_id)
);

-- Table for notifications
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
