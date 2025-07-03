import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Crown, 
  Trophy, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Star,
  Medal,
  Edit3,
  Camera,
  MapPin,
  Users,
  Zap,
  BarChart3,
  Gift,
  Settings,
  Copy,
  Check
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import HorseCard from './HorseCard';

const PlayerProfile: React.FC = () => {
  const { player, horses } = useGameStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'horses' | 'achievements' | 'stats'>('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  // Handle both no player and guest player cases
  const isGuestUser = player?.walletAddress?.startsWith('guest_');
  
  if (!player) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No Profile Found</h3>
          <p className="text-gray-500">Connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  const playerHorses = horses.filter(horse => horse.owner === player.walletAddress);
  const winRate = player.stats.totalRaces > 0 ? (player.stats.wins / player.stats.totalRaces * 100).toFixed(1) : '0.0';
  const profitMargin = player.stats.totalEarnings > 0 ? ((player.stats.netProfit / player.stats.totalEarnings) * 100).toFixed(1) : '0.0';

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(player.walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getRankColor = (reputation: number) => {
    if (reputation >= 1000) return 'from-yellow-400 to-orange-500';
    if (reputation >= 500) return 'from-purple-400 to-pink-500';
    if (reputation >= 250) return 'from-blue-400 to-indigo-500';
    if (reputation >= 100) return 'from-green-400 to-emerald-500';
    return 'from-gray-400 to-gray-500';
  };

  const getRankTitle = (reputation: number) => {
    if (reputation >= 1000) return 'Legendary Trainer';
    if (reputation >= 500) return 'Master Breeder';
    if (reputation >= 250) return 'Professional Racer';
    if (reputation >= 100) return 'Experienced Stable Owner';
    return 'Novice Trainer';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'horses', label: 'My Horses', icon: Crown },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'stats', label: 'Statistics', icon: BarChart3 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <div className="absolute bottom-4 left-6 text-white">
            <h1 className="text-3xl font-bold">{player.profile.stableName}</h1>
            <p className="text-blue-100">Est. {new Date(player.profile.joinDate).getFullYear()}</p>
          </div>
          <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all">
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRankColor(player.stats.reputation)}`}>
                  {player.stats.reputation}
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">{player.username}</h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getRankColor(player.stats.reputation)}`}>
                    {getRankTitle(player.stats.reputation)}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {player.profile.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(player.profile.joinDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {player.social.followers} followers
                  </span>
                </div>

                <p className="text-gray-700 max-w-md">{player.profile.bio}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                  <Crown className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{playerHorses.length}</p>
                <p className="text-sm text-gray-600">Horses</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{player.stats.wins}</p>
                <p className="text-sm text-gray-600">Wins</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{(player.stats.totalEarnings / 1000).toFixed(1)}K</p>
                <p className="text-sm text-gray-600">Earnings</p>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
                <p className="font-mono text-gray-800">
                  {isGuestUser ? 'Guest Account (Not Connected)' : player.walletAddress}
                </p>
              </div>
              
              {!isGuestUser && (
                <button
                  onClick={copyWalletAddress}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copiedAddress ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copiedAddress ? 'Copied!' : 'Copy'}
                </button>
              )}
              
              {isGuestUser && (
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Performance Metrics */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Overview</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{winRate}%</p>
                  <p className="text-sm text-gray-600">Win Rate</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{profitMargin}%</p>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{player.stats.reputation}</p>
                  <p className="text-sm text-gray-600">Reputation</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{player.stats.achievements.length}</p>
                  <p className="text-sm text-gray-600">Achievements</p>
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recent Achievements</h4>
                <div className="space-y-2">
                  {player.stats.achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        achievement.rarity === 'Legendary' ? 'bg-yellow-100' :
                        achievement.rarity === 'Epic' ? 'bg-purple-100' :
                        achievement.rarity === 'Rare' ? 'bg-blue-100' :
                        'bg-green-100'
                      }`}>
                        <Medal className={`w-6 h-6 ${
                          achievement.rarity === 'Legendary' ? 'text-yellow-600' :
                          achievement.rarity === 'Epic' ? 'text-purple-600' :
                          achievement.rarity === 'Rare' ? 'text-blue-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{achievement.name}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assets Overview */}
            <div className="space-y-6">
              {/* Balance */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Assets</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-green-600" />
                      <span className="font-medium text-gray-800">$TURF</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {player.assets.turfBalance.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      <span className="font-medium text-gray-800">SOL</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {player.assets.solBalance.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Facilities</h3>
                
                <div className="space-y-3">
                  {player.assets.facilities.map((facility) => (
                    <div key={facility.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{facility.type}</p>
                        <p className="text-sm text-gray-600">Level {facility.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="font-bold text-gray-800">{facility.capacity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'horses' && (
          <motion.div
            key="horses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">My Stable ({playerHorses.length} horses)</h3>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Buy New Horse
              </button>
            </div>
            
            {playerHorses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playerHorses.map((horse) => (
                  <HorseCard key={horse.id} horse={horse} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Horses Yet</h4>
                <p className="text-gray-500 mb-4">Start building your stable by purchasing your first horse</p>
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Browse Marketplace
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Achievements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {player.stats.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 ${
                    achievement.rarity === 'Legendary' ? 'border-yellow-300 bg-yellow-50' :
                    achievement.rarity === 'Epic' ? 'border-purple-300 bg-purple-50' :
                    achievement.rarity === 'Rare' ? 'border-blue-300 bg-blue-50' :
                    'border-green-300 bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      achievement.rarity === 'Legendary' ? 'bg-yellow-200' :
                      achievement.rarity === 'Epic' ? 'bg-purple-200' :
                      achievement.rarity === 'Rare' ? 'bg-blue-200' :
                      'bg-green-200'
                    }`}>
                      <Trophy className={`w-8 h-8 ${
                        achievement.rarity === 'Legendary' ? 'text-yellow-600' :
                        achievement.rarity === 'Epic' ? 'text-purple-600' :
                        achievement.rarity === 'Rare' ? 'text-blue-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{achievement.name}</h4>
                      <p className={`text-xs font-medium ${
                        achievement.rarity === 'Legendary' ? 'text-yellow-600' :
                        achievement.rarity === 'Epic' ? 'text-purple-600' :
                        achievement.rarity === 'Rare' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {achievement.rarity}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  {achievement.rewards && (
                    <div className="text-xs text-gray-500">
                      Reward: {achievement.rewards.turfTokens && `${achievement.rewards.turfTokens} $TURF`}
                      {achievement.rewards.title && ` • ${achievement.rewards.title}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Racing Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Racing Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Races</span>
                  <span className="font-bold text-gray-800">{player.stats.totalRaces}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Wins</span>
                  <span className="font-bold text-green-600">{player.stats.wins}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-bold text-blue-600">{winRate}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Best Finish Position</span>
                  <span className="font-bold text-yellow-600">1st</span>
                </div>
              </div>
            </div>

            {/* Financial Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Financial Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Earnings</span>
                  <span className="font-bold text-green-600">{player.stats.totalEarnings.toLocaleString()} $TURF</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-bold text-red-600">{player.stats.totalSpent.toLocaleString()} $TURF</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Net Profit</span>
                  <span className={`font-bold ${player.stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {player.stats.netProfit >= 0 ? '+' : ''}{player.stats.netProfit.toLocaleString()} $TURF
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">ROI</span>
                  <span className={`font-bold ${player.stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitMargin}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerProfile;