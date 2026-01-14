# Resources Module - Requirements & Planning

## Overview

The Resources module handles volunteer shift management for events. Participants and non-participants can sign up for shifts before, during, and after events to contribute their time and help with event operations.

## Status: Planning Phase

**Last Updated:** [Date]
**Status:** Requirements gathering

---

## Core Requirements

### Shift Management

- [ ] **Shift Types**
  - Pre-event shifts (setup, preparation)
  - During-event shifts (operations, support)
  - Post-event shifts (cleanup, teardown)

- [ ] **Shift Details**
  - Shift title and description
  - Date and time (start and end)
  - Location/venue
  - Required number of volunteers
  - Skills/requirements (optional)
  - Shift category/type
  - Contact person/coordinator

- [ ] **Shift Organization**
  - Shift categories (e.g., Setup, Registration, Catering, Security, Cleanup)
  - Event association
  - Session association (optional - for session-specific shifts)
  - Priority levels

### User Features

- [ ] **Shift Sign-up**
  - Browse available shifts
  - Filter by date, time, category
  - View shift details
  - Sign up for shifts
  - Cancel shift sign-up (if allowed)
  - View personal shift schedule
  - Waitlist for full shifts

- [ ] **Shift Viewing**
  - Calendar view of shifts
  - List view with filters
  - Personal schedule view
  - Shift conflict detection
  - Shift reminders

- [ ] **Volunteer Management**
  - View assigned volunteers per shift
  - Contact other volunteers
  - Volunteer notes/instructions

### Admin Features

- [ ] **Shift Management**
  - Create/edit/delete shifts
  - Duplicate shifts
  - Bulk shift creation
  - Set shift capacity
  - Assign volunteers manually
  - Approve/reject volunteer sign-ups (if approval required)
  - Send shift reminders

- [ ] **Volunteer Management**
  - View all volunteers
  - View volunteer schedules
  - Track volunteer hours
  - Volunteer check-in/check-out
  - Volunteer feedback/ratings (optional)

- [ ] **Reporting**
  - Shift coverage reports
  - Volunteer participation statistics
  - Hours tracking
  - Shift attendance
  - Gaps in coverage

## Database Schema (Planned)

```sql
-- Shift categories
shift_categories (
  id, tenant_id, name, description,
  display_order, color
)

-- Shifts table
shifts (
  id, tenant_id, event_id, session_id,
  category_id, title, description,
  start_time, end_time, location,
  required_volunteers, current_volunteers,
  skills_required, contact_person_id,
  shift_type, priority, is_active,
  requires_approval, created_by,
  created_at, updated_at
)

-- Shift assignments (volunteer sign-ups)
shift_assignments (
  id, shift_id, user_id, registration_id,
  status, assigned_at, approved_at,
  checked_in_at, checked_out_at,
  notes, volunteer_notes, hours_worked,
  created_at, updated_at
)

-- Shift waitlist
shift_waitlist (
  id, shift_id, user_id, position,
  added_at, notified_at
)

-- Volunteer skills/tags
volunteer_skills (
  id, name, description
)

-- User volunteer skills
user_volunteer_skills (
  user_id, skill_id, proficiency_level
)

-- Shift requirements (skills needed)
shift_requirements (
  shift_id, skill_id, required, preferred
)
```

## API Endpoints (Planned)

### Shifts
- `GET /api/events/:eventId/shifts` - List shifts for event
- `GET /api/shifts/:id` - Get shift details
- `POST /api/events/:eventId/shifts` - Create shift (admin)
- `PUT /api/shifts/:id` - Update shift (admin)
- `DELETE /api/shifts/:id` - Delete shift (admin)
- `POST /api/shifts/:id/duplicate` - Duplicate shift (admin)

### Shift Sign-up
- `GET /api/shifts` - List available shifts (with filters)
- `GET /api/shifts/:id/availability` - Check shift availability
- `POST /api/shifts/:id/signup` - Sign up for shift
- `DELETE /api/shifts/:id/signup` - Cancel shift sign-up
- `GET /api/users/me/shifts` - Get user's assigned shifts
- `GET /api/users/me/shifts/calendar` - Get user's shift calendar

### Shift Management (Admin)
- `GET /api/shifts/:id/volunteers` - Get shift volunteers
- `POST /api/shifts/:id/assign` - Manually assign volunteer (admin)
- `DELETE /api/shifts/:id/assign/:userId` - Remove volunteer (admin)
- `POST /api/shifts/:id/approve/:assignmentId` - Approve volunteer (admin)
- `DELETE /api/shifts/:id/approve/:assignmentId` - Reject volunteer (admin)

### Check-in/Check-out
- `POST /api/shifts/:id/checkin` - Check in to shift
- `POST /api/shifts/:id/checkout` - Check out from shift
- `GET /api/shifts/:id/attendance` - Get shift attendance (admin)

### Categories
- `GET /api/shift-categories` - List shift categories
- `POST /api/shift-categories` - Create category (admin)
- `PUT /api/shift-categories/:id` - Update category (admin)

### Reporting
- `GET /api/admin/shifts/coverage` - Get coverage report (admin)
- `GET /api/admin/shifts/volunteers` - Get volunteer statistics (admin)
- `GET /api/admin/shifts/hours` - Get hours tracking report (admin)

## UI Components (Planned)

### Admin Dashboard
- Shift calendar view
- Shift list with filters
- Shift creation/editing form
- Volunteer assignment interface
- Shift coverage dashboard
- Volunteer management
- Reporting and analytics
- Bulk shift operations

### End User App
- Available shifts browser
- Shift calendar view
- Personal shift schedule
- Shift detail page
- Sign-up interface
- Shift reminders
- Check-in/check-out interface

## Shift Types

### Pre-Event Shifts
- Venue setup
- Equipment setup
- Registration desk preparation
- Material preparation
- Rehearsal support

### During-Event Shifts
- Registration desk
- Information desk
- Catering support
- Technical support
- Security/venue monitoring
- Session support
- Childcare (if applicable)
- Transportation
- First aid/medical support

### Post-Event Shifts
- Cleanup
- Equipment teardown
- Material collection
- Venue restoration
- Thank you activities

## Shift Status Flow

1. **Draft** - Shift created but not published
2. **Open** - Shift is open for sign-ups
3. **Full** - Shift has reached capacity (waitlist available)
4. **In Progress** - Shift is currently happening
5. **Completed** - Shift has ended
6. **Cancelled** - Shift was cancelled

## Volunteer Assignment Status

- **Pending** - Signed up, awaiting approval (if required)
- **Approved** - Approved to work the shift
- **Rejected** - Sign-up was rejected
- **Checked In** - Volunteer has checked in
- **Checked Out** - Volunteer has completed shift
- **No Show** - Volunteer didn't show up
- **Cancelled** - Volunteer cancelled their assignment

## Access Control

### Who Can Sign Up

- **Event Participants**: Users registered for the event
- **Non-Participants**: Users not registered but can volunteer
- **Both**: Both participants and non-participants

### Approval Requirements

- **Automatic**: Sign-ups are automatically approved
- **Manual**: Admin must approve each sign-up
- **Role-based**: Certain roles auto-approved, others need approval

## Integration Points

- **Program Module**: Link shifts to specific sessions
- **Catering Module**: Shifts for meal service
- **Communication Module**: Shift reminders, notifications
- **Finance Module**: Volunteer hours tracking (if applicable)

## Offline Support

- [ ] Cache available shifts
- [ ] Cache personal shift schedule
- [ ] Queue shift sign-ups for sync
- [ ] Offline shift viewing
- [ ] Offline check-in (sync when online)

## Notifications

- Shift sign-up confirmation
- Shift reminder (before shift starts)
- Shift cancellation notification
- Waitlist notification (when spot opens)
- Shift assignment approval/rejection
- Check-in reminders

## Open Questions

- [ ] Should non-participants be able to sign up for shifts?
- [ ] Should there be a minimum/maximum number of shifts per volunteer?
- [ ] How to handle shift conflicts (overlapping shifts)?
- [ ] Should volunteers be able to swap shifts?
- [ ] Should there be shift prerequisites or training requirements?
- [ ] How to handle volunteer no-shows?
- [ ] Should there be volunteer ratings/feedback?
- [ ] Should shifts have a minimum sign-up deadline?
- [ ] How to handle last-minute shift cancellations?
- [ ] Should there be shift categories that require specific skills?
- [ ] Should volunteers be able to see who else is signed up for a shift?
- [ ] Should there be team/group shift assignments?

## Notes

_Add implementation notes, decisions, and updates here as development progresses._
