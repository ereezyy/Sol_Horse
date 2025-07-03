// Core game types for Equus Ascendant: Solana Derby

export interface HorseNFT {
  id: string;
  tokenId: string;
  name: string;
  
  // On-chain genetic traits (immutable NFT metadata)
  genetics: {
    baseSpeed: number; // 1-100
    stamina: number; // 1-100
    agility: number; // 1-100
    temperament: number; // 1-100
    intelligence: number; // 1-100
    coatColor: string;
    markings: string[];
    bloodline: 'Arabian' | 'Thoroughbred' | 'Quarter Horse' | 'Mustang' | 'Legendary';
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    generation: number;
  };
  
  // Dynamic off-chain data
  stats: {
    age: number; // in months
    fitness: number; // 1-100, affected by training
    experience: number;
    wins: number;
    races: number;
    earnings: number; // in $TURF
    retirementAge: number;
  };
  
  // Breeding data
  breeding: {
    canBreed: boolean;
    breedingCooldown: number; // timestamp
    offspring: string[]; // horse IDs
    studFee?: number; // for male horses
    isPublicStud: boolean;
  };
  
  // Training data
  training: {
    currentProgram?: TrainingProgram;
    completedSessions: TrainingSession[];
    specializations: string[];
  };
  
  // Visual and lore
  appearance: {
    model3D: string; // 3D model reference
    animations: string[];
    accessories: string[];
  };
  
  lore: {
    backstory: string;
    personality: string;
    quirks: string[];
    achievements: string[];
  };
  
  // Ownership
  owner: string; // wallet address
  isForSale: boolean;
  price?: number;
  isForLease: boolean;
  leaseTerms?: LeaseTerms;
}

export interface TrainingProgram {
  id: string;
  name: string;
  type: 'Speed' | 'Stamina' | 'Agility' | 'Temperament' | 'Intelligence';
  duration: number; // in hours
  cost: number; // in $TURF
  requirements: {
    facilityLevel: number;
    horseAge: { min: number; max: number };
  };
  effects: {
    statBoosts: Record<string, number>;
    successRate: number;
    fatigueIncrease: number;
  };
}

export interface TrainingSession {
  id: string;
  programId: string;
  startTime: number;
  endTime: number;
  success: boolean;
  results: {
    statChanges: Record<string, number>;
    experienceGained: number;
  };
}

export interface Race {
  id: string;
  name: string;
  type: 'Sprint' | 'Middle Distance' | 'Long Distance' | 'Endurance';
  surface: 'Dirt' | 'Turf' | 'Synthetic';
  distance: number; // in meters
  tier: 'Novice' | 'Amateur' | 'Professional' | 'Championship' | 'Legendary';
  
  // Race conditions
  conditions: {
    weather: 'Clear' | 'Cloudy' | 'Rainy' | 'Windy' | 'Stormy' | 'Snowy' | 'Drizzle';
    temperature: number;
    trackCondition: 'Fast' | 'Good' | 'Soft' | 'Heavy' | 'Frozen' | 'Muddy';
  };
  
  // Entry requirements
  requirements: {
    minAge: number;
    maxAge: number;
    minExperience: number;
    bloodlineRestrictions?: string[];
  };
  
  // Economics
  entryFee: number; // in $TURF
  prizePool: number; // in $TURF
  prizeDistribution: number[]; // percentages for 1st, 2nd, 3rd, etc.
  
  // Participants
  participants: RaceEntry[];
  maxParticipants: number;
  
  // Timing
  registrationDeadline: number;
  raceTime: number;
  
  // Results
  results?: RaceResult[];
  status: 'Registration' | 'Closed' | 'Running' | 'Finished';
}

export interface RaceEntry {
  horseId: string;
  ownerId: string;
  jockeyId?: string;
  odds: number;
  betAmount: number; // total bet on this horse
}

export interface RaceResult {
  position: number;
  horseId: string;
  time: number;
  earnings: number;
  experienceGained: number;
}

export interface Bet {
  id: string;
  playerId: string;
  raceId: string;
  horseId: string;
  type: 'Win' | 'Place' | 'Show' | 'Exacta' | 'Trifecta';
  amount: number; // in $TURF
  odds: number;
  potentialPayout: number;
  status: 'Active' | 'Won' | 'Lost';
}

export interface Player {
  id: string;
  walletAddress: string;
  username: string;
  
  // Profile
  profile: {
    avatar: string;
    bio: string;
    joinDate: number;
    country: string;
    stableName: string;
  };
  
  // Assets
  assets: {
    turfBalance: number; // $TURF tokens
    solBalance: number; // SOL balance
    horses: string[]; // horse IDs
    facilities: Facility[];
  };
  
  // Statistics
  stats: {
    totalRaces: number;
    wins: number;
    winRate: number;
    totalEarnings: number;
    totalSpent: number;
    netProfit: number;
    reputation: number;
    achievements: Achievement[];
    lastCheckIn: number | null;
    consecutiveCheckIns: number;
  };
  
  // Social
  social: {
    guildId?: string;
    friends: string[];
    followers: number;
    following: number;
  };
  
  // Preferences
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    allowBreedingRequests: boolean;
    dailyCheckInReminder: boolean;
  };
}

export interface Facility {
  id: string;
  type: 'Stable' | 'Training Ground' | 'Medical Center' | 'Breeding Facility';
  level: number;
  capacity: number;
  upgradeCost: number;
  benefits: {
    trainingEfficiency: number;
    recoverySpeed: number;
    breedingSuccessRate: number;
  };
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  founderId: string;
  members: GuildMember[];
  
  // Guild stats
  stats: {
    totalWins: number;
    totalEarnings: number;
    reputation: number;
    level: number;
  };
  
  // Guild features
  features: {
    sharedFacilities: boolean;
    groupTraining: boolean;
    tournamentTeams: boolean;
  };
  
  // Requirements
  requirements: {
    minReputation: number;
    applicationRequired: boolean;
  };
}

export interface GuildMember {
  playerId: string;
  role: 'Member' | 'Officer' | 'Leader';
  joinDate: number;
  contribution: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt: number;
  rewards: {
    turfTokens?: number;
    nftReward?: string;
    title?: string;
  };
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'Single Elimination' | 'Round Robin' | 'Swiss System';
  
  // Entry requirements
  requirements: {
    entryFee: number;
    minHorseLevel: number;
    maxParticipants: number;
    minReputation?: number;
    maxReputation?: number;
    guildOnly?: boolean;
  };
  
  // Prize structure
  prizePool: number;
  prizeDistribution: Record<string, number>; // position -> percentage
  
  // Timing
  registrationStart: number;
  registrationEnd: number;
  tournamentStart: number;
  tournamentEnd: number;
  
  // Participants
  participants: TournamentEntry[];
  brackets?: TournamentBracket[];
  
  // Status
  status: 'Upcoming' | 'Registration' | 'Active' | 'Completed';
  
  // Additional properties
  category?: string;
  tier?: string;
}

export interface TournamentEntry {
  playerId: string;
  horseId: string;
  playerName: string;
  horseName: string;
  seed: number;
  currentRound: number;
  eliminated: boolean;
}

export interface TournamentBracket {
  round: number;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  participant1: string;
  participant2: string;
  winner?: string;
  raceId?: string;
  scheduledTime: number;
}

export interface MarketplaceListing {
  id: string;
  type: 'Horse' | 'Facility' | 'Cosmetic' | 'Consumable';
  itemId: string;
  sellerId: string;
  
  // Pricing
  price: number; // in $TURF
  currency: 'TURF' | 'SOL';
  negotiable: boolean;
  
  // Listing details
  title: string;
  description: string;
  images: string[];
  listedAt: number;
  expiresAt: number;
  
  // Status
  status: 'Active' | 'Sold' | 'Cancelled' | 'Expired';
  views: number;
  watchers: string[];
}

export interface LeaseTerms {
  duration: number; // in days
  price: number; // in $TURF per day
  restrictions: {
    racingAllowed: boolean;
    breedingAllowed: boolean;
    maxRacesPerWeek: number;
  };
  revenue: {
    ownerShare: number; // percentage
    lesseeShare: number; // percentage
  };
}

// Game state interfaces
export interface GameState {
  player: Player | null;
  horses: HorseNFT[];
  activeRaces: Race[];
  upcomingRaces: Race[];
  marketplaceListings: MarketplaceListing[];
  tournaments: Tournament[];
  guilds: Guild[];
  
  // UI state
  selectedHorse: string | null;
  currentView: 'stable' | 'racing' | 'breeding' | 'marketplace' | 'profile' | 'guild' | 'training' | 'tournaments' | 'quests' | 'achievements' | 'events' | 'analytics' | 'ai-analytics';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'race_result' | 'breeding_complete' | 'training_complete' | 'marketplace_sale' | 'guild_invite' | 'tournament' | 'quest_complete';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

// API response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}