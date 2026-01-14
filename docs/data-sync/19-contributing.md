# Contributing

Thank you for contributing to `@bcc-events/data-sync`!

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/happenings.git
   cd happenings
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Build the package:
   ```bash
   cd data-sync
   pnpm build
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following the project's style
- Add tests for new features
- Update documentation

### 3. Test Your Changes

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### 4. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new sync feature"
git commit -m "fix: resolve storage issue"
git commit -m "docs: update API documentation"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for public APIs
- Document complex logic with comments

### Naming Conventions

- Files: `kebab-case.ts`
- Functions: `camelCase()`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Code Formatting

- Use 2 spaces for indentation
- Use semicolons
- Trailing commas in multi-line structures
- Single quotes for strings

## Testing

### Writing Tests

- Write tests for all new features
- Test edge cases and error conditions
- Keep tests fast and isolated
- Use descriptive test names

### Test Structure

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something', () => {
      // Test implementation
    });
  });
});
```

## Documentation

### Updating Documentation

- Update relevant docs when adding features
- Add examples for new APIs
- Keep documentation in sync with code
- Use clear, concise language

### Documentation Files

- `README.md` - Package overview
- `INTEGRATION.md` - Integration guide
- `docs/` - Detailed documentation

## Pull Request Guidelines

### PR Checklist

- [ ] Code follows project style
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Commit messages follow conventions

### PR Description

Include:
- What changes were made
- Why the changes were needed
- How to test the changes
- Any breaking changes

## Issue Reporting

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (browser, OS, version)
- Error messages/logs

### Feature Requests

Include:
- Description of the feature
- Use case
- Proposed solution
- Alternatives considered

## Code Review

### Review Process

1. Maintainers review PRs
2. Address feedback
3. Once approved, PR is merged

### Review Guidelines

- Be respectful and constructive
- Focus on code, not person
- Explain reasoning
- Suggest improvements

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

- Open an issue for questions
- Check existing documentation
- Ask in discussions

Thank you for contributing! 🎉
