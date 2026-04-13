const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'three_tier_app'
});

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER NOT NULL CHECK (age >= 0),
            gender TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const existingUsers = await pool.query('SELECT COUNT(*)::int AS count FROM users');

    if (existingUsers.rows[0].count === 0) {
        await pool.query(
            `
                INSERT INTO users (name, age, gender)
                VALUES
                    ($1, $2, $3),
                    ($4, $5, $6),
                    ($7, $8, $9),
                    ($10, $11, $12)
            `,
            [
                'Alice', 25, 'Female',
                'Bob', 30, 'Male',
                'Charlie', 22, 'Male',
                'Shaun', 28, 'Male'
            ]
        );

        console.log('PostgreSQL database seeded with sample data.');
    }
}

function validateUserPayload(body) {
    const trimmedName = String(body.name || '').trim();
    const parsedAge = parseInt(body.age, 10);
    const trimmedGender = String(body.gender || '').trim();

    if (!trimmedName || Number.isNaN(parsedAge) || parsedAge < 0 || !trimmedGender) {
        return { error: 'Please enter a valid name, age, and gender.' };
    }

    return {
        user: {
            name: trimmedName,
            age: parsedAge,
            gender: trimmedGender
        }
    };
}

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, age, gender, created_at FROM users ORDER BY id DESC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { error, user } = validateUserPayload(req.body);

    if (error) {
        return res.status(400).json({ error });
    }

    try {
        const result = await pool.query(
            `
                INSERT INTO users (name, age, gender)
                VALUES ($1, $2, $3)
                RETURNING id, name, age, gender, created_at
            `,
            [user.name, user.age, user.gender]
        );

        res.status(201).json({
            message: 'User added successfully.',
            user: result.rows[0]
        });
    } catch (dbError) {
        res.status(500).json({ error: dbError.message });
    }
});

app.post('/api/check', async (req, res) => {
    const { error, user } = validateUserPayload(req.body);

    if (error) {
        return res.status(400).json({ error: 'Please provide name, age, and gender context' });
    }

    try {
        const result = await pool.query(
            `
                SELECT id, name, age, gender, created_at
                FROM users
                WHERE LOWER(name) = LOWER($1)
                  AND age = $2
                  AND LOWER(gender) = LOWER($3)
                LIMIT 1
            `,
            [user.name, user.age, user.gender]
        );

        if (result.rows.length > 0) {
            return res.json({
                exists: true,
                user: result.rows[0],
                message: 'User found in the database!'
            });
        }

        return res.json({
            exists: false,
            message: 'User not found in the database.'
        });
    } catch (dbError) {
        return res.status(500).json({ error: dbError.message });
    }
});

initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Backend server running at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to PostgreSQL:', error.message);
        process.exit(1);
    });
