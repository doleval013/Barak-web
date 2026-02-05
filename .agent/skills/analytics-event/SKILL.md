---
name: analytics-event
description: Add a new trackable analytics event (frontend + backend)
---

# 📊 Add Analytics Event

This skill guides adding new trackable events to the self-hosted analytics system.

## Event System Overview

| Component | Role |
|-----------|------|
| Frontend | Sends events via `fetch('/api/event')` |
| Backend | Stores in PostgreSQL `events` table |
| Admin Dashboard | Displays aggregated stats |

## Event Types Already Tracked

| Event Type | Event Name | Description |
|------------|------------|-------------|
| `video_click` | Program name | User clicked to watch a video |
| `program_view` | Program name | User opened program modal |
| `contact_click` | Method (WhatsApp, Phone, etc.) | User clicked contact button |

## Adding a New Event

### Step 1: Frontend - Track the Event

Add this helper function or import it:

```jsx
const trackEvent = async (type, name, metadata = {}) => {
  if (process.env.NODE_ENV === 'development') return;
  try {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, metadata })
    });
  } catch (err) {
    console.error('Event tracking failed:', err);
  }
};

// Usage example:
trackEvent('button_click', 'hero_cta', { section: 'hero' });
```

### Step 2: Call When Event Occurs

```jsx
const handleClick = () => {
  trackEvent('new_event_type', 'event_name', { extra: 'data' });
  // ... rest of handler
};

<button onClick={handleClick}>Click Me</button>
```

### Step 3: Backend - Events Are Auto-Stored

The backend already handles all events via `/api/event`:

```javascript
// In backend/index.js (already exists)
app.post('/api/event', async (req, res) => {
  const { type, name, metadata } = req.body;
  // Stores in events table
});
```

### Step 4: Display in Admin Dashboard (Optional)

To show the new event type in the dashboard, update `AdminDashboard.jsx`:

```jsx
// Add a new query in the stats fetch
// Add a new card to display the data
```

## Event Database Schema

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50),     -- e.g., 'video_click', 'contact_click'
  event_name VARCHAR(255),    -- e.g., 'WhatsApp', 'program_name'
  metadata JSONB,             -- Additional data
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Best Practices

### 1. Event Naming
```
type: category_action (e.g., 'video_click', 'form_submit')
name: specific identifier (e.g., 'hero_video', 'contact_form')
```

### 2. Metadata Structure
Keep metadata consistent for the same event type:
```javascript
// video_click events
{ duration: 0, programId: 'gefen' }

// contact_click events
{ method: 'whatsapp', source: 'floating_button' }
```

### 3. Don't Over-Track
Track meaningful user actions, not every interaction:
- ✅ Button clicks that indicate intent
- ✅ Form submissions
- ✅ Video plays
- ❌ Every scroll event
- ❌ Mouse movements

## Example: Track Social Link Clicks

```jsx
// In Footer.jsx or Contact.jsx
const handleSocialClick = (platform) => {
  trackEvent('social_click', platform, { location: 'footer' });
};

<a 
  href="https://facebook.com/barakaloni" 
  onClick={() => handleSocialClick('facebook')}
>
  Facebook
</a>
```

## Viewing Event Data

1. **Admin Dashboard:** https://dogs.barakaloni.com/admin
2. **Direct Query (requires DB access):**
   ```sql
   SELECT event_type, event_name, COUNT(*) 
   FROM events 
   GROUP BY event_type, event_name 
   ORDER BY COUNT(*) DESC;
   ```

## Checklist

- [ ] Event type and name defined
- [ ] `trackEvent` function called at appropriate trigger
- [ ] Metadata structure documented
- [ ] Tested locally (events won't send in dev mode)
- [ ] Verified in Admin Dashboard after deployment
