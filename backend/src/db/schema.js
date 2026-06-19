/**
 * Database Schema & Migration Runner
 * 
 * Creates all tables idempotently using CREATE TABLE IF NOT EXISTS.
 * Safe to run on every server startup.
 */

const initSchema = async (pool) => {
    try {
        // ============================================================
        // EXISTING: visits table (analytics)
        // ============================================================
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
        const visitColumns = [
            'last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            "language VARCHAR(10) DEFAULT 'he'",
            'country VARCHAR(50)',
            'city VARCHAR(100)',
            'referrer TEXT',
            'browser VARCHAR(50)',
            'os VARCHAR(50)',
            'utm_source VARCHAR(100)',
            'utm_medium VARCHAR(100)',
            'utm_campaign VARCHAR(200)',
            'is_returning BOOLEAN DEFAULT FALSE',
            'scroll_depth INTEGER DEFAULT 0'
        ];

        for (const col of visitColumns) {
            try {
                await pool.query(`ALTER TABLE visits ADD COLUMN IF NOT EXISTS ${col}`);
            } catch (e) {
                // Ignore duplicate column errors
            }
        }

        // ============================================================
        // EXISTING: events table (analytics)
        // ============================================================
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                event_type TEXT,
                event_name TEXT,
                metadata TEXT
            )
        `);

        // ============================================================
        // NEW: users table
        // Stores all users. Admins flagged via 'role' column.
        // Google OAuth provides: email, full_name, picture_url, locale
        // ============================================================
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id            SERIAL PRIMARY KEY,
                google_id     VARCHAR(255) UNIQUE NOT NULL,
                email         VARCHAR(255) UNIQUE NOT NULL,
                full_name     VARCHAR(255) NOT NULL,
                picture_url   TEXT,
                locale        VARCHAR(10),
                phone         VARCHAR(20),
                age           INTEGER,
                cv_url        TEXT,
                role          VARCHAR(20) DEFAULT 'user',
                status        VARCHAR(20) DEFAULT 'active',
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add status to users
        try {
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`);
        } catch (e) {}

        // ============================================================
        // NEW: sessions table
        // Tracks active JWT sessions for logout/revocation
        // ============================================================
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id            SERIAL PRIMARY KEY,
                user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token_hash    VARCHAR(255) NOT NULL,
                expires_at    TIMESTAMP NOT NULL,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Indexes for sessions
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash)
        `);

        // ============================================================
        // NEW: jobs table
        // Job postings created by admins
        // ============================================================
        await pool.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id            SERIAL PRIMARY KEY,
                title         VARCHAR(255) NOT NULL,
                description   TEXT NOT NULL,
                location      VARCHAR(255),
                job_type      VARCHAR(50) DEFAULT 'full-time',
                status        VARCHAR(20) DEFAULT 'open',
                is_visible    BOOLEAN DEFAULT true,
                created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
                creator_name  VARCHAR(255),
                creator_email VARCHAR(255),
                edit_policy   VARCHAR(20) DEFAULT 'owner_only',
                shared_recruiter_ids INTEGER[] DEFAULT '{}',
                custom_fields JSONB DEFAULT '[]',
                questions     JSONB DEFAULT '[]',
                expiration_date TIMESTAMP DEFAULT NULL,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add new columns to jobs
        const jobColumns = [
            'is_visible BOOLEAN DEFAULT true',
            'creator_name VARCHAR(255)',
            'creator_email VARCHAR(255)',
            "edit_policy VARCHAR(20) DEFAULT 'owner_only'",
            "shared_recruiter_ids INTEGER[] DEFAULT '{}'",
            "custom_fields JSONB DEFAULT '[]'",
            "questions JSONB DEFAULT '[]'",
            "expiration_date TIMESTAMP DEFAULT NULL"
        ];

        for (const col of jobColumns) {
            try {
                await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ${col}`);
            } catch (e) {
                // Ignore duplicate column errors
            }
        }

        // ============================================================
        // NEW: job_templates table
        // Reusable templates for job postings
        // ============================================================
        await pool.query(`
            CREATE TABLE IF NOT EXISTS job_templates (
                id            SERIAL PRIMARY KEY,
                title         VARCHAR(255) NOT NULL,
                description   TEXT,
                custom_fields JSONB DEFAULT '[]',
                questions     JSONB DEFAULT '[]',
                created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ============================================================
        // NEW: applications table
        // Job applications from users.
        // Keeps applicant snapshot so data survives user deletion.
        // ============================================================
        await pool.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id                SERIAL PRIMARY KEY,
                job_id            INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
                user_id           INTEGER REFERENCES users(id) ON DELETE SET NULL,
                applicant_name    VARCHAR(255) NOT NULL,
                applicant_email   VARCHAR(255) NOT NULL,
                applicant_phone   VARCHAR(20),
                cv_url            TEXT,
                cover_letter      TEXT,
                status            VARCHAR(20) DEFAULT 'pending',
                answers           JSONB DEFAULT '{}',
                applied_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add answers to applications if missing
        try {
            await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'`);
        } catch (e) {}

        // Indexes for applications
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id)
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id)
        `);

        // ============================================================
        // NEW: site_settings table
        // Site-wide settings (e.g. email notifications toggle)
        // ============================================================
        await pool.query(`
            CREATE TABLE IF NOT EXISTS site_settings (
                key   VARCHAR(255) PRIMARY KEY,
                value TEXT NOT NULL
            )
        `);

        // Seed default key-value pairs if not exists
        await pool.query(`
            INSERT INTO site_settings (key, value)
            VALUES ('email_notifications_enabled', 'false')
            ON CONFLICT (key) DO NOTHING
        `);

        console.log('[DB] Schema initialized successfully — all tables ready');
    } catch (err) {
        console.error('[DB] Error initializing schema:', err);
        throw err;
    }
};

module.exports = { initSchema };
