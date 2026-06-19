/**
 * Auth Routes — Google OAuth Flow
 * 
 * POST /api/auth/google   — Verify Google ID token → create/update user → return JWT
 * GET  /api/auth/me        — Return current user info from JWT
 * POST /api/auth/logout     — Invalidate current session
 * DELETE /api/auth/account  — Delete user account (self-service)
 */

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { authenticateToken, createSession, hashToken } = require('../middleware/auth');

const router = express.Router();

module.exports = (pool) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    /**
     * POST /api/auth/google
     * 
     * Receives a Google ID token from the frontend (after Google Sign-In popup).
     * Verifies it with Google, creates or updates the user in our DB,
     * and returns a JWT for subsequent API calls.
     * 
     * Body: { credential: "google-id-token-string" }
     */
    router.post('/google', async (req, res) => {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Missing Google credential' });
        }

        try {
            // Verify the Google ID token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const googleId = payload['sub'];
            const email = payload['email'];
            const fullName = payload['name'];
            const pictureUrl = payload['picture'];
            const locale = payload['locale'];

            if (!email || !fullName) {
                return res.status(400).json({ error: 'Google account missing required info (email/name)' });
            }

            // Check if user already exists
            let userResult = await pool.query(
                'SELECT * FROM users WHERE google_id = $1',
                [googleId]
            );

            let user;

            if (userResult.rows.length > 0) {
                // Existing user — update their Google info and check if they should be promoted to admin
                const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
                const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : userResult.rows[0].role;

                user = await pool.query(
                    `UPDATE users 
                     SET full_name = $1, picture_url = $2, locale = $3, email = $4, role = $5, updated_at = CURRENT_TIMESTAMP
                     WHERE google_id = $6
                     RETURNING *`,
                    [fullName, pictureUrl, locale, email, role, googleId]
                );
                user = user.rows[0];
            } else {
                // New user — check if their email is in the admin list
                const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
                const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';

                user = await pool.query(
                    `INSERT INTO users (google_id, email, full_name, picture_url, locale, role)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING *`,
                    [googleId, email, fullName, pictureUrl, locale, role]
                );
                user = user.rows[0];
                console.log(`[Auth] New user created: ${email} (role: ${role})`);
            }

            if (user.status === 'blocked') {
                return res.status(403).json({ error: 'Account has been blocked' });
            }

            // Create JWT session
            const { token, expiresAt } = await createSession(pool, user.id);

            // Return user info + JWT
            res.json({
                token,
                expiresAt,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    pictureUrl: user.picture_url,
                    locale: user.locale,
                    phone: user.phone,
                    age: user.age,
                    cvUrl: user.cv_url,
                    role: user.role,
                    status: user.status,
                    createdAt: user.created_at,
                }
            });

        } catch (err) {
            console.error('[Auth] Google verification error:', err.message);
            res.status(401).json({ error: 'Invalid Google credential' });
        }
    });

    /**
     * GET /api/auth/me
     * 
     * Returns the current authenticated user's info.
     * Requires valid JWT in Authorization header.
     */
    router.get('/me', authenticateToken(pool), async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE id = $1',
                [req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = result.rows[0];
            res.json({
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                pictureUrl: user.picture_url,
                locale: user.locale,
                phone: user.phone,
                age: user.age,
                cvUrl: user.cv_url,
                role: user.role,
                status: user.status,
                createdAt: user.created_at,
            });
        } catch (err) {
            console.error('[Auth] Error fetching user:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * POST /api/auth/logout
     * 
     * Invalidates the current session by removing it from the sessions table.
     * The JWT token becomes unusable after this.
     */
    router.post('/logout', authenticateToken(pool), async (req, res) => {
        try {
            await pool.query(
                'DELETE FROM sessions WHERE token_hash = $1',
                [req.tokenHash]
            );

            res.json({ success: true, message: 'Logged out successfully' });
        } catch (err) {
            console.error('[Auth] Logout error:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * DELETE /api/auth/account
     * 
     * Self-service account deletion.
     * - Deletes the user from the users table
     * - ON DELETE CASCADE removes their sessions
     * - ON DELETE SET NULL keeps their applications but sets user_id to NULL
     *   (the snapshot fields applicant_name/email/phone remain intact)
     */
    router.delete('/account', authenticateToken(pool), async (req, res) => {
        try {
            const userId = req.user.id;

            // Prevent admins from accidentally deleting themselves
            if (req.user.role === 'admin') {
                // Check how many admins remain
                const adminCount = await pool.query(
                    "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
                );
                if (parseInt(adminCount.rows[0].count) <= 1) {
                    return res.status(400).json({ 
                        error: 'Cannot delete the last admin account' 
                    });
                }
            }

            await pool.query('DELETE FROM users WHERE id = $1', [userId]);

            console.log(`[Auth] User account deleted: ${req.user.email} (ID: ${userId})`);
            res.json({ success: true, message: 'Account deleted successfully' });
        } catch (err) {
            console.error('[Auth] Account deletion error:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};
