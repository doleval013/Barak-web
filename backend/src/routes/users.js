/**
 * User Routes — Profile Management
 * 
 * GET   /api/users/me      — Get own profile
 * PATCH /api/users/me      — Update own profile (phone, age)
 * POST  /api/users/me/cv   — Upload CV file
 * GET   /api/users         — (Admin) List all users
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for CV uploads
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'cvs');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Name: userId_timestamp.ext
        const ext = path.extname(file.originalname);
        cb(null, `cv_${req.user.id}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
        }
    }
});

module.exports = (pool) => {
    /**
     * GET /api/users/me
     * 
     * Returns the authenticated user's full profile.
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
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            });
        } catch (err) {
            console.error('[Users] Error fetching profile:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * PATCH /api/users/me
     * 
     * Update own profile. Only specific fields can be updated by the user:
     * - phone (string, optional)
     * - age (integer, optional)
     * 
     * Name and email come from Google and can't be changed here.
     */
    router.patch('/me', authenticateToken(pool), async (req, res) => {
        const { phone, age } = req.body;

        try {
            // Build dynamic update query based on provided fields
            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (phone !== undefined) {
                updates.push(`phone = $${paramIndex++}`);
                values.push(phone || null); // Allow clearing by sending empty string
            }

            if (age !== undefined) {
                const ageNum = age === null || age === '' ? null : parseInt(age);
                if (ageNum !== null && (isNaN(ageNum) || ageNum < 0 || ageNum > 120)) {
                    return res.status(400).json({ error: 'Age must be between 0 and 120' });
                }
                updates.push(`age = $${paramIndex++}`);
                values.push(ageNum);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(req.user.id);

            const result = await pool.query(
                `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );

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
                updatedAt: user.updated_at,
            });
        } catch (err) {
            console.error('[Users] Error updating profile:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * POST /api/users/me/cv
     * 
     * Upload a CV file (PDF, DOC, DOCX, max 5MB).
     * Replaces any existing CV for this user.
     */
    router.post('/me/cv', authenticateToken(pool), upload.single('cv'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Delete old CV file if exists
            const oldUser = await pool.query(
                'SELECT cv_url FROM users WHERE id = $1',
                [req.user.id]
            );

            if (oldUser.rows[0]?.cv_url) {
                const oldPath = path.join(__dirname, '..', '..', oldUser.rows[0].cv_url);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            // Store relative path in DB
            const cvUrl = `/uploads/cvs/${req.file.filename}`;

            await pool.query(
                'UPDATE users SET cv_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [cvUrl, req.user.id]
            );

            res.json({ 
                success: true, 
                cvUrl,
                message: 'CV uploaded successfully' 
            });
        } catch (err) {
            console.error('[Users] CV upload error:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * GET /api/users
     * 
     * Admin-only. Returns a paginated list of all users.
     * Query params: page (default 1), limit (default 20), search (optional)
     */
    router.get('/', authenticateToken(pool), requireAdmin, async (req, res) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        try {
            let whereClause = '';
            const queryParams = [limit, offset];

            if (search) {
                whereClause = 'WHERE full_name ILIKE $3 OR email ILIKE $3';
                queryParams.push(`%${search}%`);
            }

            const [usersResult, countResult] = await Promise.all([
                pool.query(
                    `SELECT id, email, full_name, picture_url, phone, age, role, status, created_at
                     FROM users ${whereClause}
                     ORDER BY created_at DESC
                     LIMIT $1 OFFSET $2`,
                    queryParams
                ),
                pool.query(
                    `SELECT COUNT(*) as total FROM users ${whereClause}`,
                    search ? [`%${search}%`] : []
                )
            ]);

            res.json({
                users: usersResult.rows.map(u => ({
                    id: u.id,
                    email: u.email,
                    fullName: u.full_name,
                    pictureUrl: u.picture_url,
                    phone: u.phone,
                    age: u.age,
                    role: u.role,
                    status: u.status,
                    createdAt: u.created_at,
                })),
                pagination: {
                    page,
                    limit,
                    total: parseInt(countResult.rows[0].total),
                    totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
                }
            });
        } catch (err) {
            console.error('[Users] Error listing users:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * PATCH /api/users/:id/role
     * 
     * Admin-only. Updates a user's role (user, recruiter, admin).
     * Cannot change the role of the last admin.
     */
    router.patch('/:id/role', authenticateToken(pool), requireAdmin, async (req, res) => {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'recruiter', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        try {
            // Prevent removing the last admin
            if (role !== 'admin') {
                const targetUser = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
                if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'admin') {
                    const adminCount = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
                    if (parseInt(adminCount.rows[0].count) <= 1) {
                        return res.status(400).json({ error: 'Cannot remove the last admin' });
                    }
                }
            }

            const result = await pool.query(
                'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, role',
                [role, id]
            );

            if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
            res.json(result.rows[0]);
        } catch (err) {
            console.error('[Users] Error updating role:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * PATCH /api/users/:id/status
     * 
     * Admin-only. Updates a user's status (active, blocked).
     * Cannot block the last admin.
     */
    router.patch('/:id/status', authenticateToken(pool), requireAdmin, async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        try {
            // Prevent blocking the last admin
            if (status === 'blocked') {
                const targetUser = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
                if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'admin') {
                    const adminCount = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
                    if (parseInt(adminCount.rows[0].count) <= 1) {
                        return res.status(400).json({ error: 'Cannot block the last admin' });
                    }
                }
            }

            const result = await pool.query(
                'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
                [status, id]
            );

            if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
            res.json(result.rows[0]);
        } catch (err) {
            console.error('[Users] Error updating status:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};
