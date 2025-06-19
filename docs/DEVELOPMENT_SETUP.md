# Development Setup Guide

## Prerequisites

Before setting up the Sol Horse development environment, ensure you have the following tools installed:

### Required Software

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Package Manager**
   - npm (comes with Node.js) or yarn
   - Verify npm: `npm --version`
   - Or install yarn: `npm install -g yarn`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

4. **Code Editor**
   - Recommended: Visual Studio Code
   - Install TypeScript and React extensions

### Solana Development Tools

1. **Solana CLI** (optional, for advanced development)
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
   ```

2. **Solana Wallet**
   - Install Phantom, Solflare, or another supported wallet
   - Create a wallet and fund it with devnet SOL for testing

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ereezyy/Sol_Horse.git
cd Sol_Horse
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Solana Network Configuration
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Application Configuration
VITE_APP_NAME=Sol Horse
VITE_APP_VERSION=1.0.0

# Development Settings
VITE_DEBUG_MODE=true
VITE_ENABLE_LOGGING=true
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development Workflow

### Code Structure

The project follows a modular architecture:

```
src/
├── components/     # Reusable UI components
├── services/       # API and blockchain services
├── store/          # State management (Zustand)
├── types/          # TypeScript definitions
├── utils/          # Utility functions
└── hooks/          # Custom React hooks
```

### Component Development

When creating new components:

1. Use TypeScript for all components
2. Follow the existing naming conventions
3. Include proper prop types and interfaces
4. Add JSDoc comments for complex components
5. Implement responsive design with Tailwind CSS

Example component structure:
```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

/**
 * Description of what the component does
 */
const MyComponent: React.FC<ComponentProps> = ({ title, onAction }) => {
  return (
    <motion.div
      className="p-4 bg-gray-800 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button onClick={onAction} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Action
      </button>
    </motion.div>
  );
};

export default MyComponent;
```

### State Management

The application uses Zustand for state management. Store files are located in `src/store/`:

```tsx
import { create } from 'zustand';

interface GameState {
  horses: HorseNFT[];
  currentRace: Race | null;
  setHorses: (horses: HorseNFT[]) => void;
  setCurrentRace: (race: Race | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  horses: [],
  currentRace: null,
  setHorses: (horses) => set({ horses }),
  setCurrentRace: (race) => set({ currentRace: race }),
}));
```

### Solana Integration

For blockchain interactions:

1. Use the Wallet Adapter for wallet connections
2. Implement proper error handling for blockchain operations
3. Test on devnet before mainnet deployment
4. Handle transaction confirmations appropriately

Example wallet integration:
```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

const MyWalletComponent = () => {
  const { publicKey, connected, connect } = useWallet();
  
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };
  
  return (
    <div>
      {connected ? (
        <p>Connected: {publicKey?.toString()}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
};
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Create test files alongside components with `.test.tsx` extension:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" onAction={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Building for Production

### Build Process

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Checklist

Before deploying to production:

- [ ] Update environment variables for mainnet
- [ ] Test all wallet connections
- [ ] Verify all blockchain interactions
- [ ] Check responsive design on multiple devices
- [ ] Run full test suite
- [ ] Optimize bundle size
- [ ] Enable error tracking
- [ ] Set up monitoring

### Environment Variables for Production

```env
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_DEBUG_MODE=false
VITE_ENABLE_LOGGING=false
```

## Debugging

### Common Issues

1. **Wallet Connection Failures**
   - Check if wallet extension is installed
   - Verify network configuration
   - Clear browser cache and cookies

2. **Build Errors**
   - Delete `node_modules` and reinstall
   - Check TypeScript errors
   - Verify all imports are correct

3. **Blockchain Transaction Failures**
   - Check wallet balance
   - Verify network connection
   - Confirm transaction parameters

### Development Tools

1. **Browser DevTools**
   - Use React Developer Tools extension
   - Monitor network requests
   - Check console for errors

2. **Solana Explorer**
   - View transactions on explorer.solana.com
   - Debug failed transactions
   - Monitor account states

3. **Wallet Developer Mode**
   - Enable developer mode in wallet settings
   - Access detailed transaction logs
   - Test with devnet tokens

## Code Quality

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### TypeScript Configuration

The project uses strict TypeScript settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze
```

### Optimization Techniques

1. **Code Splitting**
   - Use React.lazy for route-based splitting
   - Implement component-level lazy loading

2. **Asset Optimization**
   - Compress images and videos
   - Use WebP format for images
   - Implement lazy loading for media

3. **Caching Strategies**
   - Implement service worker caching
   - Use React Query for API caching
   - Cache blockchain data appropriately

## Contributing Guidelines

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation if needed
4. Submit pull request to `develop`
5. Code review and approval
6. Merge to `develop`

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: feat, fix, docs, style, refactor, test, chore

Example:
```
feat(racing): add tournament betting system

Implement betting functionality for tournament races
with support for multiple bet types and odds calculation.

Closes #123
```

## Troubleshooting

### Common Development Issues

1. **Module Resolution Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript Errors**
   ```bash
   # Restart TypeScript server in VS Code
   Ctrl+Shift+P -> "TypeScript: Restart TS Server"
   ```

3. **Vite Dev Server Issues**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run dev
   ```

### Getting Help

- Check the [GitHub Issues](https://github.com/ereezyy/Sol_Horse/issues)
- Join the development Discord server
- Review the [Solana documentation](https://docs.solana.com/)
- Consult the [React documentation](https://react.dev/)

---

This development setup guide should get you up and running with Sol Horse development. For additional help, please refer to the project documentation or reach out to the development team.

