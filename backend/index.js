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
            'os VARCHAR(50)',
            // New columns for enhanced analytics
            'utm_source VARCHAR(100)',
            'utm_medium VARCHAR(100)',
            'utm_campaign VARCHAR(200)',
            'is_returning BOOLEAN DEFAULT FALSE',
            'scroll_depth INTEGER DEFAULT 0'
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

// Admin IP check
const isAdminIp = (req) => {
    const adminIps = process.env.ADMIN_IPS;
    if (!adminIps) return false;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    return adminIps.split(',').map(s => s.trim()).includes(ip);
};

// Routes

// 1. Record Visit (Public)
app.post('/api/visit', async (req, res) => {
    const { page, language, referrer, utm_source, utm_medium, utm_campaign, is_returning } = req.body;

    // FILTER: Ignore 'admin' page visits to keep stats clean
    if (page === 'admin' || page === '/admin') {
        return res.json({ ignored: true });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    // FILTER: Ignore admin IPs
    if (isAdminIp(req)) {
        return res.json({ ignored: true });
    }

    const ip_hash = hashIp(req);

    // GeoIP Lookup
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : null;
    const city = geo ? geo.city : null;

    // UA Parser
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();
    const browser = ua.browser.name;
    const os = ua.os.name;
    const deviceType = ua.device.type || 'desktop';

    console.log(`[Visit] IP: ${ip} | Page: ${page} | Country: ${country} | Browser: ${browser} | Device: ${deviceType} | Returning: ${is_returning}`);

    try {
        const result = await pool.query(
            `INSERT INTO visits 
            (page, ip_hash, last_heartbeat, language, country, city, referrer, browser, os, device_type, utm_source, utm_medium, utm_campaign, is_returning) 
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING id`,
            [page || 'home', ip_hash, language || 'he', country, city, referrer, browser, os, deviceType,
             utm_source || null, utm_medium || null, utm_campaign || null, is_returning || false]
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

// 2b. Scroll Depth (Public)
app.post('/api/visit/scroll', async (req, res) => {
    const { visitId, depth } = req.body;
    if (!visitId || depth == null) return res.status(400).json({ error: 'Missing params' });

    try {
        await pool.query(
            'UPDATE visits SET scroll_depth = GREATEST(COALESCE(scroll_depth, 0), $1) WHERE id = $2',
            [Math.min(100, Math.max(0, parseInt(depth))), visitId]
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

        // Base filter to exclude admin pages
        let pageFilter = "page != 'admin' AND page != '/admin'";

        // Optional page filter from query param
        const filterPage = req.query.page;
        if (filterPage && filterPage !== 'all') {
            pageFilter += ` AND page = '${filterPage.replace(/'/g, "''")}'`;
        }

        // Track available pages for the filter dropdown
        const pagesResult = await pool.query(`SELECT DISTINCT page FROM visits WHERE page != 'admin' AND page != '/admin' ORDER BY page`);
        stats.availablePages = pagesResult.rows.map(r => r.page);

        const results = await Promise.all([
            // 0. Total Visits (24h)
            pool.query(`SELECT COUNT(*) as count FROM visits WHERE timestamp >= NOW() - INTERVAL '24 hours' AND ${pageFilter}`),
            // 1. Video Clicks (24h)
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'video_click' AND timestamp >= NOW() - INTERVAL '24 hours'"),
            // 2. Contact Clicks (24h)
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'contact_click' AND timestamp >= NOW() - INTERVAL '24 hours'"),
            // 3. Program Views (24h)
            pool.query("SELECT COUNT(*) as count FROM events WHERE event_type = 'program_view' AND timestamp >= NOW() - INTERVAL '24 hours'"),

            // 4. Enhanced Trend (Visits & Unique Users) - 30 Days
            pool.query(`
                SELECT 
                    to_char(timestamp, 'YYYY-MM-DD') as date, 
                    COUNT(*) as total_visits,
                    COUNT(DISTINCT ip_hash) as unique_visitors
                FROM visits 
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY date
                ORDER BY date ASC
            `),

            // 5. Live Users (Active in last 5 mins)
            pool.query(`SELECT COUNT(DISTINCT ip_hash) as count FROM visits WHERE last_heartbeat >= NOW() - INTERVAL '5 minutes' AND ${pageFilter}`),

            // 6. Device/Browser Breakdown
            pool.query(`
                SELECT 
                    COALESCE(device_type, 'desktop') as type, 
                    COALESCE(browser, 'Unknown') as browser,
                    COUNT(*) as count 
                FROM visits 
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY type, browser
                ORDER BY count DESC
                LIMIT 10
            `),

            // 7. Top Pages
            pool.query(`
                SELECT page, COUNT(*) as count 
                FROM visits 
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY page 
                ORDER BY count DESC 
                LIMIT 10
            `),

            // 8. Top Videos
            pool.query(`
                SELECT event_name as name, COUNT(*) as count 
                FROM events 
                WHERE event_type = 'video_click'
                GROUP BY event_name 
                ORDER BY count DESC 
                LIMIT 10
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
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND country IS NOT NULL AND ${pageFilter}
                GROUP BY country
                ORDER BY count DESC
                LIMIT 10
            `),

            // 12. Recent Logs
            pool.query(`
                SELECT 'visit' as type, page as name, timestamp, country, city, referrer, device_type FROM visits
                WHERE ${pageFilter}
                UNION ALL
                SELECT 'event' as type, event_name as name, timestamp, NULL as country, NULL as city, NULL as referrer, NULL as device_type FROM events
                ORDER BY timestamp DESC
                LIMIT 50
            `),

            // 13. Video Trend (aggregate)
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
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY date
                ORDER BY date ASC
            `),

            // 16. Traffic Sources
            pool.query(`
                SELECT referrer, COUNT(*) as count
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY referrer
                ORDER BY count DESC
                LIMIT 10
            `),

            // 17. Source Trends (Daily breakdown by referrer)
            pool.query(`
                SELECT 
                    to_char(timestamp, 'YYYY-MM-DD') as date,
                    referrer,
                    COUNT(*) as count
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY date, referrer
                ORDER BY date ASC
            `),

            // ===== NEW QUERIES =====

            // 18. Video View Trends per video (daily x event_name)
            pool.query(`
                SELECT to_char(timestamp, 'YYYY-MM-DD') as date, event_name, COUNT(*) as count
                FROM events
                WHERE event_type = 'video_click' AND timestamp >= NOW() - INTERVAL '30 days'
                GROUP BY date, event_name
                ORDER BY date ASC
            `),

            // 19. City Stats
            pool.query(`
                SELECT city, country, COUNT(*) as count, COUNT(DISTINCT ip_hash) as unique_users
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND city IS NOT NULL AND city != '' AND ${pageFilter}
                GROUP BY city, country
                ORDER BY count DESC
                LIMIT 15
            `),

            // 20. Per-page traffic trends (daily x page)
            pool.query(`
                SELECT to_char(timestamp, 'YYYY-MM-DD') as date, page, COUNT(*) as count
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY date, page
                ORDER BY date ASC
            `),

            // 21. Peak Hours (hour of day distribution)
            pool.query(`
                SELECT EXTRACT(HOUR FROM timestamp)::int as hour, COUNT(*) as count
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY hour
                ORDER BY hour ASC
            `),

            // 22. Peak Days (day of week distribution)
            pool.query(`
                SELECT EXTRACT(DOW FROM timestamp)::int as dow, COUNT(*) as count
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY dow
                ORDER BY dow ASC
            `),

            // 23. Return vs New visitors (daily)
            pool.query(`
                SELECT 
                    to_char(timestamp, 'YYYY-MM-DD') as date,
                    SUM(CASE WHEN is_returning = true THEN 1 ELSE 0 END)::int as returning,
                    SUM(CASE WHEN is_returning = false OR is_returning IS NULL THEN 1 ELSE 0 END)::int as new_visitors
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY date
                ORDER BY date ASC
            `),

            // 24. Language Distribution
            pool.query(`
                SELECT COALESCE(language, 'he') as language, COUNT(*) as count
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY language
                ORDER BY count DESC
            `),

            // 25. Bounce Rate per page (session < 10s AND scroll < 25%)
            pool.query(`
                SELECT 
                    page,
                    COUNT(*) as total,
                    SUM(CASE WHEN EXTRACT(EPOCH FROM (last_heartbeat - timestamp)) < 10 AND COALESCE(scroll_depth, 0) < 25 THEN 1 ELSE 0 END)::int as bounced
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY page
            `),

            // 26. Scroll Depth Stats (average per page)
            pool.query(`
                SELECT page, ROUND(AVG(COALESCE(scroll_depth, 0)))::int as avg_depth, COUNT(*) as total
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY page
                ORDER BY avg_depth DESC
            `),

            // 27. UTM Campaign Stats
            pool.query(`
                SELECT 
                    COALESCE(utm_source, 'none') as source,
                    COALESCE(utm_medium, 'none') as medium,
                    COALESCE(utm_campaign, 'none') as campaign,
                    COUNT(*) as count,
                    COUNT(DISTINCT ip_hash) as unique_users
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '90 days' AND ${pageFilter}
                    AND (utm_source IS NOT NULL OR utm_medium IS NOT NULL OR utm_campaign IS NOT NULL)
                GROUP BY source, medium, campaign
                ORDER BY count DESC
                LIMIT 20
            `),

            // 28. Conversion Funnel (30d aggregates)
            pool.query(`
                SELECT 
                    (SELECT COUNT(DISTINCT ip_hash) FROM visits WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}) as total_visitors,
                    (SELECT COUNT(*) FROM events WHERE event_type = 'video_click' AND timestamp >= NOW() - INTERVAL '30 days') as video_plays,
                    (SELECT COUNT(*) FROM events WHERE event_type = 'contact_click' AND timestamp >= NOW() - INTERVAL '30 days') as contact_clicks,
                    (SELECT COUNT(*) FROM events WHERE event_type = 'form_submit' AND timestamp >= NOW() - INTERVAL '30 days') as form_submits,
                    (SELECT COUNT(*) FROM events WHERE event_type = 'whatsapp_click' AND timestamp >= NOW() - INTERVAL '30 days') as whatsapp_clicks
            `),

            // 29. WhatsApp clicks (24h and 30d)
            pool.query(`
                SELECT 
                    SUM(CASE WHEN timestamp >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END)::int as clicks_24h,
                    COUNT(*)::int as clicks_30d
                FROM events
                WHERE event_type = 'whatsapp_click' AND timestamp >= NOW() - INTERVAL '30 days'
            `),

            // 30. Time per page (avg session duration by page)
            pool.query(`
                SELECT 
                    page,
                    ROUND(AVG(EXTRACT(EPOCH FROM (last_heartbeat - timestamp))))::int as avg_seconds,
                    COUNT(*) as sessions
                FROM visits
                WHERE timestamp >= NOW() - INTERVAL '30 days' AND ${pageFilter}
                GROUP BY page
                ORDER BY avg_seconds DESC
            `)
        ]);

        // Map existing queries
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
        stats.durationTrend = results[15].rows.map(row => ({
            date: row.date,
            avg_duration: Math.round(row.avg_duration || 0)
        }));
        stats.sourceStats = results[16].rows;
        stats.sourceTrends = results[17].rows;

        // Map new queries
        stats.videoViewTrends = results[18].rows;
        stats.cityStats = results[19].rows;
        stats.pageTrends = results[20].rows;
        stats.peakHours = results[21].rows;
        stats.peakDays = results[22].rows;
        stats.returnVsNew = results[23].rows;
        stats.languageStats = results[24].rows;
        stats.bounceStats = results[25].rows;
        stats.scrollDepthStats = results[26].rows;
        stats.utmStats = results[27].rows;
        stats.funnelData = results[28].rows[0];
        stats.whatsappClicks = results[29].rows[0] || { clicks_24h: 0, clicks_30d: 0 };
        stats.timePerPage = results[30].rows;

        // System info
        stats.uptime = process.uptime();
        stats.version = process.env.APP_VERSION || '2.0.0';
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
