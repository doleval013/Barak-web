# Monitor Screen Data Analysis & Improvement Plan

## 1. What Data You Currently Have

Your current system collects two main types of data: **Visits** and **Events**.

### **A. Visits Data**
Every time a user loads a page, a record is created with:
- **Timestamp**: When it happened.
- **Page Name**: Which page was visited (e.g., 'home', 'programs').
- **Device Type**: Sent from frontend (likely 'mobile' or 'desktop').
- **Language**: Current language selected ('he' or 'en').
- **IP Hash**: Anonymized user identifier (used to track sessions roughly).
- **Heartbeat**: Updates every minute to track how long they stay.

### **B. Events Data**
Specific interactions are tracked separately:
- **Video Clicks**: When someone plays a video.
- **Contact Clicks**: When someone clicks WhatsApp, Phone, etc.
- **Program Views**: When someone views a specific program modal.

### **C. Current Dashboard Metrics**
The "Monitor Screen" (AdminDashboard) currently displays:
1.  **Volume Metrics (24h)**: Total Page Loads, Video Plays, Program Views, Contact Clicks.
2.  **Trends (30 Days)**:
    - Daily Visits (broken down by Hebrew/English).
    - Daily Video & Contact engagement.
    - Average Session Duration per day.
3.  **Breakdowns**:
    - Top Pages.
    - Top Devices.
    - Top Videos.
    - Top Contact Methods.
4.  **Activity Log**: The last 20 raw actions.

---

## 2. What Is Likely "Missing" (The Gaps)

Based on common analytics needs, here is what is missing and how we can get it:

### **A. Metric Gaps (Can be calculated with existing data)**
*These can be added by just changing the Backend Query (SQL).*

1.  **Unique Visitors (Users) vs. Page Views**:
    - *Current*: "100 Visits" could be 1 person refreshing 100 times.
    - *Fix*: Count `DISTINCT ip_hash` to see actual People vs. Loads.
2.  **Real-Time "Online Now"**:
    - *Current*: You only see "Visits Today".
    - *Fix*: Count users whose `last_heartbeat` was in the last 5 minutes.
3.  **Bounce Rate**:
    - *Definition*: % of people who visit ONE page and leave immediately.
    - *Fix*: Calculate sessions with only 1 page view.
4.  **Conversion Rate**:
    - *Definition*: Visits vs. Contact Clicks ratio.
    - *Fix*: Simple math: `(Contact Clicks / Unique Visitors) * 100`.

### **B. Data Gaps (Requires Code/Schema Changes)**
*These require updating the `visits` table and the `api/visit` endpoint.*

1.  **Traffic Source (Referrer)**:
    - *Missing*: Did they come from Google, Facebook, or a direct link?
    - *Action*: Capture `document.referrer` in frontend and save to DB.
2.  **Geographic Location**:
    - *Missing*: Which country/city are they in?
    - *Action*: Use a GeoIP library on the backend to lookup the IP before hashing it.
3.  **Operating System / Browser Details**:
    - *Missing*: Chrome vs Safari, Windows vs iPhone (Granular).
    - *Action*: Parse the `User-Agent` string on the backend.

---

## 3. Recommended Improvement Plan

To "improve the monitor screen" without overwhelming it, I propose we split the improvements into phases:

### Phase 1: Better Insights (No new data collection)
**Goal:** Make the existing numbers more meaningful.
1.  **Add "Active Users Now" Card**: Show users currently on the site.
2.  **Split "Unique Users" vs "Views"**: Show that 50 people generated 200 views.
3.  **Add "Conversion %"**: Show how effective the site is at driving contact.

### Phase 2: Richer Data (New Collection)
**Goal:** Know *who* is visiting and *where* from.
1.  **Capture Referrer**: Add `source` column to `visits`.
2.  **Capture Location**: Add `country` column to `visits`.

### Phase 3: Visual Polish
1.  **Heatmap / User Flow** (Advanced): Visualize the path users take.

---

**Next Steps:**
Since you asked for planning, let me know if **Phase 1 (Better Insights)** matches what you feel is missing, or if you were specifically looking for **Location/Referrer (Phase 2)** data?
