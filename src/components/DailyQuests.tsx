import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Trophy, 
  Zap, 
  Heart, 
  Crown, 
  Star, 
  Gift, 
  Clock, 
  CheckCircle,
  RotateCcw,
  Flame,
  Award,
  DollarSign,
  TrendingUp,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  category: 'racing' | 'training' | 'breeding' | 'social' | 'collection';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  requirements: {
    target: number;
    current: number;
  };
  rewards: {
    turfTokens: number;
    experience: number;
    items?: string[];
    reputation?: number;
  };
  expiresAt: number;
  completed: boolean;
  claimed: boolean;
  icon: React.ReactNode;
}

const DailyQuests: React.FC = () => {
  const { player, horses, updatePlayerBalance, addNotification } = useGameStore();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<string>('');

  // Generate quests on component mount
  useEffect(() => {
    generateQuests();
    
    // Update time until refresh every second
    const interval = setInterval(updateTimeUntilRefresh, 1000);
    return () => clearInterval(interval);
  }, []);

  const generateQuests = () => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    const dailyQuests: Quest[] = [
      {
        id: 'daily-race-1',
        title: 'Daily Racer',
        description: 'Complete 3 races with any of your horses',
        type: 'daily',
        category: 'racing',
        difficulty: 'easy',
        requirements: { target: 3, current: 0 },
        rewards: { turfTokens: 1000, experience: 50 },
        expiresAt: now + oneDayMs,
        completed: false,
        claimed: false,
        icon: <Trophy className="w-5 h-5" />
      },
      {
        id: 'daily-train-1',
        title: 'Training Session',
        description: 'Complete 2 training programs',
        type: 'daily',
        category: 'training',
        difficulty: 'easy',
        requirements: { target: 2, current: 0 },
        rewards: { turfTokens: 800, experience: 40, reputation: 5 },
        expiresAt: now + oneDayMs,
        completed: false,
        claimed: false,
        icon: <Zap className="w-5 h-5" />
      },
      {
        id: 'daily-win-1',
        title: 'Victory Lap',
        description: 'Win a race with any horse',
        type: 'daily',
        category: 'racing',
        difficulty: 'medium',
        requirements: { target: 1, current: 0 },
        rewards: { turfTokens: 2000, experience: 100, reputation: 10 },
        expiresAt: now + oneDayMs,
        completed: false,
        claimed: false,
        icon: <Crown className="w-5 h-5" />
      }
    ];

    const weeklyQuests: Quest[] = [
      {
        id: 'weekly-breed-1',
        title: 'Genetic Engineer',
        description: 'Successfully breed 2 horses',
        type: 'weekly',
        category: 'breeding',
        difficulty: 'medium',
        requirements: { target: 2, current: 0 },
        rewards: { turfTokens: 15000, experience: 500, reputation: 50 },
        expiresAt: now + oneWeekMs,
        completed: false,
        claimed: false,
        icon: <Heart className="w-5 h-5" />
      },
      {
        id: 'weekly-earnings-1',
        title: 'High Roller',
        description: 'Earn 50,000 $TURF from racing',
        type: 'weekly',
        category: 'racing',
        difficulty: 'hard',
        requirements: { target: 50000, current: 0 },
        rewards: { turfTokens: 25000, experience: 1000, reputation: 100 },
        expiresAt: now + oneWeekMs,
        completed: false,
        claimed: false,
        icon: <DollarSign className="w-5 h-5" />
      },
      {
        id: 'weekly-collection-1',
        title: 'Stable Master',
        description: 'Own 10 different horses',
        type: 'weekly',
        category: 'collection',
        difficulty: 'medium',
        requirements: { target: 10, current: horses.length },
        rewards: { turfTokens: 20000, experience: 750, items: ['Stable Expansion'] },
        expiresAt: now + oneWeekMs,
        completed: horses.length >= 10,
        claimed: false,
        icon: <Star className="w-5 h-5" />
      }
    ];

    const specialQuests: Quest[] = [
      {
        id: 'special-legendary-1',
        title: 'Legendary Trainer',
        description: 'Train a horse to level 90+ in any stat',
        type: 'special',
        category: 'training',
        difficulty: 'legendary',
        requirements: { target: 90, current: 0 },
        rewards: { turfTokens: 100000, experience: 5000, reputation: 500, items: ['Golden Saddle'] },
        expiresAt: now + oneWeekMs * 4, // 4 weeks
        completed: false,
        claimed: false,
        icon: <Flame className="w-5 h-5" />
      },
      {
        id: 'special-tournament-1',
        title: 'Championship Glory',
        description: 'Win a championship tournament',
        type: 'special',
        category: 'racing',
        difficulty: 'legendary',
        requirements: { target: 1, current: 0 },
        rewards: { turfTokens: 250000, experience: 10000, reputation: 1000, items: ['Championship Trophy'] },
        expiresAt: now + oneWeekMs * 8, // 8 weeks
        completed: false,
        claimed: false,
        icon: <Award className="w-5 h-5" />
      }
    ];

    setQuests([...dailyQuests, ...weeklyQuests, ...specialQuests]);
  };

  const updateTimeUntilRefresh = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeLeft = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    setTimeUntilRefresh(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const claimReward = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    // Update quest as claimed
    setQuests(prev => prev.map(q => 
      q.id === questId ? { ...q, claimed: true } : q
    ));

    // Give rewards
    updatePlayerBalance(quest.rewards.turfTokens);

    addNotification({
      id: Date.now().toString(),
      type: 'quest_complete',
      title: 'Quest Completed!',
      message: `Claimed ${quest.rewards.turfTokens.toLocaleString()} $TURF from "${quest.title}"`,
      timestamp: Date.now(),
      read: false
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'hard': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'racing': return 'text-red-500 bg-red-100';
      case 'training': return 'text-blue-500 bg-blue-100';
      case 'breeding': return 'text-pink-500 bg-pink-100';
      case 'social': return 'text-purple-500 bg-purple-100';
      case 'collection': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getProgressPercentage = (quest: Quest) => {
    return Math.min(100, (quest.requirements.current / quest.requirements.target) * 100);
  };

  const filteredQuests = quests.filter(q => q.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Quests</h1>
              <p className="text-gray-600">Complete challenges to earn rewards and progress</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Refreshes in</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 font-mono">
              {timeUntilRefresh}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          {[
            { id: 'daily', label: 'Daily Quests', icon: Calendar },
            { id: 'weekly', label: 'Weekly Challenges', icon: TrendingUp },
            { id: 'special', label: 'Special Events', icon: Sparkles }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-lg'
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

      {/* Quest Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredQuests.map((quest) => (
            <motion.div
              key={quest.id}
              className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
                quest.completed ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Quest Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(quest.category)}`}>
                      {quest.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 leading-tight">{quest.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quest.difficulty)}`}>
                          {quest.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{quest.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  {quest.completed && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {quest.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">
                      {quest.requirements.current.toLocaleString()}/{quest.requirements.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full transition-all ${
                        quest.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage(quest)}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Rewards */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Rewards</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {quest.rewards.turfTokens.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        {quest.rewards.experience} XP
                      </span>
                    </div>
                    
                    {quest.rewards.reputation && (
                      <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                        <Star className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">
                          +{quest.rewards.reputation} Rep
                        </span>
                      </div>
                    )}
                    
                    {quest.rewards.items && quest.rewards.items.length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">
                          {quest.rewards.items[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6">
                {quest.completed && !quest.claimed ? (
                  <motion.button
                    onClick={() => claimReward(quest.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Claim Rewards
                  </motion.button>
                ) : quest.claimed ? (
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

              {/* Expiry Timer */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    Expires {new Date(quest.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Quest Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quest Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {quests.filter(q => q.completed).length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <RotateCcw className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {quests.filter(q => !q.completed).length}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">
              {quests.filter(q => q.completed && !q.claimed).reduce((sum, q) => sum + q.rewards.turfTokens, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Ready to Claim</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {quests.filter(q => q.completed && !q.claimed).reduce((sum, q) => sum + (q.rewards.experience || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">XP Available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuests;