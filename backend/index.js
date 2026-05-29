/**
 * Barak Web Backend — Entry Point
 * 
 * Express.js server with:
 * - PostgreSQL database with auto-migration
 * - Google OAuth authentication
 * - JWT session management
 * - Analytics tracking (visits, events)
 * - Job board with applications
 * - User management
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

// Database modules
const { initSchema } = require('./src/db/schema');
const { seedAdmins } = require('./src/db/seed');

// Route modules
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const jobRoutes = require('./src/routes/jobs');
const analyticsRoutes = require('./src/routes/analytics');

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

// Initialize Database — schema migration + admin seed
const initDb = async () => {
    try {
        await initSchema(pool);
        await seedAdmins(pool);
        console.log('[Server] Database initialization complete');
    } catch (err) {
        console.error('[Server] Database initialization failed:', err);
    }
};

initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files (CVs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes(pool));
app.use('/api/users', userRoutes(pool));
app.use('/api/jobs', jobRoutes(pool));
app.use('/api', analyticsRoutes(pool)); // Analytics routes at /api root (visit, event, stats)

// Start server
app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.GOOGLE_CLIENT_ID) {
        console.log('[Server] Google OAuth: configured');
    } else {
        console.log('[Server] Google OAuth: NOT configured (set GOOGLE_CLIENT_ID)');
    }
});
