/**
 * Authentication Middleware
 * 
 * JWT-based authentication with three levels:
 * - authenticateToken: Required auth — rejects if no valid token
 * - requireAdmin: Required admin role — rejects if not admin
 * - optionalAuth: Optional auth — sets req.user to null if no token
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Hash a JWT token for storage in the sessions table.
 * We don't store raw tokens — only their SHA256 hash.
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Required authentication.
 * Validates JWT from Authorization: Bearer <token> header.
 * Attaches req.user with { id, email, role, googleId }.
 * Returns 401 if token is missing or invalid.
 */
const authenticateToken = (pool) => async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verify session still exists in DB (not logged out / revoked)
        const tokenHash = hashToken(token);
        const session = await pool.query(
            'SELECT id FROM sessions WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP',
            [tokenHash]
        );

        if (session.rows.length === 0) {
            return res.status(401).json({ error: 'Session expired or revoked' });
        }

        // Fetch fresh user data from DB
        const user = await pool.query(
            'SELECT id, email, full_name, role, google_id, picture_url FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user.rows[0];
        req.tokenHash = tokenHash;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * Require admin role.
 * Must be used AFTER authenticateToken.
 * Returns 403 if user is not an admin.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

/**
 * Require recruiter or admin role.
 * Must be used AFTER authenticateToken.
 * Returns 403 if user is neither a recruiter nor an admin.
 */
const requireRecruiterOrAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'recruiter')) {
        return res.status(403).json({ error: 'Recruiter or Admin access required' });
    }
    next();
};

/**
 * Optional authentication.
 * Same as authenticateToken but doesn't reject — just sets req.user to null
 * if no token or invalid token is provided.
 */
const optionalAuth = (pool) => async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const tokenHash = hashToken(token);
        
        const session = await pool.query(
            'SELECT id FROM sessions WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP',
            [tokenHash]
        );

        if (session.rows.length === 0) {
            req.user = null;
            return next();
        }

        const user = await pool.query(
            'SELECT id, email, full_name, role, google_id, picture_url FROM users WHERE id = $1',
            [decoded.userId]
        );

        req.user = user.rows.length > 0 ? user.rows[0] : null;
        req.tokenHash = tokenHash;
    } catch {
        req.user = null;
    }
    next();
};

/**
 * Legacy admin auth — supports the old ADMIN_HASH header for backward compatibility.
 * Checks both JWT (new) and x-admin-auth header (old).
 * This allows a smooth transition period.
 */
const authenticateAdminLegacy = (pool) => async (req, res, next) => {
    // First, try JWT auth
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const tokenHash = hashToken(token);

            const session = await pool.query(
                'SELECT id FROM sessions WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP',
                [tokenHash]
            );

            if (session.rows.length > 0) {
                const user = await pool.query(
                    'SELECT id, email, full_name, role, google_id, picture_url FROM users WHERE id = $1',
                    [decoded.userId]
                );

                if (user.rows.length > 0 && user.rows[0].role === 'admin') {
                    req.user = user.rows[0];
                    return next();
                }
            }
        } catch {
            // Fall through to legacy check
        }
    }

    // Fallback: legacy ADMIN_HASH auth
    const adminHash = req.headers['x-admin-auth'];
    const validHash = process.env.ADMIN_HASH;

    if (validHash && adminHash === validHash) {
        req.user = { role: 'admin', legacy: true };
        return next();
    }

    // If no ADMIN_HASH is set (dev mode), allow access
    if (!validHash && !token) {
        req.user = { role: 'admin', legacy: true };
        return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
};

/**
 * Create a JWT token and store the session in the database.
 */
const createSession = async (pool, userId) => {
    const expiresIn = '7d';
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn });
    const tokenHash = hashToken(token);

    await pool.query(
        'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, tokenHash, expiresAt]
    );

    // Clean up expired sessions for this user
    await pool.query(
        'DELETE FROM sessions WHERE user_id = $1 AND expires_at < CURRENT_TIMESTAMP',
        [userId]
    );

    return { token, expiresAt };
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireRecruiterOrAdmin,
    optionalAuth,
    authenticateAdminLegacy,
    createSession,
    hashToken,
    JWT_SECRET
};
