CREATE TABLE airports (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    country VARCHAR(255)
);

INSERT INTO airports (iata_code, name, city, country) VALUES
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA'),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA'),
('LHR', 'Heathrow Airport', 'London', 'UK'),
('CDG', 'Charles de Gaulle Airport', 'Paris', 'France'),
('HND', 'Haneda Airport', 'Tokyo', 'Japan'),
('DEL', 'Indira Gandhi International Airport', 'Delhi', 'India'),
('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India');

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    airport_iata_code VARCHAR(3) NOT NULL,
    user_id VARCHAR(255) NOT NULL, -- Will store the user's ID from the JWT
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE reviews ADD CONSTRAINT unique_user_airport_review UNIQUE (user_id, airport_iata_code);