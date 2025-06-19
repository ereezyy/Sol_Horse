import { create } from 'zustand';
import { HorseNFT, Player, Race, Bet, GameState, Tournament, TournamentEntry } from '../types';

interface GameStore extends GameState {
  // Actions
  setPlayer: (player: Player) => void;
  addHorse: (horse: HorseNFT) => void;
  updateHorse: (horseId: string, updates: Partial<HorseNFT>) => void;
  selectHorse: (horseId: string | null) => void;
  setCurrentView: (view: GameState['currentView']) => void;
  addRace: (race: Race) => void;
  placeBet: (bet: Bet) => void;
  updatePlayerBalance: (amount: number) => void;
  addNotification: (notification: any) => void;
  markNotificationRead: (notificationId: string) => void;
  
  // Tournament actions
  addTournament: (tournament: Tournament) => void;
  joinTournament: (tournamentId: string, entry: TournamentEntry) => void;
  updateTournament: (tournamentId: string, updates: Partial<Tournament>) => void;
  
  initializeGame: () => void;
}

// Mock player for immediate gameplay
const createMockPlayer = (): Player => ({
  id: 'player-1',
  walletAddress: 'Demo7xK9XjZ2k5...Demo123',
  username: 'DemoPlayer',
  profile: {
    avatar: '',
    bio: 'Demo player exploring the racing world!',
    joinDate: Date.now() - 86400000 * 30, // 30 days ago
    country: 'Global',
    stableName: 'Demo Stables'
  },
  assets: {
    turfBalance: 25000,
    solBalance: 5.5,
    horses: [],
    facilities: [
      {
        id: '1',
        type: 'Stable',
        level: 2,
        capacity: 8,
        upgradeCost: 10000,
        benefits: {
          trainingEfficiency: 1.2,
          recoverySpeed: 1.1,
          breedingSuccessRate: 1.0
        }
      },
      {
        id: '2',
        type: 'Training Ground',
        level: 2,
        capacity: 4,
        upgradeCost: 15000,
        benefits: {
          trainingEfficiency: 1.3,
          recoverySpeed: 1.0,
          breedingSuccessRate: 1.0
        }
      }
    ]
  },
  stats: {
    totalRaces: 25,
    wins: 8,
    winRate: 0.32,
    totalEarnings: 45000,
    totalSpent: 30000,
    netProfit: 15000,
    reputation: 150,
    achievements: [
      {
        id: '1',
        name: 'First Victory',
        description: 'Won your first race',
        icon: 'trophy',
        rarity: 'Common',
        unlockedAt: Date.now() - 86400000 * 20,
        rewards: { turfTokens: 1000, title: 'Winner' }
      },
      {
        id: '2', 
        name: 'Stable Builder',
        description: 'Owned 5 horses',
        icon: 'home',
        rarity: 'Uncommon',
        unlockedAt: Date.now() - 86400000 * 15,
        rewards: { turfTokens: 2500 }
      }
    ]
  },
  social: {
    friends: [],
    followers: 12,
    following: 8
  },
  preferences: {
    notifications: true,
    publicProfile: true,
    allowBreedingRequests: true
  }
});

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  player: null,
  horses: [],
  activeRaces: [],
  upcomingRaces: [],
  marketplaceListings: [],
  tournaments: [],
  guilds: [],
  selectedHorse: null,
  currentView: 'stable',
  notifications: [],

  // Actions
  setPlayer: (player) => set({ player }),
  
  addHorse: (horse) => set((state) => ({
    horses: [...state.horses, horse]
  })),
  
  updateHorse: (horseId, updates) => set((state) => ({
    horses: state.horses.map(horse => 
      horse.id === horseId ? { ...horse, ...updates } : horse
    )
  })),
  
  selectHorse: (horseId) => set({ selectedHorse: horseId }),
  
  setCurrentView: (view) => set({ currentView: view }),
  
  addRace: (race) => set((state) => ({
    upcomingRaces: [...state.upcomingRaces, race]
  })),
  
  placeBet: (bet) => {
    const { player } = get();
    if (player && player.assets.turfBalance >= bet.amount) {
      set((state) => ({
        player: state.player ? {
          ...state.player,
          assets: {
            ...state.player.assets,
            turfBalance: state.player.assets.turfBalance - bet.amount
          }
        } : null
      }));
    }
  },
  
  updatePlayerBalance: (amount) => set((state) => ({
    player: state.player ? {
      ...state.player,
      assets: {
        ...state.player.assets,
        turfBalance: Math.max(0, state.player.assets.turfBalance + amount)
      }
    } : null
  })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications.slice(0, 9)] // Keep last 10
  })),
  
  markNotificationRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    )
  })),

  // Tournament actions
  addTournament: (tournament) => set((state) => ({
    tournaments: [...state.tournaments, tournament]
  })),
  
  joinTournament: (tournamentId, entry) => set((state) => ({
    tournaments: state.tournaments.map(tournament =>
      tournament.id === tournamentId
        ? { ...tournament, participants: [...tournament.participants, entry] }
        : tournament
    )
  })),
  
  updateTournament: (tournamentId, updates) => set((state) => ({
    tournaments: state.tournaments.map(tournament =>
      tournament.id === tournamentId ? { ...tournament, ...updates } : tournament
    )
  })),

  initializeGame: () => {
    const mockPlayer = createMockPlayer();
    set({ player: mockPlayer });
  }
}));