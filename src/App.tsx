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
import TournamentSystem from './components/TournamentSystem';
import DailyQuests from './components/DailyQuests';
import AchievementSystem from './components/AchievementSystem';
import SeasonalEvents from './components/SeasonalEvents';
import AnalyticsDashboard from './components/AnalyticsDashboard';
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
      isForLease: Math.random() > 0.85, // Some horses available for lease
      leaseTerms: Math.random() > 0.85 ? {
        duration: 7 + Math.floor(Math.random() * 21), // 1-4 weeks
        cost: 1000 + Math.floor(Math.random() * 4000),
        revenueShare: 0.6 + Math.random() * 0.3 // 60-90% to lessee
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
  
  const surfaces = ['Dirt', 'Turf', 'Synthetic'];
  const distances = [1200, 1400, 1600, 2000, 2400, 3200]; // Added longer distance
  const weathers = ['Clear', 'Cloudy', 'Rainy', 'Windy'];
  const trackConditions = ['Fast', 'Good', 'Soft', 'Heavy'];
  const tiers = ['Novice', 'Professional', 'Stakes', 'Graded', 'Championship'];
  
  return Array.from({ length: 8 }, (_, i) => { // Increased to 8 races
    const tier = tiers[Math.floor(Math.random() * tiers.length)] as any;
    const basePrize = tier === 'Championship' ? 500000 :
                     tier === 'Graded' ? 250000 :
                     tier === 'Stakes' ? 100000 :
                     tier === 'Professional' ? 50000 : 25000;
    
    return {
      id: `race-${i + 1}`,
      name: raceNames[i] || `Race ${i + 1}`,
      type: i < 3 ? 'Sprint' : i < 6 ? 'Middle Distance' : 'Long Distance' as any,
      surface: surfaces[Math.floor(Math.random() * surfaces.length)] as any,
      distance: distances[Math.floor(Math.random() * distances.length)],
      tier,
      conditions: {
        weather: weathers[Math.floor(Math.random() * weathers.length)] as any,
        temperature: 15 + Math.floor(Math.random() * 20),
        trackCondition: trackConditions[Math.floor(Math.random() * trackConditions.length)] as any
      },
      requirements: {
        minAge: 24,
        maxAge: tier === 'Championship' ? 60 : 84, // Age restrictions for top races
        minExperience: tier === 'Championship' ? 1000 : 
                      tier === 'Graded' ? 500 :
                      tier === 'Stakes' ? 200 : 0
      },
      entryFee: Math.floor(basePrize * 0.02) + Math.floor(Math.random() * Math.floor(basePrize * 0.03)), // 2-5% of prize
      prizePool: basePrize + Math.floor(Math.random() * basePrize * 0.5), // Up to 50% variation
      prizeDistribution: [50, 25, 15, 10], // Winner gets 50%, etc.
      participants: [],
      maxParticipants: tier === 'Championship' ? 12 : 
                      tier === 'Graded' ? 10 : 8, // Bigger fields for bigger races
      registrationDeadline: Date.now() + (24 + Math.floor(Math.random() * 48)) * 3600000, // 1-3 days
      raceTime: Date.now() + (48 + Math.floor(Math.random() * 120)) * 3600000, // 2-7 days
      status: ['Registration', 'Registration', 'Registration', 'Upcoming'][Math.floor(Math.random() * 4)] as any
    };
  });
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
        return <TournamentSystem 
          playerHorses={horses.filter(h => h.isOwned)} 
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