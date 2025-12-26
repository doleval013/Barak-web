const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || '/data/analytics.db';

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Initialize Database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.run(`CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        page TEXT,
        ip_hash TEXT,
        device_type TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event_type TEXT, -- 'video_click', 'contact_click', 'program_view'
        event_name TEXT,
        metadata TEXT
    )`);
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper to hash IP
const hashIp = (req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return crypto.createHash('sha256').update(ip + 'SALT').digest('hex'); // Simple salt
};

// Routes

// 1. Record Visit
app.post('/api/visit', (req, res) => {
    const { page } = req.body;
    const ip_hash = hashIp(req);

    // Check if this IP has already visited today to prevent spamming 'visits' table?
    // User requested "trend", usually unique visits per day.
    // To allow granular tracking but easy "unique" querying, we can just insert all.
    // The stats query handles uniqueness via GROUP BY/COUNT(DISTINCT) if needed, 
    // but the current stats query used `COUNT(*)` from visits.
    // Let's stick to inserting every hit, and we can refine the stats query later to be distinct if requested.
    // Actually, `App.jsx` prevents duplicate calls per day locally.

    db.run(`INSERT INTO visits (page, ip_hash) VALUES (?, ?)`, [page || 'home', ip_hash], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// 2. Record Event
app.post('/api/event', (req, res) => {
    const { type, name, metadata } = req.body;
    db.run(`INSERT INTO events (event_type, event_name, metadata) VALUES (?, ?, ?)`, [type, name, metadata], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// 3. Get Stats
app.get('/api/stats', (req, res) => {
    const stats = {};

    // Total Visits
    db.get("SELECT COUNT(*) as count FROM visits", (err, row) => {
        if (err) return res.status(500).send(err);
        stats.visits = row.count;

        // Video Clicks
        db.get("SELECT COUNT(*) as count FROM events WHERE event_type = 'video_click'", (err, row) => {
            stats.videoClicks = row ? row.count : 0;

            // Contact Clicks
            db.get("SELECT COUNT(*) as count FROM events WHERE event_type = 'contact_click'", (err, row) => {
                stats.contactClicks = row ? row.count : 0;

                // Program Views
                db.get("SELECT COUNT(*) as count FROM events WHERE event_type = 'program_view'", (err, row) => {
                    stats.programViews = row ? row.count : 0;

                    // Daily Trends (Last 7 Days)
                    const query = `
                        SELECT strftime('%Y-%m-%d', timestamp) as date, COUNT(*) as count 
                        FROM visits 
                        WHERE timestamp >= date('now', '-6 days')
                        GROUP BY date
                        ORDER BY date ASC
                    `;
                    db.all(query, (err, rows) => {
                        stats.trendData = rows || [];
                        res.json(stats);
                    });
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
