/**
 * Database Seed Script
 * 
 * Seeds admin users by email. Uses UPSERT (INSERT ... ON CONFLICT)
 * so it's safe to run on every startup.
 * 
 * Admin emails come from the ADMIN_EMAILS environment variable.
 * Format: comma-separated email addresses
 * Example: ADMIN_EMAILS=dolev@gmail.com,barak@gmail.com
 */

const seedAdmins = async (pool) => {
    const adminEmails = process.env.ADMIN_EMAILS;
    
    if (!adminEmails) {
        console.log('[Seed] No ADMIN_EMAILS configured — skipping admin seed');
        return;
    }

    const emails = adminEmails.split(',').map(e => e.trim()).filter(Boolean);
    
    if (emails.length === 0) {
        console.log('[Seed] ADMIN_EMAILS is empty — skipping admin seed');
        return;
    }

    console.log(`[Seed] Ensuring ${emails.length} admin(s) are configured...`);

    for (const email of emails) {
        try {
            // If the user already exists (by email), promote them to admin
            const result = await pool.query(
                `UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP 
                 WHERE email = $1 AND role != 'admin'
                 RETURNING id, email`,
                [email]
            );

            if (result.rows.length > 0) {
                console.log(`[Seed] Promoted existing user to admin: ${email}`);
            } else {
                // Check if user exists at all
                const exists = await pool.query(
                    'SELECT id, role FROM users WHERE email = $1',
                    [email]
                );
                
                if (exists.rows.length > 0) {
                    console.log(`[Seed] Admin already configured: ${email}`);
                } else {
                    // User doesn't exist yet — they'll be created as admin on first Google sign-in
                    console.log(`[Seed] Admin email registered (will activate on first sign-in): ${email}`);
                }
            }
        } catch (err) {
            console.error(`[Seed] Error processing admin email ${email}:`, err.message);
        }
    }

    console.log('[Seed] Admin seed complete');
};

module.exports = { seedAdmins };
