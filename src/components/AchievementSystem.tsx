import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown, 
  Target, 
  Zap, 
  Heart, 
  Shield,
  Award,
  Lock,
  Unlock,
  Gift,
  Flame,
  CheckCircle,
  Progress,
  TrendingUp,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'racing' | 'breeding' | 'collection' | 'social' | 'milestone' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  type: 'standard' | 'hidden' | 'limited' | 'secret';
  progress: {
    current: number;
    required: number;
    unit: string;
  };
  rewards: {
    turfTokens: number;
    experience: number;
    reputation: number;
    title?: string;
    badge?: string;
    special?: string[];
  };
  unlocked: boolean;
  dateUnlocked?: number;
  rarity: number; // 1-100, how rare this achievement is
  prerequisite?: string[]; // IDs of required achievements
  hint?: string; // For hidden achievements
}

const AchievementSystem: React.FC = () => {
  const { player, horses, updatePlayerBalance, addNotification } = useGameStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');
  const [selectedTier, setSelectedTier] = useState<'all' | Achievement['tier']>('all');
  const [showUnlockedModal, setShowUnlockedModal] = useState<Achievement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    generateAchievements();
  }, [player, horses]);

  const generateAchievements = () => {
    const playerHorses = horses.filter(h => h.owner === player?.walletAddress);
    
    const achievementList: Achievement[] = [
      // Racing Achievements
      {
        id: 'first-race',
        name: 'First Steps',
        description: 'Complete your very first race',
        category: 'racing',
        tier: 'bronze',
        type: 'standard',
        progress: { current: Math.min(player?.stats.totalRaces || 0, 1), required: 1, unit: 'races' },
        rewards: { turfTokens: 1000, experience: 100, reputation: 10, title: 'Rookie Racer' },
        unlocked: (player?.stats.totalRaces || 0) >= 1,
        dateUnlocked: (player?.stats.totalRaces || 0) >= 1 ? Date.now() - Math.random() * 86400000 : undefined,
        rarity: 95
      },
      {
        id: 'ten-races',
        name: 'Getting Started',
        description: 'Complete 10 races',
        category: 'racing',
        tier: 'bronze',
        type: 'standard',
        progress: { current: Math.min(player?.stats.totalRaces || 0, 10), required: 10, unit: 'races' },
        rewards: { turfTokens: 2500, experience: 250, reputation: 25 },
        unlocked: (player?.stats.totalRaces || 0) >= 10,
        rarity: 80
      },
      {
        id: 'first-win',
        name: 'Taste of Victory',
        description: 'Win your first race',
        category: 'racing',
        tier: 'silver',
        type: 'standard',
        progress: { current: Math.min(player?.stats.wins || 0, 1), required: 1, unit: 'wins' },
        rewards: { turfTokens: 5000, experience: 500, reputation: 50, title: 'Victor', badge: 'First Win Medal' },
        unlocked: (player?.stats.wins || 0) >= 1,
        dateUnlocked: (player?.stats.wins || 0) >= 1 ? Date.now() - Math.random() * 86400000 : undefined,
        rarity: 70
      },
      {
        id: 'winning-streak',
        name: 'Hot Streak',
        description: 'Win 5 races in a row',
        category: 'racing',
        tier: 'gold',
        type: 'standard',
        progress: { current: 0, required: 5, unit: 'consecutive wins' },
        rewards: { turfTokens: 15000, experience: 1000, reputation: 100, title: 'Streak Master' },
        unlocked: false,
        rarity: 35
      },
      {
        id: 'champion',
        name: 'Champion',
        description: 'Win 100 races',
        category: 'racing',
        tier: 'platinum',
        type: 'standard',
        progress: { current: Math.min(player?.stats.wins || 0, 100), required: 100, unit: 'wins' },
        rewards: { turfTokens: 50000, experience: 5000, reputation: 500, title: 'Racing Champion', badge: 'Champion Crown' },
        unlocked: (player?.stats.wins || 0) >= 100,
        rarity: 15
      },
      {
        id: 'legend',
        name: 'Living Legend',
        description: 'Win 500 races',
        category: 'racing',
        tier: 'legendary',
        type: 'standard',
        progress: { current: Math.min(player?.stats.wins || 0, 500), required: 500, unit: 'wins' },
        rewards: { turfTokens: 250000, experience: 25000, reputation: 2500, title: 'Racing Legend', special: ['Legendary Stable Expansion', 'Golden Horse Statue'] },
        unlocked: (player?.stats.wins || 0) >= 500,
        rarity: 2
      },

      // Breeding Achievements
      {
        id: 'first-breed',
        name: 'Life Creator',
        description: 'Successfully breed your first horse',
        category: 'breeding',
        tier: 'bronze',
        type: 'standard',
        progress: { current: 0, required: 1, unit: 'bred horses' },
        rewards: { turfTokens: 3000, experience: 300, reputation: 30, title: 'Breeder' },
        unlocked: false,
        rarity: 60
      },
      {
        id: 'rare-breed',
        name: 'Rare Genetics',
        description: 'Breed a Rare or higher rarity horse',
        category: 'breeding',
        tier: 'silver',
        type: 'standard',
        progress: { current: 0, required: 1, unit: 'rare horses' },
        rewards: { turfTokens: 10000, experience: 750, reputation: 75, badge: 'Rare Breeder Certificate' },
        unlocked: false,
        rarity: 40
      },
      {
        id: 'perfect-genetics',
        name: 'Perfect Specimen',
        description: 'Breed a horse with 90+ in all stats',
        category: 'breeding',
        tier: 'diamond',
        type: 'standard',
        progress: { current: 0, required: 1, unit: 'perfect horses' },
        rewards: { turfTokens: 100000, experience: 5000, reputation: 1000, title: 'Master Breeder', special: ['Perfect Genetics Certificate'] },
        unlocked: false,
        rarity: 5
      },

      // Collection Achievements
      {
        id: 'stable-builder',
        name: 'Stable Builder',
        description: 'Own 5 horses at the same time',
        category: 'collection',
        tier: 'bronze',
        type: 'standard',
        progress: { current: Math.min(playerHorses.length, 5), required: 5, unit: 'horses' },
        rewards: { turfTokens: 5000, experience: 400, reputation: 40, title: 'Stable Owner' },
        unlocked: playerHorses.length >= 5,
        rarity: 50
      },
      {
        id: 'horse-collector',
        name: 'Horse Collector',
        description: 'Own 20 horses at the same time',
        category: 'collection',
        tier: 'gold',
        type: 'standard',
        progress: { current: Math.min(playerHorses.length, 20), required: 20, unit: 'horses' },
        rewards: { turfTokens: 25000, experience: 2000, reputation: 200, title: 'Collector', badge: 'Collection Master' },
        unlocked: playerHorses.length >= 20,
        rarity: 20
      },
      {
        id: 'bloodline-master',
        name: 'Bloodline Master',
        description: 'Own horses from all 5 bloodlines',
        category: 'collection',
        tier: 'platinum',
        type: 'standard',
        progress: { current: 0, required: 5, unit: 'bloodlines' },
        rewards: { turfTokens: 75000, experience: 3000, reputation: 300, title: 'Bloodline Expert' },
        unlocked: false,
        rarity: 12
      },

      // Social Achievements
      {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Make 10 friends in the community',
        category: 'social',
        tier: 'silver',
        type: 'standard',
        progress: { current: player?.social.friends.length || 0, required: 10, unit: 'friends' },
        rewards: { turfTokens: 7500, experience: 500, reputation: 50, title: 'Community Member' },
        unlocked: (player?.social.friends.length || 0) >= 10,
        rarity: 45
      },
      {
        id: 'guild-founder',
        name: 'Guild Founder',
        description: 'Create or lead a guild',
        category: 'social',
        tier: 'gold',
        type: 'standard',
        progress: { current: 0, required: 1, unit: 'guilds' },
        rewards: { turfTokens: 20000, experience: 1500, reputation: 150, title: 'Guild Leader', badge: 'Leadership Medal' },
        unlocked: false,
        rarity: 25
      },

      // Milestone Achievements
      {
        id: 'millionaire',
        name: 'Millionaire',
        description: 'Earn 1,000,000 $TURF in total',
        category: 'milestone',
        tier: 'platinum',
        type: 'standard',
        progress: { current: Math.min(player?.stats.totalEarnings || 0, 1000000), required: 1000000, unit: '$TURF' },
        rewards: { turfTokens: 100000, experience: 5000, reputation: 500, title: 'Millionaire', badge: 'Golden $TURF' },
        unlocked: (player?.stats.totalEarnings || 0) >= 1000000,
        rarity: 8
      },

      // Special/Hidden Achievements
      {
        id: 'lucky-seven',
        name: 'Lucky Seven',
        description: 'Win exactly 7 races in a single day',
        category: 'special',
        tier: 'gold',
        type: 'hidden',
        progress: { current: 0, required: 7, unit: 'wins today' },
        rewards: { turfTokens: 77777, experience: 777, reputation: 77, title: 'Lucky Seven', badge: 'Four Leaf Clover' },
        unlocked: false,
        rarity: 10,
        hint: 'Something about the number 7...'
      },
      {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Race between midnight and 6 AM',
        category: 'special',
        tier: 'silver',
        type: 'hidden',
        progress: { current: 0, required: 1, unit: 'night races' },
        rewards: { turfTokens: 5000, experience: 400, reputation: 40, title: 'Night Racer', badge: 'Moon Medal' },
        unlocked: false,
        rarity: 30,
        hint: 'The early bird gets the worm, but what about the night owl?'
      },
      {
        id: 'easter-egg',
        name: '???',
        description: 'Find the hidden easter egg',
        category: 'special',
        tier: 'legendary',
        type: 'secret',
        progress: { current: 0, required: 1, unit: 'easter eggs' },
        rewards: { turfTokens: 500000, experience: 10000, reputation: 1000, title: 'Easter Egg Hunter', special: ['Secret NFT'] },
        unlocked: false,
        rarity: 1
      }
    ];

    setAchievements(achievementList);
  };

  const claimAchievement = (achievement: Achievement) => {
    if (!achievement.unlocked) return;

    updatePlayerBalance(achievement.rewards.turfTokens);
    
    setAchievements(prev => prev.map(a => 
      a.id === achievement.id 
        ? { ...a, dateUnlocked: Date.now() }
        : a
    ));

    addNotification({
      id: Date.now().toString(),
      type: 'quest_complete',
      title: 'Achievement Unlocked!',
      message: `"${achievement.name}" - Earned ${achievement.rewards.turfTokens.toLocaleString()} $TURF!`,
      timestamp: Date.now(),
      read: false
    });

    setShowUnlockedModal(achievement);
    setTimeout(() => setShowUnlockedModal(null), 5000);
  };

  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'from-amber-600 to-amber-700';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-500';
      case 'platinum': return 'from-blue-400 to-blue-500';
      case 'diamond': return 'from-cyan-400 to-cyan-500';
      case 'legendary': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTierIcon = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return <Medal className="w-5 h-5" />;
      case 'silver': return <Award className="w-5 h-5" />;
      case 'gold': return <Trophy className="w-5 h-5" />;
      case 'platinum': return <Star className="w-5 h-5" />;
      case 'diamond': return <Zap className="w-5 h-5" />;
      case 'legendary': return <Crown className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'racing': return <Trophy className="w-4 h-4" />;
      case 'breeding': return <Heart className="w-4 h-4" />;
      case 'collection': return <Star className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'milestone': return <Target className="w-4 h-4" />;
      case 'special': return <Flame className="w-4 h-4" />;
      default: return <Medal className="w-4 h-4" />;
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min(100, (achievement.progress.current / achievement.progress.required) * 100);
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || achievement.tier === selectedTier;
    const matchesSearch = searchTerm === '' || 
      achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Show locked hidden/secret achievements as ??? if not unlocked
    return matchesCategory && matchesTier && matchesSearch;
  }).sort((a, b) => {
    // Sort by unlocked status, then tier, then rarity
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary'];
    const aTierIndex = tierOrder.indexOf(a.tier);
    const bTierIndex = tierOrder.indexOf(b.tier);
    if (aTierIndex !== bTierIndex) return aTierIndex - bTierIndex;
    
    return b.rarity - a.rarity;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.rewards.reputation, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Achievement System</h1>
              <p className="text-gray-600">Track your progress and unlock exclusive rewards</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{unlockedCount}</p>
                <p className="text-sm text-gray-600">Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{totalPoints}</p>
                <p className="text-sm text-gray-600">Achievement Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Progress Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary'].map(tier => {
            const tierAchievements = achievements.filter(a => a.tier === tier);
            const unlockedTier = tierAchievements.filter(a => a.unlocked).length;
            
            return (
              <div key={tier} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-2 rounded-xl bg-gradient-to-br ${getTierColor(tier as Achievement['tier'])} flex items-center justify-center`}>
                  {getTierIcon(tier as Achievement['tier'])}
                  <span className="text-white font-bold">{unlockedTier}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 capitalize">{tier}</p>
                <p className="text-xs text-gray-500">{unlockedTier}/{tierAchievements.length}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Categories</option>
              <option value="racing">Racing</option>
              <option value="breeding">Breeding</option>
              <option value="collection">Collection</option>
              <option value="social">Social</option>
              <option value="milestone">Milestone</option>
              <option value="special">Special</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tier:</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
          
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
              achievement.unlocked ? 'border-green-300' : 'border-gray-200'
            } ${achievement.type === 'secret' && !achievement.unlocked ? 'opacity-75' : ''}`}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Achievement Header */}
            <div className={`h-20 bg-gradient-to-r ${getTierColor(achievement.tier)} relative`}>
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <div className="absolute top-4 left-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  {achievement.unlocked ? (
                    getTierIcon(achievement.tier)
                  ) : achievement.type === 'secret' ? (
                    <Lock className="w-6 h-6 text-white" />
                  ) : (
                    getCategoryIcon(achievement.category)
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold">
                    {achievement.type === 'secret' && !achievement.unlocked ? '???' : achievement.name}
                  </h3>
                  <p className="text-white text-opacity-90 text-sm capitalize">{achievement.tier}</p>
                </div>
              </div>
              
              {achievement.unlocked && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Achievement Content */}
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {achievement.type === 'secret' && !achievement.unlocked 
                  ? (achievement.hint || 'This achievement is a mystery...')
                  : achievement.description}
              </p>
              
              {/* Progress Bar */}
              {achievement.type !== 'secret' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">
                      {achievement.progress.current.toLocaleString()}/{achievement.progress.required.toLocaleString()} {achievement.progress.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full transition-all ${
                        achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage(achievement)}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              )}

              {/* Rewards */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Rewards</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {achievement.rewards.turfTokens.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      {achievement.rewards.experience} XP
                    </span>
                  </div>
                  
                  {achievement.rewards.reputation > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <Star className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">
                        +{achievement.rewards.reputation} Rep
                      </span>
                    </div>
                  )}
                  
                  {achievement.rewards.title && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">
                        Title
                      </span>
                    </div>
                  )}
                </div>
                
                {achievement.rewards.special && achievement.rewards.special.length > 0 && (
                  <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-purple-800">Special Rewards:</p>
                    {achievement.rewards.special.map((item, index) => (
                      <p key={index} className="text-xs text-purple-600">• {item}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Rarity */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Rarity</span>
                  <span className={`text-xs font-medium ${
                    achievement.rarity >= 90 ? 'text-green-600' :
                    achievement.rarity >= 70 ? 'text-yellow-600' :
                    achievement.rarity >= 50 ? 'text-orange-600' :
                    achievement.rarity >= 20 ? 'text-red-600' :
                    'text-purple-600'
                  }`}>
                    {achievement.rarity >= 90 ? 'Common' :
                     achievement.rarity >= 70 ? 'Uncommon' :
                     achievement.rarity >= 50 ? 'Rare' :
                     achievement.rarity >= 20 ? 'Very Rare' :
                     'Ultra Rare'} ({achievement.rarity}%)
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {achievement.unlocked && !achievement.dateUnlocked ? (
                <motion.button
                  onClick={() => claimAchievement(achievement)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Claim Rewards
                </motion.button>
              ) : achievement.dateUnlocked ? (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-600 py-3 px-4 rounded-xl font-semibold"
                >
                  ✓ Claimed
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-xl font-semibold"
                >
                  In Progress...
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievement Unlocked Modal */}
      <AnimatePresence>
        {showUnlockedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getTierColor(showUnlockedModal.tier)} flex items-center justify-center`}>
                  {getTierIcon(showUnlockedModal.tier)}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Achievement Unlocked!</h3>
                <h4 className="text-xl font-semibold text-gray-700 mb-2">{showUnlockedModal.name}</h4>
                <p className="text-gray-600 mb-4">{showUnlockedModal.description}</p>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <p className="text-green-800 font-semibold">
                    +{showUnlockedModal.rewards.turfTokens.toLocaleString()} $TURF
                  </p>
                  <p className="text-green-700">
                    +{showUnlockedModal.rewards.experience} Experience
                  </p>
                  {showUnlockedModal.rewards.title && (
                    <p className="text-green-700">
                      Title: "{showUnlockedModal.rewards.title}"
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;