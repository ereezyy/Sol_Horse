import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { checkSupabaseConnection, isUsingLocalData } from './services/supabase';
import Navigation from './components/Navigation';
import WalletConnection from './components/WalletConnection';
import HorseCard from './components/HorseCard';
import RaceTrack from './components/RaceTrack';
import BettingPanel from './components/BettingPanel';
import Marketplace from './components/Marketplace';
import Leaderboard from './components/Leaderboard';
import NotificationSystem from './components/NotificationSystem';
import AchievementSystem from './components/AchievementSystem';
import SeasonalEvents from './components/SeasonalEvents';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PlayerProfile from './components/PlayerProfile';
import DailyRewards from './components/DailyRewards';
import { HorseNFT, Race, Player } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import DailyRewardPopup from './components/DailyRewardPopup';
import CurrencyDisplay from './components/CurrencyDisplay';

// Add fun facts to display during loading
const HORSE_FUN_FACTS = [
  "Horses can sleep both standing up and lying down.",
  "A horse's heart weighs approximately 10 pounds.",
  "Horses have nearly 360-degree vision.",
  "The fastest recorded speed of a horse was 55 mph."
];

// Mock data generator
const generateMockHorses = (): HorseNFT[] => {
  const names = ['Thunder Bolt', 'Lightning Strike', 'Storm Chaser', 'Wind Runner', 'Fire Spirit'];
  const breeds = ['Thoroughbred', 'Arabian', 'Quarter Horse', 'Mustang', 'Friesian'];
  
  return names.map((name, index) => ({
    id: `horse-${index + 1}`,
    name,
    breed: breeds[index],
    stats: {
      speed: Math.floor(Math.random() * 20) + 80,
      stamina: Math.floor(Math.random() * 20) + 80,
      agility: Math.floor(Math.random() * 20) + 80,
      intelligence: Math.floor(Math.random() * 20) + 80,
    },
    rarity: ['Common', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 4)] as any,
    level: Math.floor(Math.random() * 10) + 1,
    experience: Math.floor(Math.random() * 1000),
    wins: Math.floor(Math.random() * 10),
    totalRaces: Math.floor(Math.random() * 20) + 5,
    earnings: Math.floor(Math.random() * 50000),
    imageUrl: `/api/placeholder/300/200?text=${encodeURIComponent(name)}`,
    isForSale: Math.random() > 0.7,
    price: Math.floor(Math.random() * 10000) + 5000,
    owner: 'player1'
  }));
};

const generateMockRaces = (): Race[] => {
  const raceNames = ['Derby Classic', 'Sprint Championship', 'Endurance Challenge', 'Speed Trial'];
  const surfaces = ['Dirt', 'Turf', 'Synthetic'];
  
  return raceNames.map((name, index) => ({
    id: `race-${index + 1}`,
    name,
    distance: [1200, 1600, 2000, 2400][index],
    surface: surfaces[Math.floor(Math.random() * surfaces.length)] as any,
    prizePool: Math.floor(Math.random() * 50000) + 10000,
    entryFee: Math.floor(Math.random() * 1000) + 500,
    maxParticipants: 8,
    participants: [],
    startTime: Date.now() + (index + 1) * 3600000, // 1 hour intervals
    status: 'upcoming' as any,
    weather: 'Clear',
    track: {
      name: `Track ${index + 1}`,
      condition: 'Good'
    }
  }));
};

function App() {
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedHorses, setSelectedHorses] = useState<HorseNFT[]>([]);
  
  // Motion values for background animation
  const backgroundX = useMotionValue(0);
  const backgroundY = useMotionValue(0);
  const backgroundOpacity = useMotionValue(0.03);
  
  // State for welcome screen
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showDailyReward, setShowDailyReward] = useState(false);
  
  // Gradient background effect
  const background = useMotionTemplate`radial-gradient(
    600px circle at ${backgroundX}px ${backgroundY}px,
    rgba(29, 78, 216, ${backgroundOpacity}) 0%,
    transparent 80%
  )`;

  const { 
    player, 
    horses, 
    currentView, 
    setCurrentView,
    activeRaces, 
    upcomingRaces,
    addHorse,
    addRace,
    addNotification,
    initializeGame,
    updatePlayerBalance
  } = useGameStore();

  // Initialize daily check-in reminder
  useEffect(() => {
    const checkDailyReward = () => {
      if (!player) return;
      
      const lastCheckIn = localStorage.getItem(`lastCheckIn_${player.walletAddress}`);
      const today = new Date().toDateString();
      
      if (lastCheckIn !== today) {
        addNotification({
          id: `daily-${Date.now()}`,
          type: 'info',
          title: 'Daily Reward Available!',
          message: 'Claim your daily TURF tokens',
          timestamp: Date.now()
        });
      }
    };

    const timer = setTimeout(checkDailyReward, 2000);
    return () => clearTimeout(timer);
  }, [player, addNotification]);

  // Initialize mock data
  useEffect(() => {
    const mockHorses = generateMockHorses();
    const mockRaces = generateMockRaces();
    
    mockHorses.forEach(horse => addHorse(horse));
    mockRaces.forEach(race => addRace(race));
  }, []);

  // Check for daily rewards
  useEffect(() => {
    // Skip if no player or welcome screen is still showing
    if (!player || showWelcomeScreen) return;
  
    const lastCheckIn = player?.stats?.lastCheckIn;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Show reward popup if eligible for daily reward
    if (!lastCheckIn || now - lastCheckIn > oneDayMs) {
      // Slight delay to not show immediately on startup
      const timer = setTimeout(() => {
        setShowDailyReward(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [player, showWelcomeScreen]);

  // Check Supabase connection
  useEffect(() => {
    const initializeApplication = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.log('Using local data mode');
        }
      } catch (error) {
        console.error('Failed to initialize application:', error);
      }
    };

    initializeApplication();
  }, []);

  // Initialize mock data
  useEffect(() => {
    const mockHorses = generateMockHorses();
    const mockRaces = generateMockRaces();
    
    mockHorses.forEach(horse => addHorse(horse));
    mockRaces.forEach(race => addRace(race));
  }, []);
  
  // Skip welcome screen when navigating directly if player exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('skip_intro') === 'true' || params.get('race') || params.get('horse')) {
      setShowWelcomeScreen(false);
    }
  }, []);
  
  // Background animation effect
  useEffect(() => {
    if (player) {
      const handleMouseMove = (e: MouseEvent) => {
        backgroundX.set(e.clientX);
        backgroundY.set(e.clientY);
        backgroundOpacity.set(0.05);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [player]);

  // If showing welcome screen, render that first
  if (showWelcomeScreen) {
    return <WelcomeScreen onContinue={() => setShowWelcomeScreen(false)} />;
  }

  // If no wallet connected, show wallet connection
  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <WalletConnection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-x-hidden">
      <Navigation />
      
      {/* Daily Reward Popup */}
      {showDailyReward && <DailyRewardPopup onClose={() => setShowDailyReward(false)} />}
      
      <main className="container mx-auto px-6 py-8">
        {player?.walletAddress?.startsWith('guest_') && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-700 text-sm">⚠️</span>
              </div>
              <div>
                <h2 className="font-semibold text-yellow-800 mb-1">Playing as Guest</h2>
                <p className="text-sm text-yellow-700 mb-2">Your progress won't be saved when you leave. Connect a wallet to keep your progress.</p>
                <button 
                  onClick={() => {
                    setPlayer(null);
                    setCurrentView('stable');
                  }}
                  className="text-sm px-4 py-2 bg-white border border-yellow-400 rounded-lg hover:bg-yellow-50 text-yellow-700 transition-colors"
                >
                  Connect Wallet Now
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentView === 'stable' && (
            <motion.div
              key="stable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StableView horses={horses} player={player} />
            </motion.div>
          )}

          {currentView === 'racing' && (
            <motion.div
              key="racing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RacingView races={upcomingRaces} horses={horses} />
            </motion.div>
          )}

          {currentView === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Marketplace />
            </motion.div>
          )}

          {currentView === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Leaderboard />
            </motion.div>
          )}

          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PlayerProfile />
            </motion.div>
          )}

          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Components */}
      <NotificationSystem />
      <AchievementSystem />
      <SeasonalEvents />
      <DailyRewards />
    </div>
  );
}

// Stable View Component
const StableView: React.FC<{ horses: HorseNFT[], player?: Player }> = ({ horses, player }) => {
  if (!player) return null;
  
  const { currentView } = useGameStore();
  
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      {/* Dynamic welcome message based on time of day */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {player.username}! 🏇</h1>
            <p className="text-gray-600">Manage your stable of {horses.length} magnificent horses</p>
          </div>
          
          <CurrencyDisplay showHelp={true} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏇</span>
            </div>
            <div>
              <motion.p 
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {horses.length}
              </motion.p>
              <p className="text-sm text-gray-600">Horses</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <motion.p 
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {player.stats.wins}
              </motion.p>
              <p className="text-sm text-gray-600">Wins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <div>
              <motion.p 
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                {player.stats.reputation}
              </motion.p>
              <p className="text-sm text-gray-600">Reputation</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎮</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {player?.walletAddress?.startsWith('guest_') ? 
                  ((player?.assets?.guestCoins || 0).toLocaleString()) : 
                  ((player?.stats?.totalEarnings || 0) / 1000).toFixed(1) + 'K'
                }
              </p>
              <p className="text-sm text-gray-600">
                {player?.walletAddress?.startsWith('guest_') ? 'Guest Coins' : 'Total Earnings'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horse Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Your Horses</h2>
        {horses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horses.map((horse) => (
              <HorseCard key={horse.id} horse={horse} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🏇</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Horses Yet</h3>
            <p className="text-gray-600 mb-6">Visit the marketplace to purchase your first horse!</p>
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors">
              Visit Marketplace
            </button>
          </div>
        )}
      </div>

      {/* ... (rest of StableView component remains the same) */}
    </div>
  );
};

// ... (RacingView component)

const RacingView: React.FC<{ races: Race[]; horses: HorseNFT[] }> = ({ races, horses }) => {
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedHorses, setSelectedHorses] = useState<HorseNFT[]>([]);
  const { player, setCurrentView } = useGameStore();
  
  // Filter horses owned by player
  const playerHorses = horses.filter(horse => horse.owner === player?.walletAddress);

  // ... (previous code remains the same until the motion.p elements)

  return playerHorses.length > 0 ? (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Racing Center 🏁</h1>
                <p className="text-gray-600">Watch thrilling races and place your bets</p>
              </div>
              <CurrencyDisplay />
            </div>
            
            {/* Race Selection */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Featured Races
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {races.slice(0, 4).map((race) => (
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
                    <h3 className="font-bold text-gray-800 mb-1">{race.name}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                      <p>{race.surface}</p>
                      <p>{race.distance}m</p>
                      <p>Prize: {race.prizePool.toLocaleString()} {player?.walletAddress?.startsWith('guest_') ? 'GC' : '$TURF'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  View all races
                  <span className="text-xs">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">My Race Entries</h2>
            {playerHorses.length > 0 ? (
              <div className="space-y-3">
                <motion.button
                  className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Star className="w-5 h-5" />
                  Enter a Race
                </motion.button>
                <p className="text-sm text-gray-600 text-center">
                  No upcoming races for your horses
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center">
                You need horses to enter races
              </p>
            )}
          </div>
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
  ) : (
    <div className="text-center py-12">
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-8 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Ready to Race?</h2>
        <p className="text-gray-600 mb-6">
          You need horses to participate in races. Visit the marketplace to purchase your first champion!
        </p>
        <motion.button
          onClick={() => setCurrentView('marketplace')}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Visit Marketplace
        </motion.button>
      </motion.div>
    </div>
  );
};

export default App;