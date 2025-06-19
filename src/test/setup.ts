import '@testing-library/jest-dom';

// Mock Solana wallet adapter
const mockWallet = {
  publicKey: null,
  connected: false,
  connecting: false,
  disconnecting: false,
  connect: vi.fn(),
  disconnect: vi.fn(),
  sendTransaction: vi.fn(),
  signTransaction: vi.fn(),
  signAllTransactions: vi.fn(),
  signMessage: vi.fn(),
};

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => mockWallet,
  useConnection: () => ({
    connection: {
      getLatestBlockhash: vi.fn(),
      confirmTransaction: vi.fn(),
      sendRawTransaction: vi.fn(),
    }
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    img: 'img',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock zustand store
vi.mock('../store/gameStore', () => ({
  useGameStore: () => ({
    horses: [],
    currentRace: null,
    player: {
      id: 'test-player',
      username: 'TestPlayer',
      balance: 1000,
      experience: 0,
      level: 1,
    },
    setHorses: vi.fn(),
    setCurrentRace: vi.fn(),
    addNotification: vi.fn(),
  }),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

