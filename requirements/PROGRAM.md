# Program Module - Requirements & Planning

## Overview

The Program module handles all aspects of event scheduling, sessions, speakers, and program management.

## Status: Planning Phase

**Last Updated:** [Date]
**Status:** Requirements gathering

---

## Core Requirements

### Event Structure

- [ ] **Events**
  - Event title, description, dates
  - Venue information
  - Capacity limits
  - Registration open/close dates
  - Global event flag
  - Access rules for global events

- [ ] **Sessions**
  - Session title, description, time slots
  - Session type (plenary, workshop, break, etc.)
  - Room/venue assignment
  - Capacity limits per session
  - Speaker assignments
  - Prerequisites or dependencies

- [ ] **Speakers**
  - Speaker profile (name, bio, photo)
  - Session assignments
  - Contact information
  - Social media links

- [ ] **Schedule**
  - Day-by-day schedule view
  - Time slot management
  - Session conflicts detection
  - Room availability tracking

### User Features

- [ ] **Registration**
  - Session selection during registration
  - Waitlist for full sessions
  - Session change requests
  - Calendar export (iCal)

- [ ] **Viewing**
  - Personal schedule view
  - Full program view
  - Speaker profiles
  - Session details
  - Offline access to program

### Admin Features

- [ ] **Management**
  - Create/edit/delete events
  - Session management
  - Speaker management
  - Schedule builder
  - Capacity management
  - Conflict resolution tools

- [ ] **Analytics**
  - Session popularity metrics
  - Attendance tracking
  - Capacity utilization
  - Waitlist management

## Database Schema (Planned)

```sql
-- Events table (tenant-scoped)
events (
  id, tenant_id, title, description, 
  start_date, end_date, venue, capacity,
  registration_open, registration_close,
  is_global, access_rules
)

-- Sessions table
sessions (
  id, event_id, title, description,
  start_time, end_time, room, capacity,
  session_type, prerequisites
)

-- Speakers table
speakers (
  id, tenant_id, name, bio, photo_url,
  email, social_links
)

-- Session-Speaker relationship
session_speakers (
  session_id, speaker_id, role
)

-- User session registrations
session_registrations (
  id, user_id, session_id, registered_at,
  status, waitlist_position
)
```

## API Endpoints (Planned)

### Events
- `GET /api/events` - List events (tenant-scoped or global)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Sessions
- `GET /api/events/:eventId/sessions` - List sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/events/:eventId/sessions` - Create session (admin)
- `PUT /api/sessions/:id` - Update session (admin)
- `DELETE /api/sessions/:id` - Delete session (admin)

### Speakers
- `GET /api/speakers` - List speakers (tenant-scoped)
- `GET /api/speakers/:id` - Get speaker details
- `POST /api/speakers` - Create speaker (admin)
- `PUT /api/speakers/:id` - Update speaker (admin)

### Registrations
- `GET /api/users/me/sessions` - Get user's registered sessions
- `POST /api/sessions/:id/register` - Register for session
- `DELETE /api/sessions/:id/register` - Unregister from session

## UI Components (Planned)

### Admin Dashboard
- Event list and management
- Session builder interface
- Speaker management
- Schedule calendar view
- Analytics dashboard

### End User App
- Event list and search
- Program schedule view (day/week view)
- Session detail pages
- Speaker profile pages
- Personal schedule
- Calendar export

## Offline Support

- [ ] Cache full program schedule
- [ ] Cache session details
- [ ] Cache speaker information
- [ ] Offline schedule viewing
- [ ] Queue session registrations for sync

## Integration Points

- **Catering Module**: Link meals to sessions
- **Resources Module**: Attach resources to sessions
- **Communication Module**: Send session reminders
- **Finance Module**: Session-specific pricing

## Open Questions

- [ ] How to handle session conflicts for users?
- [ ] Should sessions have prerequisites?
- [ ] How to handle recurring sessions?
- [ ] Timezone handling strategy?
- [ ] Multi-language support for program content?

## Notes

_Add implementation notes, decisions, and updates here as development progresses._
