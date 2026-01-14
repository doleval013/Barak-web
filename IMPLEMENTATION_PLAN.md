# Admin Monitor Enhancement Plan

## 1. Objectives
As requested, we will upgrade the Monitor Screen to provide:
- **Unique Visitors vs. Total Views**: Distinguish real people from page refreshes.
- **Live User Count**: Real-time "Who is online now?".
- **Geo Location**: Track Country and City of visitors.
- **Traffic Source**: Track where visitors came from (Google, Facebook, Direct, etc.).
- **Historical Trends**: Visualize how these metrics change over time.

## 2. Technical Implementation Steps

### Step 1: Backend Dependencies
- Install `geoip-lite` to perform local IP-to-Location lookups without slowing down the app.

### Step 2: Database Schema Upgrade
Update `initDb` in `backend/index.js` to add new columns to the `visits` table:
- `country` (VARCHAR)
- `city` (VARCHAR)
- `referrer` (TEXT)
- `user_agent` (TEXT) - Useful for device breakdown refinement.

### Step 3: API Enhancements (`backend/index.js`)
1.  **Modify `POST /api/visit`**:
    -   Accept `referrer` from the request body.
    -   Use `geoip.lookup(ip)` to get country and city.
    -   Save these details to the database.
2.  **Modify `GET /api/stats`**:
    -   **Live Users**: Count active sessions in the last 5 minutes (`last_heartbeat > NOW() - 5m`).
    -   **Unique Visitors**: Count `DISTINCT ip_hash` for the selected period (24h/30d).
    -   **Geo Breakdown**: Group visits by `country` and `city`.
    -   **Source Breakdown**: Group visits by `referrer`.
    -   **History/Trends**:
        -   Daily Unique Visitors vs Total Visits.
        -   Daily Traffic by Source.

### Step 4: Frontend Tracking (`src/App.jsx`)
-   Update the `trackVisit` function to send `referrer: document.referrer`.

### Step 5: Dashboard Visualization (`src/components/AdminDashboard.jsx`)
Refactor the dashboard to include:
1.  **"Live Now" Indicator**: pulsating badge with the current active user count.
2.  **Traffic Source Widget**: Card showing top sources (e.g., "Google", "Instagram", "Direct").
3.  **Geo Location Widget**: List of Top Countries/Cities.
4.  **Trend Graph Upgrade**: Split the main graph to show "Unique Visitors" (Line) vs "Page Loads" (Area).
5.  **Detailed Daily Table**: Enhance the existing table to show Location and Source for recent logs.

## 3. Execution Order
1.  Install backend packages.
2.  Update Database Schema & Backend Logic.
3.  Update Frontend Tracking.
4.  Update Dashboard UI.
