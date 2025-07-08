import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Gamepad2, TrendingUp, Crown, Zap } from 'lucide-react';
import Navigation from './components/Navigation';
import HorseCard from './components/HorseCard';
import RaceTrack from './components/RaceTrack';
import Marketplace from './components/Marketplace';
import TrainingCenter from './components/TrainingCenter';
import BreedingCenter from './components/BreedingCenter';
import PlayerProfile from './components/PlayerProfile';
import SolanaWalletConnection from './components/SolanaWalletConnection';
import { useGameStore } from './store/gameStore';
import type { HorseNFT, Player, Race } from './types';

const App: React.FC = () => {
  const { currentView, player, horses, races } = useGameStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize game data
    useGameStore.getState().initializeGame();
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              🏇 Sol Horse Racing
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              The premier blockchain horse racing experience
            </motion.p>
          </div>
          
          <div className="max-w-md mx-auto">
            <SolanaWalletConnection onConnect={() => setIsConnected(true)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'stable' && <StableView horses={horses} player={player} />}
        {currentView === 'racing' && <RacingView races={races} horses={horses} />}
        {currentView === 'marketplace' && <Marketplace />}
        {currentView === 'training' && <TrainingCenter horses={horses} />}
        {currentView === 'breeding' && <BreedingCenter horses={horses} />}
        {currentView === 'profile' && <PlayerProfile player={player} />}
      </main>
    </div>
  );
};

const StableView: React.FC<{ horses: HorseNFT[], player: Player }> = ({ horses, player }) => {
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
                {player?.assets?.turfBalance?.toLocaleString() || 0} $TURF
              </p>
              <p className="text-sm text-gray-600">Available Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Horses</p>
              <p className="text-2xl font-bold text-gray-800">{horses.length}</p>
            </div>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Wins</p>
              <p className="text-2xl font-bold text-gray-800">{player?.stats?.wins || 0}</p>
            </div>
            <Trophy className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reputation</p>
              <p className="text-2xl font-bold text-gray-800">{player?.stats?.reputation || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-800">
                {player?.stats?.totalEarnings?.toLocaleString() || 0} $TURF
              </p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Horse Grid */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Horses</h2>
        {horses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horses.map((horse) => (
              <HorseCard key={horse.id} horse={horse} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No horses in your stable yet</p>
            <p className="text-gray-400 mb-6">Visit the marketplace to acquire your first horse</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Browse Marketplace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const RacingView: React.FC<{ races: Race[]; horses: HorseNFT[] }> = ({ races, horses }) => {
  return (
    <div className="space-y-8">
      {/* Racing Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🏁 Racing Central
        </h1>
        <p className="text-gray-600">
          Enter races and compete with your horses
        </p>
      </div>

      {/* Upcoming Races */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Races</h2>
        {races.length > 0 ? (
          <div className="space-y-4">
            {races.map((race) => (
              <div key={race.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{race.name}</h3>
                    <p className="text-gray-600">{race.type} • {race.distance}m • {race.surface}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{race.prizePool.toLocaleString()} $TURF</p>
                    <p className="text-sm text-gray-500">Prize Pool</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No races available</p>
            <p className="text-gray-400">Check back later for new racing events</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;