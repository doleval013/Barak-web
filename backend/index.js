const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

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
                device_type TEXT,
                country VARCHAR(50),
                city VARCHAR(100),
                referrer TEXT,
                browser VARCHAR(50),
                os VARCHAR(50)
            )
        `);

        // Migration: Add columns if they don't exist (Idempotent)
        const columns = [
            'last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            "language VARCHAR(10) DEFAULT 'he'",
            'country VARCHAR(50)',
            'city VARCHAR(100)',
            'referrer TEXT',
            'browser VARCHAR(50)',
            'os VARCHAR(50)'
        ];

        for (const col of columns) {
            try {
                await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS ${col}`);
            } catch (e) {
                // Ignore duplicate column errors or syntax errors in older PG
            }
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
        // console.warn('ADMIN_HASH not set in environment.');
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
    const { page, language, referrer } = req.body;

    // FILTER: Ignore 'admin' page visits to keep stats clean
    if (page === 'admin' || page === '/admin') {
        return res.json({ ignored: true });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const ip_hash = hashIp(req);

    // GeoIP Lookup
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : null;
    const city = geo ? geo.city : null;

    // UA Parser - Fixed for v2 compatibility
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();
    const browser = ua.browser.name;
    const os = ua.os.name;
    const deviceType = ua.device.type || 'desktop';

    // Debug Log
    console.log(`[Visit] IP: ${ip} | Country: ${country} | Browser: ${browser} | Device: ${deviceType}`);

    try {
        const result = await pool.query(
            `INSERT INTO visits 
            (page, ip_hash, last_heartbeat, language, country, city, referrer, browser, os, device_type) 
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING id`,
            [page || 'home', ip_hash, language || 'he', country, city, referrer, browser, os, deviceType]
        );
        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Visit error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Heartbeat (Public)
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

            // 4. Enhanced Trend (Visits & Unique Users) - 30 Days
            // 4. Enhanced Trend (Visits & Unique Users) - 30 Days (Grouped by Date only)
            pool.query(`
                SELECT 
                    to_char(timestamp, 'YYYY-MM-DD') as date, 
                    COUNT(*) as total_visits,
                    COUNT(DISTINCT ip_hash) as unique_visitors
                FROM visits 
                WHERE timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC
            `),

            // 5. Live Users (Active in last 5 mins)
            pool.query("SELECT COUNT(DISTINCT ip_hash) as count FROM visits WHERE last_heartbeat >= NOW() - INTERVAL '5 minutes'"),

            // 6. Device/Browser Breakdown
            pool.query(`
                SELECT 
                    COALESCE(device_type, 'desktop') as type, 
                    COALESCE(browser, 'Unknown') as browser,
                    COUNT(*) as count 
                FROM visits 
                WHERE timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY type, browser
                ORDER BY count DESC
                LIMIT 10
            `),

            // 7. Top Pages
            pool.query(`
                SELECT page, COUNT(*) as count 
                FROM visits 
                WHERE timestamp >= NOW() - INTERVAL '30 days'
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

            // 11. Geo Location Stats (Country)
            pool.query(`
                SELECT country, COUNT(*) as count, COUNT(DISTINCT ip_hash) as unique_users
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND country IS NOT NULL
                GROUP BY country
                ORDER BY count DESC
                LIMIT 10
            `),

            // 12. Recent Logs
            pool.query(`
                SELECT 'visit' as type, page as name, timestamp, country, city, referrer, device_type FROM visits
                UNION ALL
                SELECT 'event' as type, event_name as name, timestamp, NULL as country, NULL as city, NULL as referrer, NULL as device_type FROM events
                ORDER BY timestamp DESC
                LIMIT 50
            `),

            // 13. Video Trend
            pool.query(`
                SELECT to_char(timestamp, 'YYYY-MM-DD') as date, COUNT(*) as count
                FROM events
                WHERE event_type = 'video_click' AND timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC
            `),

            // 14. Contact Trend
            pool.query(`
                SELECT to_char(timestamp, 'YYYY-MM-DD') as date, COUNT(*) as count
                FROM events
                WHERE event_type = 'contact_click' AND timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC
            `),

            // 15. Average Session Duration
            pool.query(`
                SELECT 
                    to_char(timestamp, 'YYYY-MM-DD') as date,
                    AVG(EXTRACT(EPOCH FROM (last_heartbeat - timestamp))) as avg_duration
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date
                ORDER BY date ASC
            `),

            // 16. Traffic Sources
            pool.query(`
                SELECT referrer, COUNT(*) as count
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY referrer
                ORDER BY count DESC
                LIMIT 10
            `),

            // 17. Source Trends (Daily breakdown by referrer) - NEW
            pool.query(`
                SELECT 
                    to_char(timestamp, 'YYYY-MM-DD') as date,
                    referrer,
                    COUNT(*) as count
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date, referrer
                ORDER BY date ASC
            `)
        ]);

        stats.visits = parseInt(results[0].rows[0].count);
        stats.videoClicks = parseInt(results[1].rows[0].count);
        stats.contactClicks = parseInt(results[2].rows[0].count);
        stats.programViews = parseInt(results[3].rows[0].count);

        stats.trendData = results[4].rows;
        stats.liveUsers = parseInt(results[5].rows[0].count);
        stats.deviceStats = results[6].rows;
        stats.pageStats = results[7].rows;
        stats.videoStats = results[8].rows;
        stats.programStats = results[9].rows;
        stats.contactStats = results[10].rows;
        stats.geoStats = results[11].rows;
        stats.recentLogs = results[12].rows;
        stats.videoTrend = results[13].rows;
        stats.contactTrend = results[14].rows;

        // Format duration
        stats.durationTrend = results[15].rows.map(row => ({
            date: row.date,
            avg_duration: Math.round(row.avg_duration || 0)
        }));

        stats.sourceStats = results[16].rows;
        stats.sourceTrends = results[17].rows; // Map the new source trend query

        // System info
        stats.uptime = process.uptime();
        stats.version = process.env.APP_VERSION || '1.1.0';
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
