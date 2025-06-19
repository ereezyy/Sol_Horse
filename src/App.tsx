import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import Navigation from './components/Navigation';
import WalletConnection from './components/WalletConnection';
import HorseCard from './components/HorseCard';
import RaceTrack from './components/RaceTrack';
import BettingPanel from './components/BettingPanel';
import BreedingCenter from './components/BreedingCenter';
import TrainingCenter from './components/TrainingCenter';
import TournamentCenter from './components/TournamentCenter';
import DailyQuests from './components/DailyQuests';
import PlayerProfile from './components/PlayerProfile';
import { HorseNFT, Race, Player } from './types';

// Mock data generator
const generateMockHorses = (): HorseNFT[] => {
  const bloodlines = ['Arabian', 'Thoroughbred', 'Quarter Horse', 'Mustang', 'Legendary'];
  const coatColors = ['Bay', 'Black', 'Chestnut', 'Gray', 'Palomino'];
  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
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
    
    const rarity = rarities[Math.floor(Math.random() * rarities.length)] as any;
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
        bloodline: bloodlines[Math.floor(Math.random() * bloodlines.length)] as any,
        rarity,
        generation: 1 + Math.floor(Math.random() * 5)
      },
      stats: {
        age: 24 + Math.floor(Math.random() * 60), // 2-7 years
        fitness: 80 + Math.floor(Math.random() * 20),
        experience: races * 10,
        wins,
        races,
        earnings: wins * (1000 + Math.random() * 5000),
        retirementAge: 96 + Math.floor(Math.random() * 24) // 8-10 years
      },
      breeding: {
        canBreed: Math.random() > 0.3,
        breedingCooldown: Date.now() - Math.floor(Math.random() * 1000000),
        offspring: [],
        studFee: rarity === 'Legendary' ? 25000 : rarity === 'Epic' ? 15000 : 5000,
        isPublicStud: Math.random() > 0.5
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
        backstory: `A ${rarity.toLowerCase()} ${coatColors[Math.floor(Math.random() * coatColors.length)].toLowerCase()} horse with exceptional racing potential.`,
        personality: 'Determined and competitive',
        quirks: ['Loves carrots', 'Gets excited before races'],
        achievements: wins > 10 ? ['Multiple race winner'] : []
      },
      owner: Math.random() > 0.7 ? 'current-player' : `owner-${Math.floor(Math.random() * 10)}`,
      isForSale: Math.random() > 0.8,
      price: Math.random() > 0.8 ? 10000 + Math.floor(Math.random() * 90000) : undefined,
      isForLease: Math.random() > 0.9,
      leaseTerms: undefined
    };
  });
};

const generateMockRaces = (): Race[] => {
  const raceNames = [
    'Thunder Valley Sprint', 'Lightning Derby', 'Storm Peak Classic', 'Wind Ridge Stakes',
    'Fire Mountain Cup', 'Midnight Express', 'Golden Gate Gallop', 'Silver Creek Derby'
  ];
  
  const surfaces = ['Dirt', 'Turf', 'Synthetic'];
  const distances = [1200, 1400, 1600, 2000, 2400];
  const weathers = ['Clear', 'Cloudy', 'Rainy', 'Windy'];
  const trackConditions = ['Fast', 'Good', 'Soft', 'Heavy'];
  
  return Array.from({ length: 6 }, (_, i) => ({
    id: `race-${i + 1}`,
    name: raceNames[i],
    type: i < 2 ? 'Sprint' : i < 4 ? 'Middle Distance' : 'Long Distance' as any,
    surface: surfaces[Math.floor(Math.random() * surfaces.length)] as any,
    distance: distances[Math.floor(Math.random() * distances.length)],
    tier: 'Professional' as any,
    conditions: {
      weather: weathers[Math.floor(Math.random() * weathers.length)] as any,
      temperature: 15 + Math.floor(Math.random() * 20),
      trackCondition: trackConditions[Math.floor(Math.random() * trackConditions.length)] as any
    },
    requirements: {
      minAge: 24,
      maxAge: 84,
      minExperience: 0
    },
    entryFee: 1000 + Math.floor(Math.random() * 4000),
    prizePool: 50000 + Math.floor(Math.random() * 200000),
    prizeDistribution: [50, 25, 15, 10],
    participants: [],
    maxParticipants: 8,
    registrationDeadline: Date.now() + 86400000, // 24 hours
    raceTime: Date.now() + 172800000, // 48 hours
    status: 'Registration' as any
  }));
};

function App() {
  const { 
    player, 
    horses, 
    currentView, 
    activeRaces, 
    upcomingRaces,
    addHorse,
    addRace
  } = useGameStore();

  // Initialize mock data
  useEffect(() => {
    const mockHorses = generateMockHorses();
    const mockRaces = generateMockRaces();
    
    mockHorses.forEach(horse => addHorse(horse));
    mockRaces.forEach(race => addRace(race));
  }, []);

  // If no wallet connected, show wallet connection
  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <WalletConnection />
      </div>
    );
  }

  const playerHorses = horses.filter(horse => horse.owner === player.walletAddress || horse.owner === 'current-player');
  const marketplaceHorses = horses.filter(horse => horse.isForSale && horse.owner !== player.walletAddress);
  
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
        return <TournamentCenter />;
      case 'quests':
        return <DailyQuests />;
      case 'marketplace':
        return <MarketplaceView horses={marketplaceHorses} />;
      case 'profile':
        return <PlayerProfile />;
      case 'guild':
        return <GuildView />;
      default:
        return <StableView horses={playerHorses} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
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

// Marketplace View Component
const MarketplaceView: React.FC<{ horses: HorseNFT[] }> = ({ horses }) => {
  const [sortBy, setSortBy] = React.useState<'price' | 'rarity' | 'performance'>('price');
  const [filterRarity, setFilterRarity] = React.useState<string>('all');

  const filteredHorses = horses
    .filter(horse => filterRarity === 'all' || horse.genetics.rarity === filterRarity)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'rarity':
          const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
          return rarityOrder.indexOf(b.genetics.rarity) - rarityOrder.indexOf(a.genetics.rarity);
        case 'performance':
          return (b.stats.wins / Math.max(b.stats.races, 1)) - (a.stats.wins / Math.max(a.stats.races, 1));
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Horse Marketplace 🛒</h1>
        <p className="text-gray-600">Discover and purchase exceptional racing horses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="price">Price</option>
              <option value="rarity">Rarity</option>
              <option value="performance">Performance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rarity</label>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHorses.map((horse) => (
          <HorseCard key={horse.id} horse={horse} />
        ))}
      </div>
    </div>
  );
};

// Guild View Component
const GuildView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🏛️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Guilds Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          Join forces with other trainers, compete in team tournaments, and build legendary stables together
        </p>
        <button className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors">
          Join Beta Testing
        </button>
      </div>
    </div>
  );
};

export default App;