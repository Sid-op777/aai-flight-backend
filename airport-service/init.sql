DROP TABLE IF EXISTS airports CASCADE;

CREATE TABLE airports (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    country VARCHAR(255),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6)
);

INSERT INTO airports (iata_code, name, city, country, latitude, longitude) VALUES
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 40.6413, -73.7781),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 33.9416, -118.4085),
('LHR', 'Heathrow Airport', 'London', 'UK', 51.4700, -0.4543),
('CDG', 'Charles de Gaulle Airport', 'Paris', 'France', 49.0097, 2.5479),
('HND', 'Haneda Airport', 'Tokyo', 'Japan', 35.5494, 139.7798),
('DEL', 'Indira Gandhi International Airport', 'Delhi', 'India', 28.5562, 77.1000),
('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 19.0896, 72.8656);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    airport_iata_code VARCHAR(3) NOT NULL,
    user_id VARCHAR(255) NOT NULL, -- Will store the user's ID from the JWT
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE reviews ADD CONSTRAINT unique_user_airport_review UNIQUE (user_id, airport_iata_code);

CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL,
    airline_name VARCHAR(255) NOT NULL,
    departure_airport_iata VARCHAR(3) NOT NULL,
    arrival_airport_iata VARCHAR(3) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    -- Add foreign key constraints to ensure data integrity
    FOREIGN KEY (departure_airport_iata) REFERENCES airports(iata_code),
    FOREIGN KEY (arrival_airport_iata) REFERENCES airports(iata_code)
);

-- INSERT MOCK FLIGHT DATA
-- Let's create some flights for a specific future date, e.g., tomorrow
-- Adjust the date as needed for your testing
INSERT INTO flights (flight_number, airline_name, departure_airport_iata, arrival_airport_iata, departure_time, arrival_time, price) VALUES
('AI806', 'Air India', 'DEL', 'BOM', NOW() + INTERVAL '1 day' + INTERVAL '8 hours', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', 7500.00),
('6E204', 'IndiGo', 'DEL', 'BOM', NOW() + INTERVAL '1 day' + INTERVAL '9 hours', NOW() + INTERVAL '1 day' + INTERVAL '11 hours', 6800.00),
('UK951', 'Vistara', 'DEL', 'BOM', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '12 hours', 8200.00),
('AI475', 'Air India', 'BOM', 'DEL', NOW() + INTERVAL '1 day' + INTERVAL '14 hours', NOW() + INTERVAL '1 day' + INTERVAL '16 hours', 7800.00),
('6E5318', 'IndiGo', 'LHR', 'DEL', NOW() + INTERVAL '1 day' + INTERVAL '22 hours', NOW() + INTERVAL '2 days' + INTERVAL '8 hours', 35000.00);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    flight_id INT NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);

-- NEW TABLE FOR PASSENGERS
CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    passport_number VARCHAR(50),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    pnr VARCHAR(20) NOT NULL,
    airline_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_flight_segments (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL,
    flight_number VARCHAR(10) NOT NULL,
    departure_airport_iata VARCHAR(3) NOT NULL,
    arrival_airport_iata VARCHAR(3) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    web_checkin_link VARCHAR(512),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);