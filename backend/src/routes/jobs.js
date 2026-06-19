/**
 * Job Routes — Job Board & Applications
 * 
 * Public:
 *   GET  /api/jobs          — List open jobs
 *   GET  /api/jobs/:id      — Get job detail
 * 
 * Authenticated:
 *   POST /api/jobs/:id/apply — Apply to a job
 *   GET  /api/jobs/my/applications — Get user's own applications
 * 
 * Admin:
 *   POST   /api/jobs           — Create job
 *   PUT    /api/jobs/:id       — Update job
 *   DELETE /api/jobs/:id       — Delete job
 *   GET    /api/jobs/:id/applications — List applicants for a job
 *   PATCH  /api/jobs/applications/:id/status — Update application status
 */

const express = require('express');
const nodemailer = require('nodemailer');
const { authenticateToken, requireAdmin, requireRecruiterOrAdmin, optionalAuth } = require('../middleware/auth');

async function sendApplicationNotificationEmail(pool, job, applicant, answers) {
    try {
        const settingRes = await pool.query(
            "SELECT value FROM site_settings WHERE key = 'email_notifications_enabled'"
        );
        const emailEnabled = settingRes.rows.length > 0 && settingRes.rows[0].value === 'true';
        if (!emailEnabled) {
            console.log('[Email] Notifications are disabled, skipping email send.');
            return;
        }

        const recipients = new Set();
        if (job.creator_email) {
            recipients.add(job.creator_email);
        }
        if (process.env.ADMIN_EMAILS) {
            process.env.ADMIN_EMAILS.split(',').map(e => e.trim()).filter(Boolean).forEach(e => recipients.add(e));
        }

        if (recipients.size === 0) {
            console.log('[Email] No recipients found for notification.');
            return;
        }

        const toList = Array.from(recipients).join(', ');
        const subject = `הגשת מועמדות חדשה למשרה: ${job.title} / New Application for ${job.title}`;
        
        let answersText = '';
        if (answers && Object.keys(answers).length > 0) {
            answersText = '\n\nתשובות לשאלות / Questionnaire Answers:\n';
            for (const [q, a] of Object.entries(answers)) {
                answersText += `- ${q}: ${typeof a === 'boolean' ? (a ? 'כן / Yes' : 'לא / No') : a}\n`;
            }
        }

        const textBody = `
היי,

התקבלה הגשת מועמדות חדשה באתר עבור המשרה: "${job.title}".

פרטי המועמד/ת:
- שם מלא: ${applicant.name}
- אימייל: ${applicant.email}
- טלפון: ${applicant.phone || 'לא צוין'}
- קורות חיים (CV): ${applicant.cvUrl || 'לא צורפו'}
${answersText}

ניתן לצפות בפרטים המלאים בלוח הבקרה של המערכת.

---
Hi,

A new application has been submitted for the job: "${job.title}".

Applicant details:
- Name: ${applicant.name}
- Email: ${applicant.email}
- Phone: ${applicant.phone || 'Not specified'}
- CV: ${applicant.cvUrl || 'Not attached'}

You can review all details in the management dashboard.
`;

        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT || 587;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const smtpFrom = process.env.SMTP_FROM || 'no-reply@barakaloni.com';

        if (smtpHost && smtpUser && smtpPass) {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: parseInt(smtpPort),
                secure: parseInt(smtpPort) === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            await transporter.sendMail({
                from: smtpFrom,
                to: toList,
                subject: subject,
                text: textBody
            });

            console.log(`[Email] Application notification successfully sent to ${toList}`);
        } else {
            console.log('\n============================================================');
            console.log('[EMAIL NOTIFICATION] (SMTP not configured, logging to console)');
            console.log(`TO: ${toList}`);
            console.log(`SUBJECT: ${subject}`);
            console.log('CONTENT:');
            console.log(textBody);
            console.log('============================================================\n');
        }
    } catch (err) {
        console.error('[Email] Failed to send application email notification:', err.message);
    }
}

const router = express.Router();

module.exports = (pool) => {
    // ============================================================
    // PUBLIC ROUTES
    // ============================================================

    /**
     * GET /api/jobs
     * 
     * Public. Returns all open jobs. If admin/recruiter, returns all jobs based on query.
     * Query params: status (default 'open'), search (optional)
     */
    router.get('/', optionalAuth(pool), async (req, res) => {
        const status = req.query.status || 'open';
        const search = req.query.search || '';

        try {
            let query = `
                SELECT j.*, u.full_name as creator_name
                FROM jobs j
                LEFT JOIN users u ON j.created_by = u.id
            `;
            const params = [];
            const conditions = [];

            const isManager = req.user && (req.user.role === 'admin' || req.user.role === 'recruiter');

            if (!isManager) {
                // For non-admin public requests, only show open & visible jobs that have not expired
                conditions.push(`j.status = 'open'`);
                conditions.push(`j.is_visible = true`);
                conditions.push(`(j.expiration_date IS NULL OR j.expiration_date > CURRENT_TIMESTAMP)`);
            } else {
                // For managers, filter by status if provided (default 'open', but they can ask for 'closed' or 'all')
                if (req.query.status && req.query.status !== 'all') {
                    conditions.push(`j.status = $${params.length + 1}`);
                    params.push(req.query.status);
                }
            }

            if (search) {
                conditions.push(`(j.title ILIKE $${params.length + 1} OR j.description ILIKE $${params.length + 1} OR j.location ILIKE $${params.length + 1})`);
                params.push(`%${search}%`);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY j.created_at DESC';

            const result = await pool.query(query, params);

            res.json({
                jobs: result.rows.map(j => ({
                    id: j.id,
                    title: j.title,
                    description: j.description,
                    location: j.location,
                    jobType: j.job_type,
                    status: j.status,
                    creatorName: j.creator_name,
                    isVisible: j.is_visible,
                    editPolicy: j.edit_policy,
                    sharedRecruiterIds: j.shared_recruiter_ids,
                    customFields: j.custom_fields || [],
                    questions: j.questions || [],
                    expirationDate: j.expiration_date || null,
                    createdAt: j.created_at,
                    updatedAt: j.updated_at,
                }))
            });
        } catch (err) {
            console.error('[Jobs] Error listing jobs:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * GET /api/jobs/my/applications
     * 
     * Authenticated. Returns the current user's job applications.
     */
    router.get('/my/applications', authenticateToken(pool), async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT a.*, j.title as job_title, j.status as job_status, j.location as job_location
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 WHERE a.user_id = $1
                 ORDER BY a.applied_at DESC`,
                [req.user.id]
            );

            res.json({
                applications: result.rows.map(a => ({
                    id: a.id,
                    jobId: a.job_id,
                    jobTitle: a.job_title,
                    jobStatus: a.job_status,
                    jobLocation: a.job_location,
                    status: a.status,
                    coverLetter: a.cover_letter,
                    answers: a.answers || {},
                    appliedAt: a.applied_at,
                }))
            });
        } catch (err) {
            console.error('[Jobs] Error fetching user applications:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ============================================================
    // JOB TEMPLATE ROUTES
    // ============================================================

    /**
     * GET /api/jobs/templates/all
     * 
     * Recruiter or Admin only. Fetch all templates.
     */
    router.get('/templates/all', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT t.*, u.full_name as creator_name 
                 FROM job_templates t
                 LEFT JOIN users u ON t.created_by = u.id
                 ORDER BY t.created_at DESC`
            );
            res.json({
                templates: result.rows.map(t => ({
                    id: t.id,
                    title: t.title,
                    description: t.description || '',
                    customFields: t.custom_fields || [],
                    questions: t.questions || [],
                    creatorName: t.creator_name,
                    createdAt: t.created_at,
                    updatedAt: t.updated_at
                }))
            });
        } catch (err) {
            console.error('[Templates] Error fetching templates:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * POST /api/jobs/templates/create
     * 
     * Recruiter or Admin only. Create a template.
     */
    router.post('/templates/create', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const { title, description, customFields, questions } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        try {
            const result = await pool.query(
                `INSERT INTO job_templates (title, description, custom_fields, questions, created_by)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [title, description || null, customFields ? JSON.stringify(customFields) : '[]', questions ? JSON.stringify(questions) : '[]', req.user.id]
            );
            const t = result.rows[0];
            res.status(201).json({
                id: t.id,
                title: t.title,
                description: t.description || '',
                customFields: t.custom_fields || [],
                questions: t.questions || [],
                createdAt: t.created_at
            });
        } catch (err) {
            console.error('[Templates] Error creating template:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * PUT /api/jobs/templates/:id
     * 
     * Recruiter or Admin only. Update a template.
     */
    router.put('/templates/:id', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const templateId = parseInt(req.params.id);
        if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid template ID' });

        const { title, description, customFields, questions } = req.body;
        try {
            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(title); }
            if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
            if (customFields !== undefined) { updates.push(`custom_fields = $${paramIndex++}`); values.push(customFields ? JSON.stringify(customFields) : '[]'); }
            if (questions !== undefined) { updates.push(`questions = $${paramIndex++}`); values.push(questions ? JSON.stringify(questions) : '[]'); }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            updates.push('updated_at = CURRENT_TIMESTAMP');
            values.push(templateId);

            const result = await pool.query(
                `UPDATE job_templates SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Template not found' });
            }

            const t = result.rows[0];
            res.json({
                id: t.id,
                title: t.title,
                description: t.description || '',
                customFields: t.custom_fields || [],
                questions: t.questions || [],
                createdAt: t.created_at,
                updatedAt: t.updated_at
            });
        } catch (err) {
            console.error('[Templates] Error updating template:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * DELETE /api/jobs/templates/:id
     * 
     * Recruiter or Admin only. Delete a template.
     */
    router.delete('/templates/:id', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const templateId = parseInt(req.params.id);
        if (isNaN(templateId)) return res.status(400).json({ error: 'Invalid template ID' });

        try {
            const result = await pool.query(
                'DELETE FROM job_templates WHERE id = $1 RETURNING id, title',
                [templateId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Template not found' });
            }

            res.json({ success: true, message: 'Template deleted successfully' });
        } catch (err) {
            console.error('[Templates] Error deleting template:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * GET /api/jobs/:id
     * 
     * Public. Returns a single job's detail.
     */
    router.get('/:id', async (req, res) => {
        const jobId = parseInt(req.params.id);
        if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid job ID' });

        try {
            const result = await pool.query(
                `SELECT j.*, u.full_name as creator_name
                 FROM jobs j
                 LEFT JOIN users u ON j.created_by = u.id
                 WHERE j.id = $1`,
                [jobId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }

            const j = result.rows[0];
            res.json({
                id: j.id,
                title: j.title,
                description: j.description,
                location: j.location,
                jobType: j.job_type,
                status: j.status,
                creatorName: j.creator_name,
                isVisible: j.is_visible,
                editPolicy: j.edit_policy,
                sharedRecruiterIds: j.shared_recruiter_ids,
                customFields: j.custom_fields || [],
                questions: j.questions || [],
                expirationDate: j.expiration_date || null,
                createdAt: j.created_at,
                updatedAt: j.updated_at,
            });
        } catch (err) {
            console.error('[Jobs] Error fetching job:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ============================================================
    // AUTHENTICATED ROUTES
    // ============================================================

    /**
     * POST /api/jobs/:id/apply
     * 
     * Authenticated. Apply to a job.
     * Snapshots user data (name, email, phone, CV) into the applications table.
     * This ensures admin can see applicant info even if user deletes their account.
     * 
     * Body: { coverLetter: "optional message" }
     */
    router.post('/:id/apply', authenticateToken(pool), async (req, res) => {
        const jobId = parseInt(req.params.id);
        if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid job ID' });

        const { coverLetter, answers } = req.body;

        try {
            // Check if job exists, is open and not expired
            const jobResult = await pool.query(
                "SELECT id, title, status, expiration_date, creator_email FROM jobs WHERE id = $1",
                [jobId]
            );

            if (jobResult.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }

            const job = jobResult.rows[0];
            if (job.status !== 'open') {
                return res.status(400).json({ error: 'This job is no longer accepting applications' });
            }

            if (job.expiration_date && new Date(job.expiration_date) <= new Date()) {
                return res.status(400).json({ error: 'This job has expired and is no longer accepting applications' });
            }

            // Check if user already applied
            const existing = await pool.query(
                'SELECT id FROM applications WHERE job_id = $1 AND user_id = $2',
                [jobId, req.user.id]
            );

            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'You have already applied to this job' });
            }

            // Get full user data for snapshot
            const userData = await pool.query(
                'SELECT full_name, email, phone, cv_url FROM users WHERE id = $1',
                [req.user.id]
            );

            const user = userData.rows[0];

            // Create application with user snapshot and custom answers
            const result = await pool.query(
                `INSERT INTO applications (job_id, user_id, applicant_name, applicant_email, applicant_phone, cv_url, cover_letter, answers)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id, applied_at`,
                [jobId, req.user.id, user.full_name, user.email, user.phone, user.cv_url, coverLetter || null, answers ? JSON.stringify(answers) : '{}']
            );

            console.log(`[Jobs] New application: User ${req.user.email} applied to job #${jobId}`);

            // Dispatch email notification asynchronously
            sendApplicationNotificationEmail(pool, job, {
                name: user.full_name,
                email: user.email,
                phone: user.phone,
                cvUrl: user.cv_url
            }, answers);

            res.status(201).json({
                id: result.rows[0].id,
                appliedAt: result.rows[0].applied_at,
                message: 'Application submitted successfully'
            });
        } catch (err) {
            console.error('[Jobs] Application error:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ============================================================
    // ADMIN ROUTES
    // ============================================================

    /**
     * POST /api/jobs
     * 
     * Admin only. Create a new job posting.
     * Body: { title, description, location, jobType }
     */
    router.post('/', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const { title, description, location, jobType, isVisible, editPolicy, sharedRecruiterIds, customFields, questions, expirationDate } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const validJobTypes = ['full-time', 'part-time', 'contract'];
        const type = validJobTypes.includes(jobType) ? jobType : 'full-time';
        const visible = isVisible !== undefined ? isVisible : true;
        const validPolicies = ['owner_only', 'all_recruiters', 'specific_recruiters'];
        const policy = validPolicies.includes(editPolicy) ? editPolicy : 'owner_only';
        const sharedIds = Array.isArray(sharedRecruiterIds) ? sharedRecruiterIds : [];

        try {
            const result = await pool.query(
                `INSERT INTO jobs (title, description, location, job_type, is_visible, created_by, creator_name, creator_email, edit_policy, shared_recruiter_ids, custom_fields, questions, expiration_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                 RETURNING *`,
                [
                    title, 
                    description, 
                    location || null, 
                    type, 
                    visible, 
                    req.user.id, 
                    req.user.full_name, 
                    req.user.email, 
                    policy, 
                    sharedIds, 
                    customFields ? JSON.stringify(customFields) : '[]', 
                    questions ? JSON.stringify(questions) : '[]', 
                    expirationDate || null
                ]
            );

            const j = result.rows[0];
            console.log(`[Jobs] Job created: "${title}" by ${req.user.email}`);

            res.status(201).json({
                id: j.id,
                title: j.title,
                description: j.description,
                location: j.location,
                jobType: j.job_type,
                status: j.status,
                isVisible: j.is_visible,
                editPolicy: j.edit_policy,
                sharedRecruiterIds: j.shared_recruiter_ids,
                customFields: j.custom_fields || [],
                questions: j.questions || [],
                expirationDate: j.expiration_date || null,
                createdAt: j.created_at,
            });
        } catch (err) {
            console.error('[Jobs] Error creating job:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * PUT /api/jobs/:id
     * 
     * Admin only. Update a job posting.
     * Body: { title, description, location, jobType, status, isVisible, editPolicy, sharedRecruiterIds, customFields, questions, expirationDate }
     */
    router.put('/:id', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const jobId = parseInt(req.params.id);
        if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid job ID' });

        const { title, description, location, jobType, status, isVisible, editPolicy, sharedRecruiterIds, customFields, questions, expirationDate } = req.body;

        try {
            // Check ownership / permissions
            const jobResult = await pool.query('SELECT created_by, edit_policy, shared_recruiter_ids FROM jobs WHERE id = $1', [jobId]);
            if (jobResult.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
            
            const job = jobResult.rows[0];
            const isAdmin = req.user.role === 'admin';
            const isOwner = job.created_by === req.user.id;
            const isSharedAll = job.edit_policy === 'all_recruiters';
            const isSharedSpecific = job.edit_policy === 'specific_recruiters' && (job.shared_recruiter_ids || []).includes(req.user.id);
            
            if (!isAdmin && !isOwner && !isSharedAll && !isSharedSpecific) {
                return res.status(403).json({ error: 'You do not have permission to edit this job' });
            }

            const updates = [];
            const values = [];
            let paramIndex = 1;

            if (title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(title); }
            if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
            if (location !== undefined) { updates.push(`location = $${paramIndex++}`); values.push(location || null); }
            if (jobType !== undefined) { updates.push(`job_type = $${paramIndex++}`); values.push(jobType); }
            if (status !== undefined) { updates.push(`status = $${paramIndex++}`); values.push(status); }
            if (isVisible !== undefined) { updates.push(`is_visible = $${paramIndex++}`); values.push(isVisible); }
            if (editPolicy !== undefined) { updates.push(`edit_policy = $${paramIndex++}`); values.push(editPolicy); }
            if (sharedRecruiterIds !== undefined) { updates.push(`shared_recruiter_ids = $${paramIndex++}`); values.push(sharedRecruiterIds); }
            if (customFields !== undefined) { updates.push(`custom_fields = $${paramIndex++}`); values.push(customFields ? JSON.stringify(customFields) : '[]'); }
            if (questions !== undefined) { updates.push(`questions = $${paramIndex++}`); values.push(questions ? JSON.stringify(questions) : '[]'); }
            if (expirationDate !== undefined) { updates.push(`expiration_date = $${paramIndex++}`); values.push(expirationDate || null); }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            updates.push('updated_at = CURRENT_TIMESTAMP');
            values.push(jobId);

            const result = await pool.query(
                `UPDATE jobs SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }

            const j = result.rows[0];
            res.json({
                id: j.id,
                title: j.title,
                description: j.description,
                location: j.location,
                jobType: j.job_type,
                status: j.status,
                isVisible: j.is_visible,
                editPolicy: j.edit_policy,
                sharedRecruiterIds: j.shared_recruiter_ids,
                customFields: j.custom_fields || [],
                questions: j.questions || [],
                expirationDate: j.expiration_date || null,
                createdAt: j.created_at,
                updatedAt: j.updated_at,
            });
        } catch (err) {
            console.error('[Jobs] Error updating job:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * DELETE /api/jobs/:id
     * 
     * Admin only. Delete a job and all its applications (CASCADE).
     */
    router.delete('/:id', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const jobId = parseInt(req.params.id);
        if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid job ID' });

        try {
            // Check ownership / permissions
            const jobResult = await pool.query('SELECT created_by, edit_policy, shared_recruiter_ids FROM jobs WHERE id = $1', [jobId]);
            if (jobResult.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
            
            const job = jobResult.rows[0];
            const isAdmin = req.user.role === 'admin';
            const isOwner = job.created_by === req.user.id;
            const isSharedAll = job.edit_policy === 'all_recruiters';
            const isSharedSpecific = job.edit_policy === 'specific_recruiters' && (job.shared_recruiter_ids || []).includes(req.user.id);
            
            if (!isAdmin && !isOwner && !isSharedAll && !isSharedSpecific) {
                return res.status(403).json({ error: 'You do not have permission to delete this job' });
            }

            const result = await pool.query(
                'DELETE FROM jobs WHERE id = $1 RETURNING id, title',
                [jobId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }

            console.log(`[Jobs] Job deleted: "${result.rows[0].title}" (ID: ${jobId})`);
            res.json({ success: true, message: 'Job deleted successfully' });
        } catch (err) {
            console.error('[Jobs] Error deleting job:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * GET /api/jobs/:id/applications
     * 
     * Admin only. List all applications for a specific job.
     * Shows applicant snapshots — even for deleted users (user_id = NULL).
     */
    router.get('/:id/applications', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const jobId = parseInt(req.params.id);
        if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid job ID' });

        try {
            // Check ownership
            const jobResult = await pool.query('SELECT created_by, edit_policy, shared_recruiter_ids FROM jobs WHERE id = $1', [jobId]);
            if (jobResult.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
            
            const job = jobResult.rows[0];
            const isAdmin = req.user.role === 'admin';
            const isOwner = job.created_by === req.user.id;
            const isSharedAll = job.edit_policy === 'all_recruiters';
            const isSharedSpecific = job.edit_policy === 'specific_recruiters' && (job.shared_recruiter_ids || []).includes(req.user.id);
            
            if (!isAdmin && !isOwner && !isSharedAll && !isSharedSpecific) {
                return res.status(403).json({ error: 'You do not have permission to view applications for this job' });
            }

            const result = await pool.query(
                `SELECT a.*, 
                        u.full_name as current_name, 
                        u.email as current_email,
                        u.picture_url as current_picture
                 FROM applications a
                 LEFT JOIN users u ON a.user_id = u.id
                 WHERE a.job_id = $1
                 ORDER BY a.applied_at DESC`,
                [jobId]
            );

            res.json({
                applications: result.rows.map(a => ({
                    id: a.id,
                    jobId: a.job_id,
                    userId: a.user_id,
                    // Snapshot data (always available, even if user deleted)
                    applicantName: a.applicant_name,
                    applicantEmail: a.applicant_email,
                    applicantPhone: a.applicant_phone,
                    cvUrl: a.cv_url,
                    coverLetter: a.cover_letter,
                    answers: a.answers || {},
                    status: a.status,
                    appliedAt: a.applied_at,
                    // Current user data (null if user deleted account)
                    isUserDeleted: a.user_id === null,
                    currentName: a.current_name,
                    currentEmail: a.current_email,
                    currentPicture: a.current_picture,
                }))
            });
        } catch (err) {
            console.error('[Jobs] Error listing applications:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * PATCH /api/jobs/applications/:id/status
     * 
     * Admin only. Update an application's status.
     * Body: { status: 'pending' | 'reviewed' | 'accepted' | 'rejected' }
     */
    router.patch('/applications/:id/status', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const appId = parseInt(req.params.id);
        if (isNaN(appId)) return res.status(400).json({ error: 'Invalid application ID' });

        const { status } = req.body;
        const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        try {
            // Check job ownership
            const appResult = await pool.query('SELECT job_id FROM applications WHERE id = $1', [appId]);
            if (appResult.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
            
            const jobResult = await pool.query('SELECT created_by, edit_policy, shared_recruiter_ids FROM jobs WHERE id = $1', [appResult.rows[0].job_id]);
            const job = jobResult.rows[0];
            
            const isAdmin = req.user.role === 'admin';
            const isOwner = job.created_by === req.user.id;
            const isSharedAll = job.edit_policy === 'all_recruiters';
            const isSharedSpecific = job.edit_policy === 'specific_recruiters' && (job.shared_recruiter_ids || []).includes(req.user.id);
            
            if (!isAdmin && !isOwner && !isSharedAll && !isSharedSpecific) {
                return res.status(403).json({ error: 'You do not have permission to update this application' });
            }

            const result = await pool.query(
                'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
                [status, appId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Application not found' });
            }

            res.json({
                id: result.rows[0].id,
                status: result.rows[0].status,
                message: 'Application status updated'
            });
        } catch (err) {
            console.error('[Jobs] Error updating application status:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * PATCH /api/jobs/:id/owner
     * 
     * Admin only. Transfer ownership of a job.
     */
    router.patch('/:id/owner', authenticateToken(pool), requireAdmin, async (req, res) => {
        const jobId = parseInt(req.params.id);
        if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid job ID' });

        const { newOwnerId } = req.body;
        if (!newOwnerId) return res.status(400).json({ error: 'newOwnerId is required' });

        try {
            const userResult = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [newOwnerId]);
            if (userResult.rows.length === 0) return res.status(404).json({ error: 'New owner not found' });
            
            const newOwner = userResult.rows[0];

            const result = await pool.query(
                'UPDATE jobs SET created_by = $1, creator_name = $2, creator_email = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id',
                [newOwnerId, newOwner.full_name, newOwner.email, jobId]
            );

            if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
            res.json({ success: true, message: 'Job owner updated' });
        } catch (err) {
            console.error('[Jobs] Error transferring ownership:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * GET /api/jobs/settings/notifications
     * 
     * Recruiter or Admin only. Fetch the site-wide email notifications setting.
     */
    router.get('/settings/notifications', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        try {
            const result = await pool.query(
                "SELECT value FROM site_settings WHERE key = 'email_notifications_enabled'"
            );
            const enabled = result.rows.length > 0 && result.rows[0].value === 'true';
            res.json({ email_notifications_enabled: enabled });
        } catch (err) {
            console.error('[Settings] Error fetching email notifications setting:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    /**
     * POST /api/jobs/settings/notifications
     * 
     * Recruiter or Admin only. Toggle site-wide email notifications setting.
     */
    router.post('/settings/notifications', authenticateToken(pool), requireRecruiterOrAdmin, async (req, res) => {
        const { email_notifications_enabled } = req.body;
        if (email_notifications_enabled === undefined) {
            return res.status(400).json({ error: 'email_notifications_enabled is required' });
        }
        
        const valStr = email_notifications_enabled ? 'true' : 'false';

        try {
            await pool.query(
                `INSERT INTO site_settings (key, value)
                 VALUES ('email_notifications_enabled', $1)
                 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
                [valStr]
            );
            res.json({ success: true, email_notifications_enabled: email_notifications_enabled });
        } catch (err) {
            console.error('[Settings] Error updating email notifications setting:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};
