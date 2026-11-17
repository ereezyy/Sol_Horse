import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useGameStore } from './store/gameStore';
import { checkSupabaseConnection } from './services/supabase';
import Navigation from './components/Navigation';
import WalletConnection from './components/WalletConnection';
import HorseCard from './components/HorseCard';
import RaceTrack from './components/RaceTrack';
import BettingPanel from './components/BettingPanel';
import BreedingCenter from './components/BreedingCenter';
import TrainingCenter from './components/TrainingCenter';
import TournamentSystem from './components/TournamentSystem';
import Marketplace from './components/Marketplace';
import GuildSystem from './components/GuildSystem';
import AIAssistant from './components/AIAssistant';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import DailyQuests from './components/DailyQuests';
import AchievementSystem from './components/AchievementSystem';
import SeasonalEvents from './components/SeasonalEvents';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PlayerProfile from './components/PlayerProfile';
import DailyRewards from './components/DailyRewards';
import { HorseNFT, Race } from './types';

// Mock data generator
const generateMockHorses = (): HorseNFT[] => {
  const bloodlines = ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Mustang', 'Legendary'] as const;
  const coatColors = ['Bay', 'Black', 'Chestnut', 'Gray', 'Palomino'];
  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] as const;
  const markings = ['Blaze', 'Star', 'Stripe', 'Socks', 'Stockings', 'None'];
  
  const horseNames = [
    'Thunder Strike', 'Lightning Bolt', 'Storm Chaser', 'Wind Runner', 'Fire Spirit',
    'Midnight Shadow', 'Golden Arrow', 'Silver Bullet', 'Diamond Dust', 'Crimson Flash',
    'Azure Dream', 'Emerald Force', 'Platinum Rush', 'Copper Coin', 'Steel Magnolia',
    'Velvet Thunder', 'Silk Lightning', 'Iron Will', 'Crystal Clear', 'Mystic Moon'
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const baseSpeed = 60 + Math.floor(Math.random() * 35);
    const stamina = 60 + Math.floor(Math.random() * 35);
    const agility = 60 + Math.floor(Math.random() * 35);
    const temperament = 60 + Math.floor(Math.random() * 35);
    const intelligence = 60 + Math.floor(Math.random() * 35);
    
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const races = Math.floor(Math.random() * 50);
    const wins = Math.floor(races * (0.1 + Math.random() * 0.4));
    
    return {
      id: `horse-${i + 1}`,
      tokenId: `TOKEN-${1000 + i}`,
      name: horseNames[i],
      genetics: {
        baseSpeed,
        stamina,
        agility,
        temperament,
        intelligence,
        coatColor: coatColors[Math.floor(Math.random() * coatColors.length)],
        markings: [markings[Math.floor(Math.random() * markings.length)]],
        bloodline: bloodlines[Math.floor(Math.random() * bloodlines.length)],
        rarity,
        generation: 1 + Math.floor(Math.random() * 5)
      },
      stats: {
        age: 24 + Math.floor(Math.random() * 60), // 2-7 years
        fitness: 80 + Math.floor(Math.random() * 20),
        experience: races * 15 + Math.floor(Math.random() * 500), // More varied experience
        wins,
        races,
        earnings: wins * (2000 + Math.random() * 8000), // Higher earnings potential
        retirementAge: 96 + Math.floor(Math.random() * 24) // 8-10 years
      },
      breeding: {
        canBreed: Math.random() > 0.2, // More horses available for breeding
        breedingCooldown: Date.now() - Math.floor(Math.random() * 2000000), // Longer cooldown variation
        offspring: [],
        studFee: rarity === 'Legendary' ? 50000 : 
                 rarity === 'Epic' ? 25000 : 
                 rarity === 'Rare' ? 15000 : 
                 rarity === 'Uncommon' ? 8000 : 3000, // More realistic pricing tiers
        isPublicStud: Math.random() > 0.4 // More public studs available
      },
      training: {
        completedSessions: [],
        specializations: []
      },
      appearance: {
        model3D: `horse-model-${i + 1}`,
        animations: ['idle', 'run', 'gallop'],
        accessories: []
      },
      lore: {
        backstory: `A ${rarity.toLowerCase()} ${coatColors[Math.floor(Math.random() * coatColors.length)].toLowerCase()} horse with exceptional racing potential. Born from the ${bloodlines[Math.floor(Math.random() * bloodlines.length)]} bloodline, this horse shows remarkable promise on the track.`,
        personality: ['Determined and competitive', 'Calm and focused', 'Energetic and spirited', 'Intelligent and strategic', 'Bold and fearless'][Math.floor(Math.random() * 5)],
        quirks: [
          ['Loves carrots', 'Gets excited before races'],
          ['Prefers morning training', 'Enjoys being groomed'],
          ['Responds well to music', 'Has a favorite stable mate'],
          ['Loves rainy weather', 'Always hungry after races'],
          ['Enjoys crowd cheers', 'Sleeps standing up']
        ][Math.floor(Math.random() * 5)],
        achievements: wins > 15 ? ['Champion racer', 'Multiple stakes winner'] : 
                     wins > 8 ? ['Consistent performer', 'Stakes winner'] :
                     wins > 3 ? ['Promising newcomer'] : []
      },
      owner: Math.random() > 0.6 ? 'current-player' : `owner-${Math.floor(Math.random() * 10)}`, // More player-owned horses
      isForSale: Math.random() > 0.75, // More horses available for purchase
      price: Math.random() > 0.75 ? 
        (rarity === 'Legendary' ? 80000 + Math.floor(Math.random() * 120000) :
         rarity === 'Epic' ? 40000 + Math.floor(Math.random() * 60000) :
         rarity === 'Rare' ? 20000 + Math.floor(Math.random() * 30000) :
         rarity === 'Uncommon' ? 10000 + Math.floor(Math.random() * 15000) :
         5000 + Math.floor(Math.random() * 10000)) : undefined, // Rarity-based pricing
      isForLease: Math.random() > 0.85,
      leaseTerms: Math.random() > 0.85 ? {
        duration: 7 + Math.floor(Math.random() * 21),
        price: 1000 + Math.floor(Math.random() * 4000),
        restrictions: {
          racingAllowed: true,
          breedingAllowed: false,
          maxRacesPerWeek: 3
        },
        revenue: {
          ownerShare: 20,
          lesseeShare: 80
        }
      } : undefined
    };
  });
};

const generateMockRaces = (): Race[] => {
  const raceNames = [
    'Thunder Valley Sprint', 'Lightning Derby', 'Storm Peak Classic', 'Wind Ridge Stakes',
    'Fire Mountain Cup', 'Midnight Express', 'Golden Gate Gallop', 'Silver Creek Derby',
    'Eclipse Championship', 'Royal Ascot Stakes', 'Kentucky Thunder', 'Dubai Gold Cup'
  ];
  
  const surfaces = ['Dirt', 'Turf', 'Synthetic'] as const;
  const distances = [1200, 1400, 1600, 2000, 2400, 3200];
  const weathers = ['Clear', 'Cloudy', 'Rainy', 'Windy'] as const;
  const trackConditions = ['Fast', 'Good', 'Soft', 'Heavy'] as const;
  const tiers = ['Novice', 'Amateur', 'Professional', 'Championship', 'Legendary'] as const;
  const prizeByTier: Record<(typeof tiers)[number], number> = {
    Novice: 25000,
    Amateur: 50000,
    Professional: 100000,
    Championship: 250000,
    Legendary: 500000
  };
  const experienceByTier: Record<(typeof tiers)[number], number> = {
    Novice: 0,
    Amateur: 100,
    Professional: 200,
    Championship: 500,
    Legendary: 1000
  };
  
  return Array.from({ length: 8 }, (_, i) => {
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const basePrize = prizeByTier[tier];
    const raceType: Race['type'] = i < 3 ? 'Sprint' : i < 6 ? 'Middle Distance' : 'Long Distance';
    
    return {
      id: `race-${i + 1}`,
      name: raceNames[i] || `Race ${i + 1}`,
      type: raceType,
      surface: surfaces[Math.floor(Math.random() * surfaces.length)],
      distance: distances[Math.floor(Math.random() * distances.length)],
      tier,
      conditions: {
        weather: weathers[Math.floor(Math.random() * weathers.length)],
        temperature: 15 + Math.floor(Math.random() * 20),
        trackCondition: trackConditions[Math.floor(Math.random() * trackConditions.length)]
      },
      requirements: {
        minAge: 24,
        maxAge: tier === 'Championship' || tier === 'Legendary' ? 60 : 84,
        minExperience: experienceByTier[tier]
      },
      entryFee: Math.floor(basePrize * 0.02) + Math.floor(Math.random() * Math.floor(basePrize * 0.03)), // 2-5% of prize
      prizePool: basePrize + Math.floor(Math.random() * basePrize * 0.5), // Up to 50% variation
      prizeDistribution: [50, 25, 15, 10], // Winner gets 50%, etc.
      participants: [],
      maxParticipants: tier === 'Championship' || tier === 'Legendary' ? 12 :
                      tier === 'Professional' ? 10 : 8,
      registrationDeadline: Date.now() + (24 + Math.floor(Math.random() * 48)) * 3600000, // 1-3 days
      raceTime: Date.now() + (48 + Math.floor(Math.random() * 120)) * 3600000, // 2-7 days
      status: 'Registration' as const
    };
  });
};

function App() {
  const {
    player,
    setPlayer,
    horses,
    currentView,
    upcomingRaces,
    addHorse,
    addRace,
    addNotification,
    initializeGame
  } = useGameStore();

  // Initialize daily check-in reminder
  useEffect(() => {
    const lastCheckIn = player?.stats?.lastCheckIn;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // If player hasn't checked in today and has preferences for reminders
    if (player && player.preferences.dailyCheckInReminder && (!lastCheckIn || now - lastCheckIn > oneDayMs)) {
      addNotification({
        id: `daily-checkin-${Date.now()}`,
        type: 'quest_complete',
        title: 'Daily Check-In Available!',
        message: 'Don\'t forget to claim your daily rewards and maintain your streak!',
        timestamp: Date.now(),
        read: false
      });
    }
  }, [player, addNotification]);

  // Check Supabase connection
  useEffect(() => {
    const initializeApplication = async () => {
      try {
        console.info('Initializing application and checking Supabase connection...');
        const connectionResult = await checkSupabaseConnection();
        
        if (!connectionResult.success) {
          console.info('Using local data mode:', connectionResult.message);
          
          // Add notification about using local data mode with more detailed message
          addNotification({
            id: `supabase-mode-${Date.now()}`,
            type: 'quest_complete',
            title: 'Using Local Data Mode',
            message: connectionResult.isConfigError ? 
              'Supabase credentials not configured. Game is running with local data - progress will not be saved.' :
              `Database connection error: ${connectionResult.error || 'Unknown error'}. Using local data mode.`,
            timestamp: Date.now(),
            read: false
          });
        } else {
          console.info('Supabase connection successful');
          addNotification({
            id: `supabase-mode-${Date.now()}`,
            type: 'quest_complete',
            title: 'Cloud Sync Active',
            message: 'Connected to Supabase. Your progress will be saved to the cloud.',
            timestamp: Date.now(),
            read: false
          });
        }
        
        // Initialize game data
        await initializeGame();
      } catch (error) {
        console.error('Error initializing application:', error instanceof Error ? error.message : error);
        // Add notification about initialization issue
        addNotification({
          id: `init-error-${Date.now()}`,
          type: 'quest_complete',
          title: 'Initialization Error',
          message: 'There was a problem starting the game. Some features may be unavailable.',
          timestamp: Date.now(),
          read: false
        });
      }
    };

    initializeApplication();
  }, [addNotification, initializeGame]);

  // Initialize mock data once. React StrictMode runs this effect twice in development.
  useEffect(() => {
    const state = useGameStore.getState();
    if (state.horses.length > 0 || state.upcomingRaces.length > 0) return;

    generateMockHorses().forEach(horse => addHorse(horse));
    generateMockRaces().forEach(race => addRace(race));
  }, [addHorse, addRace]);

  // If no wallet connected, show wallet connection
  const needsConnection = !player;
  
  if (needsConnection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <WalletConnection />
      </div>
    );
  }

  const playerHorses = horses.filter(horse => horse.owner === player.walletAddress || horse.owner === 'current-player');
  
  const renderCurrentView = () => {
    switch (currentView) {
      case 'stable':
        return <StableView horses={playerHorses} />;
      case 'training':
        return <TrainingCenter />;
      case 'racing':
        return <RacingView races={upcomingRaces} horses={horses} />;
      case 'breeding':
        return <BreedingCenter />;
      case 'tournaments':
        return <TournamentSystem 
          playerHorses={playerHorses} 
          onEnterTournament={(tournamentId, horseId) => {
            console.log(`Entering tournament ${tournamentId} with horse ${horseId}`);
            // Add tournament entry logic here
          }} 
        />;
      case 'quests':
        return <DailyQuests />;
      case 'achievements':
        return <AchievementSystem />;
      case 'events':
        return <SeasonalEvents />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'rewards':
        return <DailyRewards />;
      case 'marketplace':
        return <Marketplace />;
      case 'profile':
        return <PlayerProfile />;
      case 'guild':
        return <GuildSystem />;
      case 'ai-analytics':
        return <PredictiveAnalytics />;
      default:
        return <StableView horses={playerHorses} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        {player?.walletAddress?.startsWith('guest_') && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h2 className="font-semibold text-yellow-800 mb-1">Playing as Guest</h2>
                <p className="text-sm text-yellow-700 mb-2">Your progress won't be saved when you leave. Connect a wallet to keep your progress.</p>
                <button
                  className="text-sm px-4 py-2 bg-white border border-yellow-400 rounded-lg hover:bg-yellow-50 text-yellow-700 transition-colors"
                  onClick={() => setPlayer(null)}
                >
                  Connect Wallet Now
                </button>
              </div>
            </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
        
        {/* AI Assistant - Always Available */}
        <AIAssistant />
      </main>
    </div>
  );
}

// Stable View Component
const StableView: React.FC<{ horses: HorseNFT[] }> = ({ horses }) => {
  const { player } = useGameStore();
  
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {player?.username}! 🏇
            </h1>
            <p className="text-gray-600">
              Manage your stable of {horses.length} magnificent horses
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {player?.assets.turfBalance.toLocaleString()} $TURF
              </p>
              <p className="text-sm text-gray-600">Available Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🐎</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{horses.length}</p>
              <p className="text-sm text-gray-600">Total Horses</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{player?.stats.wins}</p>
              <p className="text-sm text-gray-600">Total Wins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {((player?.stats.totalEarnings || 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{player?.stats.reputation}</p>
              <p className="text-sm text-gray-600">Reputation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horse Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Horses</h2>
          <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors">
            Buy New Horse
          </button>
        </div>
        
        {horses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horses.map((horse) => (
              <HorseCard key={horse.id} horse={horse} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🐎</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Horses Yet</h3>
            <p className="text-gray-600 mb-6">Start building your stable by purchasing your first horse</p>
            <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors">
              Browse Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Racing View Component
const RacingView: React.FC<{ races: Race[]; horses: HorseNFT[] }> = ({ races, horses }) => {
  const [selectedRace, setSelectedRace] = React.useState<Race | null>(races[0] || null);
  const [selectedHorses, setSelectedHorses] = React.useState<HorseNFT[]>([]);

  React.useEffect(() => {
    if (selectedRace) {
      // Select 6-8 random horses for the race
      const raceHorses = horses
        .filter(h => !h.isForSale)
        .sort(() => Math.random() - 0.5)
        .slice(0, 6 + Math.floor(Math.random() * 3));
      setSelectedHorses(raceHorses);
    }
  }, [selectedRace, horses]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Racing Center 🏁</h1>
        <p className="text-gray-600">Watch thrilling races and place your bets</p>
      </div>

      {/* Race Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Races</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {races.map((race) => (
            <motion.div
              key={race.id}
              onClick={() => setSelectedRace(race)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRace?.id === race.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 className="font-bold text-gray-800 mb-2">{race.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{race.surface} • {race.distance}m</p>
                <p>Prize: {race.prizePool.toLocaleString()} $TURF</p>
                <p>Entry: {race.entryFee.toLocaleString()} $TURF</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Race Track and Betting */}
      {selectedRace && selectedHorses.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <RaceTrack race={selectedRace} horses={selectedHorses} />
          </div>
          <div>
            <BettingPanel race={selectedRace} horses={selectedHorses} />
          </div>
        </div>
      )}
    </div>
  );
};


export default App;