-- ===============================
-- 🚀 Randevu Sistemi Veritabanı Şeması
-- ===============================

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'BUSINESS', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İşletmeler Tablosu
CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100) DEFAULT 'Oto Yıkama',
    city VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    rating NUMERIC(2,1) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    capacity INTEGER DEFAULT 1,
    image_url TEXT,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hizmetler Tablosu
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    duration_min INTEGER NOT NULL,
    vehicle_type VARCHAR(20) CHECK (vehicle_type IN ('SEDAN', 'SUV', 'HATCHBACK', 'COMMERCIAL', 'OTHER')),
    addons TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Randevular Tablosu
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    vehicle_type VARCHAR(20),
    plate VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    notes TEXT,
    total_price INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Çalışma Saatleri
CREATE TABLE IF NOT EXISTS working_hours (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    is_open BOOLEAN DEFAULT TRUE,
    open_time VARCHAR(10),
    close_time VARCHAR(10),
    break_start VARCHAR(10),
    break_end VARCHAR(10)
);

-- Değerlendirmeler
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bildirimler
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(150),
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adresler
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(50),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ödeme Yöntemleri
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(50),
    last4 VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
