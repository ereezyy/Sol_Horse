import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

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
    div: ({ children, ...props }) => React.createElement('div', props, children),
    button: ({ children, ...props }) => React.createElement('button', { type: "button", ...props }, children),
    span: ({ children, ...props }) => React.createElement('span', props, children),
    h1: ({ children, ...props }) => React.createElement('h1', props, children),
    h2: ({ children, ...props }) => React.createElement('h2', props, children),
    h3: ({ children, ...props }) => React.createElement('h3', props, children),
    p: ({ children, ...props }) => React.createElement('p', props, children),
    img: ({ ...props }) => React.createElement('img', props),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimationControls: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useInView: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: vi.fn() } }),
}));

// Mock zustand store
vi.mock('../store/gameStore', () => ({
  useGameStore: () => ({
    horses: [
      {
        id: 'test-horse-1',
        tokenId: 'TOKEN-1001',
        name: 'Thunder Strike',
        genetics: {
          baseSpeed: 85,
          stamina: 78,
          agility: 82,
          temperament: 75,
          intelligence: 80,
          bloodline: 'Arabian',
          coatColor: 'Bay',
          markings: ['Blaze'],
          rarity: 'Rare',
          generation: 1
        },
        stats: {
          age: 24,
          fitness: 85,
          experience: 2400,
          wins: 8,
          races: 15,
          earnings: 25000,
          retirementAge: 120
        },
        breeding: {
          canBreed: true,
          breedingCooldown: Date.now() - 86400000,
          offspring: [],
          studFee: 5000,
          isPublicStud: true
        },
        training: {
          completedSessions: [],
          specializations: ['Speed', 'Endurance']
        },
        appearance: {
          model3D: 'horse-model-1',
          animations: ['idle', 'run'],
          accessories: []
        },
        lore: {
          backstory: 'A magnificent horse with exceptional speed',
          personality: 'Determined and competitive',
          quirks: ['Loves carrots', 'Gets excited before races'],
          achievements: []
        },
        owner: 'test-owner',
        isForSale: false,
        price: 50000
      }
    ],
    player: {
      id: 'test-player',
      username: 'TestPlayer',
      walletAddress: 'test-wallet',
      profile: {
        avatar: '',
        bio: 'Test bio',
        country: 'Test Country',
        joinDate: Date.now() - 86400000,
        stableName: 'Test Stables'
      },
      assets: {
        turfBalance: 10000,
        solBalance: 5,
        horses: ['test-horse-1'],
        facilities: [{ id: '1', type: 'Stable', level: 1, capacity: 5, upgradeCost: 10000, benefits: {} }]
      },
      stats: {
        wins: 10,
        totalRaces: 20,
        experience: 500,
        reputation: 100,
        lastCheckIn: null,
        consecutiveCheckIns: 0,
        achievements: []
      },
      social: { followers: 0 },
    },
    activeRaces: [],
    upcomingRaces: [],
    setHorses: vi.fn(),
    setPlayer: vi.fn(),
    addNotification: vi.fn(),
    updatePlayerBalance: vi.fn(),
    addHorse: vi.fn(),
    updateHorse: vi.fn(),
    setCurrentView: vi.fn(),
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
