# Contributing to Sol Horse

Thank you for your interest in contributing to Sol Horse! This document provides guidelines and information for contributors to help maintain code quality and project consistency.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity. We expect all participants to adhere to our community standards.

### Expected Behavior

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment**: Set up according to [DEVELOPMENT_SETUP.md](docs/DEVELOPMENT_SETUP.md)
2. **GitHub Account**: For submitting pull requests and issues
3. **Solana Wallet**: For testing blockchain functionality
4. **Basic Knowledge**: Familiarity with React, TypeScript, and Solana development

### First-Time Contributors

If you're new to the project:

1. **Explore the Codebase**: Familiarize yourself with the project structure
2. **Read Documentation**: Review all documentation in the `docs/` folder
3. **Start Small**: Look for issues labeled `good-first-issue` or `help-wanted`
4. **Ask Questions**: Don't hesitate to ask for clarification in issues or discussions

## Development Process

### Workflow Overview

1. **Fork the Repository**: Create your own fork of the project
2. **Create Feature Branch**: Branch from `develop` for new features
3. **Develop and Test**: Implement changes with appropriate testing
4. **Submit Pull Request**: Create PR against the `develop` branch
5. **Code Review**: Address feedback and iterate as needed
6. **Merge**: Approved changes are merged by maintainers

### Branch Strategy

- `main`: Production-ready code, protected branch
- `develop`: Integration branch for features, default target for PRs
- `feature/*`: Feature development branches
- `hotfix/*`: Emergency fixes for production issues
- `release/*`: Release preparation branches

### Commit Guidelines

#### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

#### Examples

```
feat(racing): add tournament betting system

Implement betting functionality for tournament races with
support for multiple bet types and odds calculation.

Closes #123
```

```
fix(wallet): resolve connection timeout issue

Fix wallet adapter timeout when connecting to Phantom wallet
on slower network connections.

Fixes #456
```

## Coding Standards

### TypeScript Guidelines

#### Type Safety
- Use strict TypeScript configuration
- Avoid `any` type; use proper type definitions
- Implement interfaces for all component props
- Use union types for constrained values

```typescript
// Good
interface HorseProps {
  horse: HorseNFT;
  onSelect: (horseId: string) => void;
  isSelected: boolean;
}

// Avoid
interface HorseProps {
  horse: any;
  onSelect: any;
  isSelected: any;
}
```

#### Naming Conventions
- **Components**: PascalCase (`HorseCard`, `RaceTrack`)
- **Functions**: camelCase (`calculateRaceTime`, `updateHorseStats`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HORSE_COUNT`, `DEFAULT_RACE_DISTANCE`)
- **Interfaces**: PascalCase with descriptive names (`HorseNFT`, `RaceResult`)

### React Best Practices

#### Component Structure
```tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types and interfaces
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// Component implementation
const MyComponent: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Hooks
  const [isLoading, setIsLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Event handlers
  const handleClick = () => {
    setIsLoading(true);
    onAction();
  };
  
  // Render
  return (
    <motion.div
      className="component-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>{title}</h2>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Action'}
      </button>
    </motion.div>
  );
};

export default MyComponent;
```

#### Hooks Usage
- Use custom hooks for reusable logic
- Keep hooks focused on single responsibilities
- Implement proper cleanup in useEffect
- Use useMemo and useCallback for performance optimization

### CSS and Styling

#### Tailwind CSS Guidelines
- Use utility classes for styling
- Create custom components for repeated patterns
- Maintain responsive design principles
- Follow consistent spacing and color schemes

```tsx
// Good: Utility classes with responsive design
<div className="p-4 bg-gray-800 rounded-lg md:p-6 lg:p-8">
  <h2 className="text-xl font-bold text-white md:text-2xl">Title</h2>
</div>

// Avoid: Inline styles
<div style={{ padding: '16px', backgroundColor: '#1f2937' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Title</h2>
</div>
```

#### Component Styling
- Use consistent class naming patterns
- Implement dark theme support
- Ensure accessibility compliance
- Test on multiple screen sizes

### Solana Integration

#### Wallet Handling
```typescript
// Good: Proper error handling
const connectWallet = async () => {
  try {
    await connect();
    setWalletConnected(true);
  } catch (error) {
    console.error('Wallet connection failed:', error);
    setError('Failed to connect wallet. Please try again.');
  }
};

// Good: Transaction handling
const sendTransaction = async (transaction: Transaction) => {
  if (!publicKey || !signTransaction) {
    throw new Error('Wallet not connected');
  }
  
  try {
    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
```

#### Best Practices
- Always handle wallet connection states
- Implement proper error handling for blockchain operations
- Use appropriate network (devnet for development, mainnet for production)
- Validate transaction parameters before sending

## Testing

### Testing Requirements

All contributions should include appropriate tests:

#### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Cover edge cases and error conditions
- Maintain high test coverage

#### Integration Tests
- Test component interactions
- Verify wallet integration
- Test state management flows
- Validate API integrations

#### Example Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HorseCard from './HorseCard';

describe('HorseCard', () => {
  const mockHorse = {
    id: 'test-horse',
    name: 'Test Horse',
    genetics: { speed: 80, stamina: 75 }
  };

  it('displays horse information correctly', () => {
    render(<HorseCard horse={mockHorse} onSelect={vi.fn()} />);
    
    expect(screen.getByText('Test Horse')).toBeInTheDocument();
    expect(screen.getByText('Speed: 80')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<HorseCard horse={mockHorse} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('test-horse');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test HorseCard.test.tsx
```

## Submitting Changes

### Pull Request Process

1. **Update Documentation**: Ensure all relevant documentation is updated
2. **Add Tests**: Include tests for new functionality
3. **Update Changelog**: Add entry to CHANGELOG.md if applicable
4. **Check CI**: Ensure all automated checks pass
5. **Request Review**: Assign appropriate reviewers

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No new warnings or errors
```

### Review Process

#### For Contributors
- Respond to feedback promptly
- Make requested changes in separate commits
- Keep discussions focused and professional
- Update PR description if scope changes

#### For Reviewers
- Provide constructive feedback
- Focus on code quality and project standards
- Test functionality when possible
- Approve when standards are met

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Environment Information**
   - Browser and version
   - Operating system
   - Wallet type and version
   - Network (devnet/mainnet)

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots or videos if helpful

3. **Additional Context**
   - Console errors or logs
   - Network requests (if relevant)
   - Wallet transaction details

### Feature Requests

For new features, provide:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives Considered**: Other approaches evaluated
4. **Additional Context**: Mockups, examples, or references

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `good-first-issue`: Good for newcomers
- `help-wanted`: Extra attention needed
- `priority-high`: Critical issues
- `priority-low`: Nice-to-have improvements

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community chat
- **Discord**: Real-time development discussions (link in README)
- **Twitter**: Project updates and announcements

### Getting Help

If you need assistance:

1. **Check Documentation**: Review existing docs and guides
2. **Search Issues**: Look for similar problems or questions
3. **Ask in Discussions**: Post in GitHub Discussions for help
4. **Join Discord**: Get real-time help from the community

### Recognition

We appreciate all contributions! Contributors will be:

- Listed in the project's contributors section
- Mentioned in release notes for significant contributions
- Invited to join the core contributor team for ongoing involvement

## License

By contributing to Sol Horse, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Sol Horse! Your efforts help make this project better for everyone in the community.

