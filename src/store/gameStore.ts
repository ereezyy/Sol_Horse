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
  performDailyCheckIn: () => boolean;
  getCheckInStatus: () => { canClaim: boolean; timeUntilNext: number; streak: number };
  
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
  username: 'Champion Trainer',
  profile: {
    avatar: '',
    bio: 'Elite horse trainer and racing strategist!',
    joinDate: Date.now() - 86400000 * 90, // 90 days ago for more experience
    country: 'Global',
    stableName: 'Elite Racing Stables'
  },
  assets: {
    turfBalance: 100000,       // Increased for better gameplay experience
    solBalance: 25.0,          // More SOL for premium features
    horses: [],
    facilities: [
      {
        id: '1',
        type: 'Stable',
        level: 5,                // Premium starting level
        capacity: 20,            // Large horse capacity
        upgradeCost: 25000,
        benefits: {
          trainingEfficiency: 1.5,  // Excellent training efficiency
          recoverySpeed: 1.4,       // Fast recovery
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
    totalRaces: 45,            // More racing experience
    wins: 18,                  // Better win record
    winRate: 0.40,             // 40% win rate - very good
    totalEarnings: 125000,     // Substantial earnings
    totalSpent: 75000,         // Smart spending
    netProfit: 50000,          // Profitable operation
    reputation: 350,           // High reputation
    lastCheckIn: null,         // No check-in yet
    consecutiveCheckIns: 0,    // Start with no streak
    achievements: [
      {
        id: '1',
        name: 'First Victory',
        description: 'Won your first race',
        icon: 'trophy',
        rarity: 'Common',
        unlockedAt: Date.now() - 86400000 * 80,
        rewards: { turfTokens: 1000, title: 'Winner' }
      },
      {
        id: '2', 
        name: 'Stable Master',
        description: 'Owned 10 horses',
        icon: 'home',
        rarity: 'Uncommon',
        unlockedAt: Date.now() - 86400000 * 60,
        rewards: { turfTokens: 2500 }
      },
      {
        id: '3',
        name: 'Champion Trainer',
        description: 'Achieved 40% win rate',
        icon: 'star',
        rarity: 'Rare',
        unlockedAt: Date.now() - 86400000 * 30,
        rewards: { turfTokens: 5000, title: 'Champion' }
      },
      {
        id: '4',
        name: 'Elite Breeder',
        description: 'Successfully bred 5 horses',
        icon: 'heart',
        rarity: 'Epic',
        unlockedAt: Date.now() - 86400000 * 15,
        rewards: { turfTokens: 10000, title: 'Elite Breeder' }
      }
    ]
  },
  social: {
    friends: [],
    followers: 45,            // More followers for successful trainer
    following: 25
  },
  preferences: {
    notifications: true,
    publicProfile: true,
    allowBreedingRequests: true,
    dailyCheckInReminder: true,
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
  
  performDailyCheckIn: () => {
    const { player, addNotification } = get();
    if (!player) return false;

    const now = Date.now();
    const lastCheckIn = player.stats.lastCheckIn || 0;
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Check if 24 hours have passed since last check-in
    const canClaimReward = !player.stats.lastCheckIn || (now - lastCheckIn > oneDayMs);
    
    if (!canClaimReward) return false;

    // Check if streak continues or resets
    const isStreakContinuing = player.stats.lastCheckIn && (now - lastCheckIn < oneDayMs * 2);
    const newStreak = isStreakContinuing ? player.stats.consecutiveCheckIns + 1 : 1;
    
    // Calculate bonus based on streak
    const streakBonus = Math.min(1000, newStreak * 100); // 100 bonus per day up to 1000
    const totalReward = 1000 + streakBonus;

    // Update player
    set((state) => ({
      player: state.player ? {
        ...state.player,
        stats: {
          ...state.player.stats,
          lastCheckIn: now,
          consecutiveCheckIns: newStreak
        },
        assets: {
          ...state.player.assets,
          turfBalance: state.player.assets.turfBalance + totalReward
        }
      } : null
    }));

    // Add notification
    addNotification({
      id: Date.now().toString(),
      type: 'quest_complete',
      title: 'Daily Check-In Reward!',
      message: `Claimed ${totalReward} $TURF! (${newStreak} day streak: +${streakBonus} bonus)`,
      timestamp: now,
      read: false
    });

    return true;
  },
  
  getCheckInStatus: () => {
    const { player } = get();
    if (!player || !player.stats.lastCheckIn) {
      return { canClaim: true, timeUntilNext: 0, streak: 0 };
    }

    const now = Date.now();
    const lastCheckIn = player.stats.lastCheckIn;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Can claim if 24 hours have passed
    const timeSinceLastCheckIn = now - lastCheckIn;
    const canClaim = timeSinceLastCheckIn > oneDayMs;
    
    // Time until next claim
    const timeUntilNext = Math.max(0, oneDayMs - timeSinceLastCheckIn);
    
    return { 
      canClaim, 
      timeUntilNext,
      streak: player.stats.consecutiveCheckIns 
    };
  },
  
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