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

        // Migration: Add last_heartbeat if it doesn't exist
        try {
            await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        } catch (e) {
            // Check if error is because column exists (older Postgres versions don't support IF NOT EXISTS in ALTER)
            if (e.code === '42701') { // duplicate_column
                console.log('Column last_heartbeat already exists');
            } else {
                console.log('Migration note:', e.message);
            }
        }
        // Migration: Add language if it doesn't exist
        try {
            await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'he'`);
        } catch (e) {
            // ignore
        }

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

// Auth Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers['x-admin-auth'];
    const validHash = process.env.ADMIN_HASH;

    if (!validHash) {
        console.warn('ADMIN_HASH not set in environment.');
        return next();
    }

    if (authHeader !== validHash) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Helper to hash IP
const hashIp = (req) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return crypto.createHash('sha256').update(ip + 'SALT').digest('hex');
};

// Routes

// 1. Record Visit (Public)
app.post('/api/visit', async (req, res) => {
    const { page, language } = req.body;
    const ip_hash = hashIp(req);

    try {
        const result = await pool.query(
            'INSERT INTO visits (page, ip_hash, last_heartbeat, language) VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING id',
            [page || 'home', ip_hash, language || 'he']
        );
        res.json({ id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Heartbeat (Public) - Update last_heartbeat for session tracking
app.post('/api/visit/heartbeat', async (req, res) => {
    const { visitId } = req.body;
    if (!visitId) return res.status(400).json({ error: 'Missing visitId' });

    try {
        await pool.query(
            'UPDATE visits SET last_heartbeat = CURRENT_TIMESTAMP WHERE id = $1',
            [visitId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Record Event (Public)
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

// 4. Get Stats (Protected)
app.get('/api/stats', authenticate, async (req, res) => {
    try {
        const stats = {};

        const results = await Promise.all([
            // 0. Total Visits (24h)
            pool.query("SELECT COUNT(*) as count FROM visits WHERE timestamp >= NOW() - INTERVAL '24 hours'"),
            // 1. Video Clicks (24h)
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'video_click' AND timestamp >= NOW() - INTERVAL '24 hours'"),
            // 2. Contact Clicks (24h)
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'contact_click' AND timestamp >= NOW() - INTERVAL '24 hours'"),
            // 3. Program Views (24h)
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'program_view' AND timestamp >= NOW() - INTERVAL '24 hours'"),
            // 4. Web View Trend (Modified to return 'visits' alias)
            pool.query(`
                SELECT to_char(timestamp, 'YYYY-MM-DD') as date, language, COUNT(*) as visits 
                FROM visits 
                WHERE timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date, language
                ORDER BY date ASC
            `),
            // 5. First Seen
            pool.query('SELECT MIN(timestamp) as first_seen FROM visits'),
            // 6. Device Breakdown
            pool.query(`
                SELECT device_type, COUNT(*) as count 
                FROM visits 
                GROUP BY device_type 
                ORDER BY count DESC
            `),
            // 7. Top Pages
            pool.query(`
                SELECT page, COUNT(*) as count 
                FROM visits 
                GROUP BY page 
                ORDER BY count DESC 
                LIMIT 5
            `),
            // 8. Top Videos
            pool.query(`
                SELECT event_name as name, COUNT(*) as count 
                FROM events 
                WHERE event_type = 'video_click'
                GROUP BY event_name 
                ORDER BY count DESC 
                LIMIT 5
            `),
            // 9. Popular Programs
            pool.query(`
                SELECT event_name as name, COUNT(*) as count 
                FROM events 
                WHERE event_type = 'program_view'
                GROUP BY event_name 
                ORDER BY count DESC 
                LIMIT 5
            `),
            // 10. Contact Stats
            pool.query(`
                SELECT event_name as name, COUNT(*) as count 
                FROM events 
                WHERE event_type = 'contact_click'
                GROUP BY event_name 
                ORDER BY count DESC 
                LIMIT 5
            `),
            // 11. Visits Today
            pool.query(`
                SELECT COUNT(*) as count 
                FROM visits 
                WHERE CAST(timestamp AS DATE) = CURRENT_DATE
            `),
            // 12. Events Today
            pool.query(`
                SELECT COUNT(*) as count 
                FROM events 
                WHERE CAST(timestamp AS DATE) = CURRENT_DATE
            `),
            // 13. Recent Logs
            pool.query(`
                SELECT 'visit' as type, page as name, timestamp, NULL as metadata FROM visits
                UNION ALL
                SELECT 'event' as type, event_name as name, timestamp, metadata FROM events
                ORDER BY timestamp DESC
                LIMIT 20
            `),
            // 14. Video Trend (Daily)
            pool.query(`
                SELECT to_char(timestamp, 'YYYY-MM-DD') as date, COUNT(*) as count
                FROM events
                WHERE event_type = 'video_click' AND timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC
            `),
            // 15. Contact Trend (Daily)
            pool.query(`
                SELECT to_char(timestamp, 'YYYY-MM-DD') as date, COUNT(*) as count
                FROM events
                WHERE event_type = 'contact_click' AND timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC
            `),
            // 16. Average Session Duration Per Day (Seconds)
            pool.query(`
                SELECT 
                    to_char(timestamp, 'YYYY-MM-DD') as date,
                    AVG(EXTRACT(EPOCH FROM (last_heartbeat - timestamp))) as avg_duration
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC
            `)
        ]);

        stats.visits = parseInt(results[0].rows[0].count);
        stats.videoClicks = parseInt(results[1].rows[0].count);
        stats.contactClicks = parseInt(results[2].rows[0].count);
        stats.programViews = parseInt(results[3].rows[0].count);

        stats.trendData = results[4].rows; // Now has 'visits' key
        stats.firstSeen = results[5].rows[0].first_seen;

        stats.deviceStats = results[6].rows;
        stats.pageStats = results[7].rows;
        stats.videoStats = results[8].rows;
        stats.programStats = results[9].rows;
        stats.contactStats = results[10].rows;

        stats.visitsToday = parseInt(results[11].rows[0].count);
        stats.totalEventsToday = parseInt(results[12].rows[0].count);
        stats.recentLogs = results[13].rows;

        // New Trends
        stats.videoTrend = results[14].rows;
        stats.contactTrend = results[15].rows;
        stats.durationTrend = results[16].rows.map(row => ({
            date: row.date,
            avg_duration: Math.round(row.avg_duration || 0)
        }));

        stats.uptime = process.uptime();
        stats.version = process.env.APP_VERSION || 'Unknown';
        stats.imageName = process.env.IMAGE_NAME || 'Unknown';
        stats.gitCommit = process.env.GIT_COMMIT || 'Unknown';

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
