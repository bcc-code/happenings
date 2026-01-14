# Contributing Guide

## Development Process

### Before Starting Work

1. Review the relevant requirements document in `requirements/`
2. Check `PROJECT_STATUS.md` for current status
3. Create or update requirements if needed
4. Plan your implementation approach

### Making Changes

1. **Update Requirements First**
   - If adding new features, update the relevant requirements file
   - Document decisions and open questions
   - Get approval if needed

2. **Database Changes**
   - Update Prisma schema
   - Create migration
   - Test migration thoroughly

3. **Code Changes**
   - Follow TypeScript best practices
   - Write clean, maintainable code
   - Add comments for complex logic
   - Follow existing code patterns

4. **Testing**
   - Write tests for new features
   - Test edge cases
   - Test error scenarios

5. **Documentation**
   - Update relevant documentation
   - Add code comments where needed
   - Update API documentation if applicable

## Code Standards

### TypeScript

- Use strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Avoid `any` type - use proper types or `unknown`

### Vue/Nuxt

- Use Composition API
- Use TypeScript for components
- Follow Vue style guide
- Use composables for reusable logic

### Database

- Use Prisma for all database access
- Always include tenant context in queries
- Use transactions for multi-step operations
- Index frequently queried fields

### API

- Use RESTful conventions
- Return consistent response formats
- Handle errors gracefully
- Validate all inputs
- Include tenant context in all operations

## Git Workflow

### Branch Naming

- `feature/module-name` - New features
- `fix/issue-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation updates

### Commit Messages

Use conventional commits:
- `feat: add user registration endpoint`
- `fix: resolve tenant context issue`
- `docs: update API documentation`
- `refactor: simplify payment processing`

### Pull Requests

- Provide clear description
- Reference requirements documents
- Include testing notes
- Request review from team

## Requirements Updates

When updating requirements:

1. Mark the section with `[Updated: Date]`
2. Add notes about what changed and why
3. Update status if implementation has started
4. Document any decisions made

## Testing Requirements

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing checklist for UI changes

## Security Considerations

- Never commit secrets or credentials
- Validate all user inputs
- Use parameterized queries
- Implement rate limiting
- Follow OWASP guidelines

## Performance Considerations

- Optimize database queries
- Use caching where appropriate
- Minimize API response sizes
- Optimize frontend bundle sizes
- Consider offline-first for end user app

## Questions?

If you're unsure about something:
1. Check the requirements documents
2. Review the architecture documentation
3. Ask the team
4. Document your decision
