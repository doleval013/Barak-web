const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Database Configuration
const pool = new Pool({
    user: process.env.DB_USER || 'barakuser',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'barakdb',
    password: process.env.DB_PASSWORD || 'barakpassword',
    port: process.env.DB_PORT || 5432,
});

// Initialize Database
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visits (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                page TEXT,
                ip_hash TEXT,
                device_type TEXT
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                event_type TEXT,
                event_name TEXT,
                metadata TEXT
            )
        `);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database', err);
    }
};

initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Helper to hash IP
const hashIp = (req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return crypto.createHash('sha256').update(ip + 'SALT').digest('hex');
};

// Routes

// 1. Record Visit
app.post('/api/visit', async (req, res) => {
    const { page } = req.body;
    const ip_hash = hashIp(req);

    try {
        const result = await pool.query(
            'INSERT INTO visits (page, ip_hash) VALUES ($1, $2) RETURNING id',
            [page || 'home', ip_hash]
        );
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Record Event
app.post('/api/event', async (req, res) => {
    const { type, name, metadata } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO events (event_type, event_name, metadata) VALUES ($1, $2, $3) RETURNING id',
            [type, name, metadata]
        );
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Stats
app.get('/api/stats', async (req, res) => {
    try {
        const stats = {};

        // Parallelize queries for performance
        const results = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM visits'),
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'video_click'"),
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'contact_click'"),
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'program_view'"),
            pool.query(`
                SELECT to_char(timestamp, 'YYYY-MM-DD') as date, COUNT(*) as count 
                FROM visits 
                WHERE timestamp >= NOW() - INTERVAL '6 days'
                GROUP BY date
                ORDER BY date ASC
            `)
        ]);

        stats.visits = parseInt(results[0].rows[0].count);
        stats.videoClicks = parseInt(results[1].rows[0].count);
        stats.contactClicks = parseInt(results[2].rows[0].count);
        stats.programViews = parseInt(results[3].rows[0].count);
        stats.trendData = results[4].rows;

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
