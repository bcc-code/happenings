# Family Registrations - Requirements & Planning

## Overview

The Family Registrations feature allows users to register multiple family members for events together. This leverages the BCC Core API SDK to understand family relationships and affiliations, enabling group registrations with a primary contact managing the family's event participation.

## Status: Planning Phase

**Last Updated:** [Date]
**Status:** Requirements gathering

---

## Core Requirements

### Family Structure

- [ ] **Family Groups**
  - Create family groups
  - Link users to family groups
  - Primary contact/head of family designation
  - Family name/identifier
  - Family relationships (parent, child, spouse, etc.)

- [ ] **Family Relationships**
  - Parent-child relationships
  - Spouse/partner relationships
  - Guardian relationships
  - Other family relationships
  - Relationship types from BCC Core API SDK

### Family Registration

- [ ] **Group Registration**
  - Register multiple family members at once
  - Primary contact manages registration
  - Individual pricing per family member
  - Combined payment or individual payments
  - Family discount support (if applicable)

- [ ] **Registration Management**
  - Add/remove family members from registration
  - Update individual family member details
  - View family registration status
  - Cancel individual or entire family registration

### User Features

- [ ] **Family Registration Flow**
  - Select "Register Family" option
  - Add family members (from existing relationships or new)
  - Configure individual preferences per family member
  - Review family registration summary
  - Complete payment for family

- [ ] **Family Management**
  - View family members
  - Manage family relationships
  - Set primary contact
  - View family registration history

### Admin Features

- [ ] **Family Registration Management**
  - View family registrations
  - Manage family group registrations
  - Edit family member details
  - Process family payments
  - Family registration reports

- [ ] **Reporting**
  - Family registration statistics
  - Family size distribution
  - Family participation rates
  - Family payment tracking

## Integration with BCC Core API SDK

### Using the SDK

The `@bcc-code/bcc-core-api-node-sdk` provides:

- **Persons**: User/person entities
- **Relations**: Family relationships between persons
- **Affiliations**: Church/organization affiliations
- **Roles**: Role assignments within organizations

### Data Model Alignment

- **User Model**: Maps to SDK's Person entity
- **UserAffiliation**: Maps to SDK's Affiliation entity
- **Family Relationships**: Maps to SDK's Relation entity
- **Family Groups**: Custom model linking registrations

### SDK Usage

```typescript
import { BccCoreApi } from '@bcc-code/bcc-core-api-node-sdk';

// Get user's family relationships
const relations = await bccCoreApi.getPersonRelations(userId);

// Get user's affiliations
const affiliations = await bccCoreApi.getPersonAffiliations(userId);

// Create family group from relationships
const familyMembers = relations
  .filter(r => r.type === 'parent' || r.type === 'child' || r.type === 'spouse')
  .map(r => r.relatedPersonId);
```

## Database Schema (Planned)

```sql
-- Family groups
family_groups (
  id, tenant_id, name, primary_contact_id,
  created_at, updated_at
)

-- Family group members
family_group_members (
  id, family_group_id, user_id, relationship_type,
  is_primary_contact, added_at
)

-- Family registrations (links multiple registrations)
family_registrations (
  id, family_group_id, event_id, primary_contact_id,
  status, created_at, updated_at
)

-- Registration-family link
registration_families (
  registration_id, family_registration_id
)
```

## API Endpoints (Planned)

### Family Groups
- `GET /api/families` - List user's family groups
- `GET /api/families/:id` - Get family group details
- `POST /api/families` - Create family group
- `PUT /api/families/:id` - Update family group
- `DELETE /api/families/:id` - Delete family group
- `GET /api/families/:id/members` - Get family members
- `POST /api/families/:id/members` - Add family member
- `DELETE /api/families/:id/members/:userId` - Remove family member

### Family Registrations
- `POST /api/events/:eventId/register-family` - Register family for event
- `GET /api/families/:id/registrations` - Get family registrations
- `GET /api/families/:id/registrations/:eventId` - Get family registration for event
- `PUT /api/families/:id/registrations/:eventId` - Update family registration
- `DELETE /api/families/:id/registrations/:eventId` - Cancel family registration
- `POST /api/families/:id/registrations/:eventId/members/:userId` - Add member to family registration
- `DELETE /api/families/:id/registrations/:eventId/members/:userId` - Remove member from family registration

### Family Relationships (via SDK)
- `GET /api/users/me/relationships` - Get user's relationships (from SDK)
- `POST /api/families/:id/sync-relationships` - Sync family from SDK relationships

## UI Components (Planned)

### Admin Dashboard
- Family registration list
- Family group management
- Family registration details
- Family payment processing
- Family registration reports

### End User App
- Family registration form
- Add family members interface
- Family member selection
- Family registration summary
- Family registration management
- Family relationships view

## Registration Flow

### Individual Registration
1. User selects event
2. User fills registration form
3. User completes payment
4. Registration confirmed

### Family Registration
1. User selects event
2. User chooses "Register Family"
3. System loads family members from SDK relationships
4. User selects which family members to register
5. User configures preferences per member:
   - Meal selections
   - Session selections
   - Dietary requirements
   - Special needs
6. System calculates total (individual pricing per member)
7. User reviews family registration summary
8. User completes payment (single or multiple)
9. All family members registered

## Pricing Models

### Family Pricing Options

- **Individual Pricing**: Each family member pays individual price
- **Family Discount**: Discount applied when registering multiple members
- **Family Package**: Fixed price for entire family
- **Child Pricing**: Reduced pricing for children
- **Combined Payment**: Single payment for all family members
- **Individual Payments**: Each member pays separately

## Primary Contact

### Responsibilities

- Manages family registration
- Receives all communications
- Makes payment decisions
- Can update family member details
- Can cancel family registrations

### Permissions

- Primary contact can:
  - Add/remove family members
  - Update family member preferences
  - Make payments
  - Cancel registrations
  - View all family member details

- Family members can:
  - View their own registration
  - Update their own preferences (if allowed)
  - View family registration status

## Integration Points

- **BCC Core API SDK**: Family relationships and affiliations
- **Program Module**: Session selections per family member
- **Catering Module**: Meal selections per family member
- **Resources Module**: Shift assignments per family member
- **Finance Module**: Family payment processing
- **Communication Module**: Family notifications

## Offline Support

- [ ] Cache family group information
- [ ] Queue family registration for sync
- [ ] Offline family member selection
- [ ] Sync family relationships when online

## Notifications

- Family registration confirmation
- Family payment confirmation
- Family member added/removed
- Family registration updates
- Individual notifications to family members (optional)

## Open Questions

- [ ] Should family members be able to register individually if family is already registered?
- [ ] How to handle partial family cancellations?
- [ ] Should there be a maximum family size?
- [ ] How to handle family members who are not users (guests)?
- [ ] Should family relationships be editable or only from SDK?
- [ ] How to handle family discounts - automatic or manual?
- [ ] Should primary contact be able to delegate management?
- [ ] How to handle family members from different churches?
- [ ] Should there be family registration limits per event?
- [ ] How to handle family member age verification for child pricing?

## Notes

_Add implementation notes, decisions, and updates here as development progresses._
