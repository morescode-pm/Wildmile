# Telemetry System Setup

The telemetry system tracks user sessions, page views, and activity across the application.

## Components

1. **Mongoose Model**: `wildmile/models/TelemetrySession.js`
2. **API Routes**: `wildmile/app/api/telemetry/session/*`
3. **React Hook**: `wildmile/hooks/useTelemetry.js`
4. **Tracker Component**: `wildmile/components/TelemetryTracker.js`
5. **Worker**: `wildmile/lib/telemetry/worker.js` and `wildmile/scripts/telemetry-worker.js`

## Configuration

Add the following environment variable to your `.env.local`:

```env
TELEMETRY_SALT="your-secret-salt"
```

## MongoDB Portions Required

The system uses a dedicated MongoDB collection named `telemetry_sessions`.

### Manual Index Creation (Optional)

While the Mongoose model defines indexes, for production environments you may want to ensure they are created:

```javascript
db.telemetry_sessions.createIndex({ sessionId: 1 }, { unique: true });
db.telemetry_sessions.createIndex({ anonymousId: 1 });
db.telemetry_sessions.createIndex({ userIdHash: 1 });
db.telemetry_sessions.createIndex({ isAuthenticated: 1 });
db.telemetry_sessions.createIndex({ startedAtUtc: 1 });
db.telemetry_sessions.createIndex({ lastActivityAtUtc: 1 });
db.telemetry_sessions.createIndex({ expired: 1 });
```

## Running the Session Expiration Worker

To run the background worker that expires inactive sessions (sessions with no activity for 30 minutes), you can set up a cron job to run the following script every 5 minutes:

```bash
# From the project root
node wildmile/scripts/telemetry-worker.js
```

## How it works

- **Anonymous Tracking**: Every browser is assigned a unique `anonymousId` stored in `localStorage`.
- **Session Lifecycle**: A session starts when the page loads. It tracks page views, clicks, scrolls, and other interactions.
- **Authentication**: When a user logs in, their hashed user ID is linked to the current session without creating a new one.
- **Expiration**: Sessions are marked as expired by the background worker after 30 minutes of inactivity.
- **Privacy**: Raw user IDs are never stored. Only a SHA256 hash of the user ID and a salt is stored (`userIdHash`).

## API Examples

### POST /api/telemetry/session/start
**Request:**
```json
{
  "anonymousId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "60d5ecb54f10c12e7c4f87a1",
  "platform": "web",
  "entryPage": "/",
  "timezone": "America/Chicago",
  "localTime": "10/27/2023, 10:00:00 AM",
  "browser": "Mozilla/5.0...",
  "browserVersion": "5.0...",
  "deviceType": "desktop",
  "screenWidth": 1920,
  "screenHeight": 1080,
  "referrer": "https://google.com",
  "appVersion": "1.0.0"
}
```
**Response:**
```json
{
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### POST /api/telemetry/session/activity
**Request:**
```json
{
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "currentPage": "/dashboard"
}
```
**Response:**
```json
{
  "success": true
}
```

### POST /api/telemetry/session/page
**Request:**
```json
{
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "page": "/projects",
  "authenticated": true
}
```
**Response:**
```json
{
  "success": true
}
```

### POST /api/telemetry/session/auth
**Request:**
```json
{
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "userId": "60d5ecb54f10c12e7c4f87a1"
}
```
**Response:**
```json
{
  "success": true
}
```
