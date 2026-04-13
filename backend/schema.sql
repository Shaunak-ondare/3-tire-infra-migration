CREATE DATABASE three_tier_app;

\c three_tier_app;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0),
    gender TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
