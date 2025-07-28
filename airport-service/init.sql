-- =================================================================
--  AAI FLIGHT SARTHI - DATABASE SEED SCRIPT
-- =================================================================
--  This script will drop all existing tables and recreate them with
--  a richer set of mock data for development purposes.
-- =================================================================

-- Drop all tables in reverse order of dependency to avoid foreign key issues
DROP TABLE IF EXISTS mock_pnrs;
DROP TABLE IF EXISTS trip_flight_segments;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS passengers;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS airports;

-- =================================================================
--  1. AIRPORTS TABLE
-- =================================================================
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
-- Major Indian Hubs
('DEL', 'Indira Gandhi International Airport', 'Delhi', 'India', 28.5562, 77.1000),
('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 19.0896, 72.8656),
('BLR', 'Kempegowda International Airport', 'Bengaluru', 'India', 13.1986, 77.7066),
('MAA', 'Chennai International Airport', 'Chennai', 'India', 12.9941, 80.1709),
('HYD', 'Rajiv Gandhi International Airport', 'Hyderabad', 'India', 17.2403, 78.4294),
('CCU', 'Netaji Subhas Chandra Bose International Airport', 'Kolkata', 'India', 22.6547, 88.4467),
('PNQ','Pune Airport','Pune','India',18.5822,73.9197),
('GOI','Goa International Airport','Goa','India',15.38,73.83),
('AMD','Ahmedabad Airport','Ahmedabad','India',23.0772,72.6347),
('COK','Cochin International Airport','Kochi','India',10.1520,76.4019),
('TRV','Trivandrum International Airport','Thiruvananthapuram','India',8.4821,76.9201),
('GAU','Guwahati Airport','Guwahati','India',26.1061,91.5859),
('LKO','Lucknow Airport','Lucknow','India',26.7606,80.8893),
('NAG','Nagpur Airport','Nagpur','India',21.0922,79.0472),
('PAT','Patna Airport','Patna','India',25.5913,85.0870),
('BHO','Bhopal Airport','Bhopal','India',23.2875,77.3374),
('IXC','Chandigarh Airport','Chandigarh','India',30.6735,76.7885),
('IXB','Bagdogra Airport','Siliguri','India',26.6812,88.3286),
-- Major International Hubs
('DXB', 'Dubai International Airport', 'Dubai', 'UAE', 25.2532, 55.3657),
('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', 1.3644, 103.9915),
('LHR', 'Heathrow Airport', 'London', 'UK', 51.4700, -0.4543),
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 40.6413, -73.7781),
('SFO', 'San Francisco International Airport', 'San Francisco', 'USA', 37.6213, -122.3790),
('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany', 50.0379, 8.5622),
('HND', 'Tokyo Haneda Airport', 'Tokyo', 'Japan', 35.5494, 139.7798),
('NRT', 'Narita International Airport', 'Tokyo', 'Japan', 35.7653, 140.3853),
('SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia', -33.9399, 151.1753),
('ORD', 'O Hare International Airport', 'Chicago', 'USA', 41.9742, -87.9073),
('YYZ', 'Toronto Pearson International Airport', 'Toronto', 'Canada', 43.6777, -79.6248),
('AMS', 'Amsterdam Schiphol Airport', 'Amsterdam', 'Netherlands', 52.3105, 4.7683),
('DOH', 'Hamad International Airport', 'Doha', 'Qatar', 25.2731, 51.6085),
('JNB', 'O. R. Tambo International Airport', 'Johannesburg', 'South Africa', -26.1337, 28.2420),
('ATL','Hartsfield‑Jackson Atlanta International Airport','Atlanta','USA',33.6407,-84.4277),
('DFW','Dallas/Fort Worth International Airport','Dallas/Fort Worth','USA',32.8998,-97.0403),
('DEN','Denver International Airport','Denver','USA',39.8561,-104.6737),
('LAX','Los Angeles International Airport','Los Angeles','USA',33.9416,-118.4085),
('LAS','Harry Reid International Airport','Las Vegas','USA',36.0840,-115.1537),
('CLT','Charlotte Douglas International Airport','Charlotte','USA',35.2140,-80.9431),
('PVG','Shanghai Pudong International Airport','Shanghai','China',31.1443,121.8083),
('IST','Istanbul Airport','Istanbul','Turkey',41.2753,28.7519),
('CAN','Guangzhou Baiyun International Airport','Guangzhou','China',23.3924,113.2988),
('ICN','Incheon International Airport','Incheon','South Korea',37.4602,126.4407),
('CDG','Charles de Gaulle Airport','Paris','France',49.0097,2.5479),
('MAD','Madrid-Barajas Airport','Madrid','Spain',40.4983,-3.5676),
('MUC','Munich Airport','Munich','Germany',48.3538,11.7861),
('MIA','Miami International Airport','Miami','USA',25.7959,-80.2870),
('BCN','Barcelona El Prat Airport','Barcelona','Spain',41.2974,2.0833),
('FCO','Fiumicino Airport','Rome','Italy',41.8003,12.2389),
('AUH','Abu Dhabi International Airport','Abu Dhabi','UAE',24.4332,54.6510),
('BRU','Brussels Airport','Brussels','Belgium',50.9014,4.4844),
('VIE','Vienna International Airport','Vienna','Austria',48.1103,16.5697),
('CPT','Cape Town International Airport','Cape Town','South Africa',33.9695,18.5972),
('GRU','Guarulhos International Airport','São Paulo','Brazil', -23.4356,-46.4731),
('EZE','Ministro Pistarini International Airport','Buenos Aires','Argentina', -34.8222,-58.5358),
('MEX','Benito Juárez Airport','Mexico City','Mexico',19.4361,-99.0719),
('BKK','Suvarnabhumi Airport','Bangkok','Thailand',13.6900,100.7501),
('KUL','Kuala Lumpur International Airport','Kuala Lumpur','Malaysia',2.7456,101.7072),
('PEK','Beijing Capital International Airport','Beijing','China',40.0801,116.5846),
('CTU','Chengdu Shuangliu Airport','Chengdu','China',30.5785,104.0665),
('SZG','Salzburg Airport','Salzburg','Austria',47.7934,13.0041),
('GIG','Galeão–Antonio Carlos Jobim Airport','Rio de Janeiro','Brazil', -22.8099,-43.2506),
('SLC','Salt Lake City International Airport','Salt Lake City','USA',40.7884,-111.9778),
('SEA','Seattle–Tacoma International Airport','Seattle','USA',47.4502,-122.3088),
('PDX','Portland International Airport','Portland','USA',45.5887,-122.5975),
('PHX','Phoenix Sky Harbor International Airport','Phoenix','USA',33.4342,-112.0116),
('MSP','Minneapolis–Saint Paul International Airport','Minneapolis','USA',44.8848,-93.2223),
('STL','St. Louis Lambert International Airport','St. Louis','USA',38.7487,-90.3700),
('DTW','Detroit Metropolitan Airport','Detroit','USA',42.2162,-83.3554),
('YVR','Vancouver International Airport','Vancouver','Canada',49.1947,-123.1792),
('YUL','Montréal–Trudeau International Airport','Montréal','Canada',45.4706,-73.7408),
('DUB','Dublin Airport','Dublin','Ireland',53.4213,-6.2701),
('CPH','Copenhagen Airport','Copenhagen','Denmark',55.6186,12.6560),
('OSL','Oslo Gardermoen Airport','Oslo','Norway',60.1939,11.1004),
('ARN','Stockholm Arlanda Airport','Stockholm','Sweden',59.6519,17.9186),
('HEL','Helsinki Airport','Helsinki','Finland',60.3172,24.9633),
('GVA','Geneva Airport','Geneva','Switzerland',46.2381,6.1089),
('MNL','Ninoy Aquino International Airport','Manila','Philippines',14.5086,121.0193),
('SAW','Sabiha Gökçen Airport','Istanbul','Turkey',40.8986,29.3090),
('TLV','Ben Gurion Airport','Tel Aviv','Israel',32.0121,34.8716),
('CAI','Cairo International Airport','Cairo','Egypt',30.1219,31.4056),
('LIS','Lisbon Airport','Lisbon','Portugal',38.7742,-9.1342),
('LGW','Gatwick Airport','London','UK',51.1481,-0.1903),
('STN','Stansted Airport','London','UK',51.8840,0.2350),
('LCY','City Airport','London','UK',51.5053,0.0553),
('GLA','Glasgow Airport','Glasgow','UK',55.8719,-4.4335),
('EDI','Edinburgh Airport','Edinburgh','UK',55.9500,-3.3725);


-- =================================================================
--  2. FLIGHTS TABLE
-- =================================================================
CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL,
    airline_name VARCHAR(255) NOT NULL,
    departure_airport_iata VARCHAR(3) NOT NULL REFERENCES airports(iata_code),
    arrival_airport_iata VARCHAR(3) NOT NULL REFERENCES airports(iata_code),
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

-- Generate dynamic mock flights for the next few days
INSERT INTO flights (flight_number, airline_name, departure_airport_iata, arrival_airport_iata, departure_time, arrival_time, price) VALUES
-- Domestic Routes (Tomorrow)
('6E204', 'IndiGo', 'DEL', 'BOM', NOW() + INTERVAL '1 day' + INTERVAL '7 hours', NOW() + INTERVAL '1 day' + INTERVAL '9 hours 5 minutes', 5200.00),
('UK951', 'Vistara', 'DEL', 'BOM', NOW() + INTERVAL '1 day' + INTERVAL '8 hours 30 minutes', NOW() + INTERVAL '1 day' + INTERVAL '10 hours 35 minutes', 6100.00),
('AI806', 'Air India', 'DEL', 'BOM', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '12 hours', 5850.00),
('6E531', 'IndiGo', 'BOM', 'MAA', NOW() + INTERVAL '1 day' + INTERVAL '11 hours', NOW() + INTERVAL '1 day' + INTERVAL '12 hours 45 minutes', 4300.00),
('AI550', 'Air India', 'BLR', 'DEL', NOW() + INTERVAL '1 day' + INTERVAL '14 hours', NOW() + INTERVAL '1 day' + INTERVAL '16 hours 30 minutes', 7100.00),
('UK820', 'Vistara', 'HYD', 'DEL', NOW() + INTERVAL '1 day' + INTERVAL '18 hours', NOW() + INTERVAL '1 day' + INTERVAL '20 hours 15 minutes', 6500.00),
-- International Routes (Day after tomorrow)
('EK511', 'Emirates', 'DEL', 'DXB', NOW() + INTERVAL '2 days' + INTERVAL '4 hours', NOW() + INTERVAL '2 days' + INTERVAL '7 hours 30 minutes', 12500.00),
('SQ401', 'Singapore Airlines', 'DEL', 'SIN', NOW() + INTERVAL '2 days' + INTERVAL '21 hours', NOW() + INTERVAL '3 days' + INTERVAL '5 hours 30 minutes', 18200.00),
('BA142', 'British Airways', 'DEL', 'LHR', NOW() + INTERVAL '2 days' + INTERVAL '13 hours', NOW() + INTERVAL '2 days' + INTERVAL '22 hours 30 minutes', 42000.00),
('AI101', 'Air India', 'DEL', 'JFK', NOW() + INTERVAL '2 days' + INTERVAL '2 hours', NOW() + INTERVAL '2 days' + INTERVAL '17 hours 30 minutes', 55000.00);

-- =================================================================
--  3. BOOKINGS & PASSENGERS TABLES
-- =================================================================
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    flight_id INT NOT NULL REFERENCES flights(id),
    booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    passport_number VARCHAR(50)
);

-- =================================================================
--  4. REVIEWS TABLE
-- =================================================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    airport_iata_code VARCHAR(3) NOT NULL REFERENCES airports(iata_code),
    user_id VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_airport_review UNIQUE (user_id, airport_iata_code)
);

-- =================================================================
--  5. TRIPS & SEGMENTS TABLES (For PNR Import)
-- =================================================================
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    pnr VARCHAR(20) NOT NULL,
    airline_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_flight_segments (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    flight_number VARCHAR(10) NOT NULL,
    departure_airport_iata VARCHAR(3) NOT NULL,
    arrival_airport_iata VARCHAR(3) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    web_checkin_link VARCHAR(512)
);

-- =================================================================
--  6. MOCK PNR LOOKUP TABLE (NEW!)
-- =================================================================
CREATE TABLE mock_pnrs (
    id SERIAL PRIMARY KEY,
    pnr VARCHAR(20) NOT NULL UNIQUE,
    airline_name VARCHAR(255) NOT NULL,
    flight_data JSONB NOT NULL -- Store flight segments as a JSON object
);

INSERT INTO mock_pnrs (pnr, airline_name, flight_data) VALUES
(
    'W6IXG8', 
    'IndiGo',
    '{
        "segments": [
            {
                "flightNumber": "6E 789",
                "departureAirportIata": "BLR",
                "arrivalAirportIata": "CCU",
                "departureTime": "2025-08-15T14:30:00Z",
                "arrivalTime": "2025-08-15T17:00:00Z",
                "webCheckinLink": "https://www.goindigo.in/web-check-in.html"
            }
        ]
    }'
),
(
    'AB2CDE',
    'Vistara',
    '{
        "segments": [
            {
                "flightNumber": "UK 812",
                "departureAirportIata": "MAA",
                "arrivalAirportIata": "DEL",
                "departureTime": "2025-09-01T10:00:00Z",
                "arrivalTime": "2025-09-01T12:45:00Z",
                "webCheckinLink": "https://www.airvistara.com/in/en/travel-information/check-in"
            }
        ]
    }'
),
(
    'EKTEST',
    'Emirates',
    '{
        "segments": [
            {
                "flightNumber": "EK 517",
                "departureAirportIata": "BOM",
                "arrivalAirportIata": "DXB",
                "departureTime": "2025-08-20T22:00:00Z",
                "arrivalTime": "2025-08-20T23:55:00Z",
                "webCheckinLink": "https://www.emirates.com/in/english/manage-booking/online-check-in/"
            },
            {
                "flightNumber": "EK 201",
                "departureAirportIata": "DXB",
                "arrivalAirportIata": "JFK",
                "departureTime": "2025-08-21T02:30:00Z",
                "arrivalTime": "2025-08-21T08:15:00Z",
                "webCheckinLink": "https://www.emirates.com/in/english/manage-booking/online-check-in/"
            }
        ]
    }'
);