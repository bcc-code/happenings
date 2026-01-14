# BCC Core API SDK Integration

This document describes how to integrate and use the `@bcc-code/bcc-core-api-node-sdk` in the BCC Events Registration API.

## Installation

The SDK is already included in `package.json`:

```json
{
  "dependencies": {
    "@bcc-code/bcc-core-api-node-sdk": "latest"
  }
}
```

## Setup

### Configuration

The SDK requires OAuth2 client credentials. Configure these via environment variables:

```env
BCC_CORE_API_CLIENT_ID=your-client-id
BCC_CORE_API_CLIENT_SECRET=your-client-secret
BCC_CORE_API_BASE_URL=https://api.bcc.no  # or your API URL
```

### Initialization

```typescript
import { BccCoreApi } from '@bcc-code/bcc-core-api-node-sdk';

const bccCoreApi = new BccCoreApi({
  clientId: process.env.BCC_CORE_API_CLIENT_ID!,
  clientSecret: process.env.BCC_CORE_API_CLIENT_SECRET!,
  baseUrl: process.env.BCC_CORE_API_BASE_URL!,
});
```

## Key Entities

### Persons

The SDK's Person entity maps to our User model via the `personId` field.

```typescript
// Get person by ID
const person = await bccCoreApi.getPerson(personId);

// Get person by Auth0 ID (if mapped)
const person = await bccCoreApi.getPersonByAuth0Id(auth0Id);
```

### Relations

Relations represent family relationships between persons.

```typescript
// Get all relations for a person
const relations = await bccCoreApi.getPersonRelations(personId);

// Filter for family relationships
const familyRelations = relations.filter(r => 
  ['parent', 'child', 'spouse', 'guardian', 'sibling'].includes(r.type)
);

// Get related persons
const familyMemberIds = familyRelations.map(r => r.relatedPersonId);
```

### Affiliations

Affiliations represent church/organization memberships.

```typescript
// Get person's affiliations
const affiliations = await bccCoreApi.getPersonAffiliations(personId);

// Filter for active affiliations
const activeAffiliations = affiliations.filter(a => a.status === 'active');

// Get organization details
const org = await bccCoreApi.getOrganization(affiliation.orgId);
```

## Usage in Family Registrations

### Syncing Family Relationships

When a user wants to register their family, sync their relationships from the SDK:

```typescript
async function syncFamilyFromSDK(userId: string, tenantId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.personId) {
    throw new Error('User not linked to BCC Core API Person');
  }

  // Get family relationships from SDK
  const relations = await bccCoreApi.getPersonRelations(user.personId);
  const familyRelations = relations.filter(r =>
    ['parent', 'child', 'spouse', 'guardian'].includes(r.type)
  );

  // Create or update family group
  let familyGroup = await db.familyGroup.findFirst({
    where: {
      tenantId,
      primaryContactId: userId,
    },
  });

  if (!familyGroup) {
    familyGroup = await db.familyGroup.create({
      data: {
        tenantId,
        primaryContactId: userId,
      },
    });
  }

  // Add family members
  for (const relation of familyRelations) {
    const relatedPerson = await bccCoreApi.getPerson(relation.relatedPersonId);
    
    // Find or create user for related person
    let relatedUser = await db.user.findUnique({
      where: { personId: relation.relatedPersonId },
    });

    if (!relatedUser) {
      // Create user if doesn't exist (may need email from person)
      relatedUser = await db.user.create({
        data: {
          personId: relation.relatedPersonId,
          email: relatedPerson.email,
          firstName: relatedPerson.firstName,
          lastName: relatedPerson.lastName,
          // Note: May need to create Auth0 account separately
        },
      });
    }

    // Add to family group
    await db.familyGroupMember.upsert({
      where: {
        familyGroupId_userId: {
          familyGroupId: familyGroup.id,
          userId: relatedUser.id,
        },
      },
      create: {
        familyGroupId: familyGroup.id,
        userId: relatedUser.id,
        relationshipType: relation.type,
        isPrimaryContact: false,
      },
      update: {
        relationshipType: relation.type,
      },
    });
  }

  return familyGroup;
}
```

### Getting User Affiliations

Use the SDK to get and sync user affiliations:

```typescript
async function syncUserAffiliations(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.personId) return;

  const affiliations = await bccCoreApi.getPersonAffiliations(user.personId);
  
  for (const affiliation of affiliations) {
    // Find tenant by organization ID or name
    const tenant = await db.tenant.findFirst({
      where: {
        // Match by organization identifier from SDK
        // This depends on how tenants are identified
      },
    });

    if (tenant) {
      await db.userAffiliation.upsert({
        where: {
          userId_tenantId: {
            userId,
            tenantId: tenant.id,
          },
        },
        create: {
          userId,
          tenantId: tenant.id,
          role: mapSDKRoleToAppRole(affiliation.role),
          status: affiliation.status === 'active' ? 'active' : 'inactive',
        },
        update: {
          role: mapSDKRoleToAppRole(affiliation.role),
          status: affiliation.status === 'active' ? 'active' : 'inactive',
        },
      });
    }
  }
}
```

## Error Handling

```typescript
try {
  const person = await bccCoreApi.getPerson(personId);
} catch (error) {
  if (error.status === 404) {
    // Person not found
  } else if (error.status === 401) {
    // Authentication failed - refresh token
  } else {
    // Other error
  }
}
```

## Caching

Consider caching SDK responses to reduce API calls:

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

async function getCachedPerson(personId: string) {
  const cacheKey = `person:${personId}`;
  let person = cache.get(cacheKey);
  
  if (!person) {
    person = await bccCoreApi.getPerson(personId);
    cache.set(cacheKey, person);
  }
  
  return person;
}
```

## Best Practices

1. **Link Users to Persons**: Always set `personId` when creating users from Auth0
2. **Sync on Login**: Sync affiliations and relationships when user logs in
3. **Cache Responses**: Cache SDK responses to reduce API calls
4. **Handle Errors Gracefully**: SDK calls may fail - handle gracefully
5. **Background Sync**: Consider background jobs to sync relationships periodically
6. **Rate Limiting**: Be mindful of SDK rate limits

## Migration Strategy

For existing users without `personId`:

1. Match by email address
2. Match by name (less reliable)
3. Create person in SDK if not found
4. Link user to person

## Notes

- The SDK handles OAuth2 authentication automatically
- Person IDs are stable identifiers
- Relations are bidirectional (parent-child relationship exists on both sides)
- Affiliations may change - sync periodically
