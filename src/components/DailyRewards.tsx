import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Gift, 
  Star, 
  Check, 
  TrendingUp,
  DollarSign,
  Package,
  Sparkles,
  Clock,
  Trophy,
  Users,
  Layers,
  Heart,
  Zap
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface RewardTier {
  day: number;
  rewards: {
    turfTokens: number;
    items?: string[];
    specialItems?: string[];
  };
  claimed: boolean;
}

interface MonthlyLoginCalendar {
  month: string;
  days: {
    day: number;
    claimed: boolean;
    current: boolean;
    reward: string;
    special: boolean;
  }[];
}

const DailyRewards: React.FC = () => {
  const { player, updatePlayerBalance, addNotification } = useGameStore();
  const [rewards, setRewards] = useState<RewardTier[]>([]);
  const [calendar, setCalendar] = useState<MonthlyLoginCalendar | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [showClaimedAnimation, setShowClaimedAnimation] = useState(false);
  const [claimedReward, setClaimedReward] = useState<any | null>(null);

  useEffect(() => {
    generateRewards();
    generateCalendar();
  }, [player?.stats.lastCheckIn]);

  const generateRewards = () => {
    const rewardTiers: RewardTier[] = [
      {
        day: 1,
        rewards: { turfTokens: 1000 },
        claimed: player?.stats.consecutiveCheckIns === 1
      },
      {
        day: 3,
        rewards: { turfTokens: 2500, items: ['Basic Training Boost'] },
        claimed: player?.stats.consecutiveCheckIns >= 3
      },
      {
        day: 7,
        rewards: { turfTokens: 5000, items: ['Speed Training Manual'] },
        claimed: player?.stats.consecutiveCheckIns >= 7
      },
      {
        day: 14,
        rewards: { turfTokens: 10000, items: ['Premium Breeding Token'] },
        claimed: player?.stats.consecutiveCheckIns >= 14
      },
      {
        day: 21,
        rewards: { turfTokens: 15000, specialItems: ['Mystery Genetic Enhancer'] },
        claimed: player?.stats.consecutiveCheckIns >= 21
      },
      {
        day: 30,
        rewards: { turfTokens: 30000, specialItems: ['Legendary Horse Egg'] },
        claimed: player?.stats.consecutiveCheckIns >= 30
      }
    ];

    setRewards(rewardTiers);
  };

  const generateCalendar = () => {
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const isSpecial = day % 7 === 0; // Every 7th day is special
      const isCurrent = day === date.getDate();
      
      return {
        day,
        claimed: day < date.getDate() && Math.random() > 0.2, // Simulate past days (mostly claimed)
        current: isCurrent,
        reward: isSpecial ? 'Special Reward' : `${1000 + day * 100} $TURF`,
        special: isSpecial
      };
    });
    
    setCalendar({ month, days });
    setCurrentMonth(month);
  };

  const claimReward = (tier: RewardTier) => {
    if (!player || tier.claimed || player.stats.consecutiveCheckIns < tier.day) return;
    
    // Update reward as claimed
    const updatedRewards = rewards.map(r => r.day === tier.day ? { ...r, claimed: true } : r);
    setRewards(updatedRewards);
    
    // Add rewards to player
    updatePlayerBalance(tier.rewards.turfTokens);
    
    // Show animation
    setClaimedReward(tier.rewards);
    setShowClaimedAnimation(true);
    
    // Hide animation after delay
    setTimeout(() => {
      setShowClaimedAnimation(false);
      setClaimedReward(null);
    }, 3000);
    
    // Add notification
    addNotification({
      id: Date.now().toString(),
      type: 'quest_complete',
      title: 'Login Reward Claimed!',
      message: `You received ${tier.rewards.turfTokens.toLocaleString()} $TURF and ${
        tier.rewards.items?.length || tier.rewards.specialItems?.length || 0
      } items!`,
      timestamp: Date.now(),
      read: false
    });
  };

  const getRewardIcon = (day: number) => {
    if (day >= 30) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (day >= 21) return <Sparkles className="w-6 h-6 text-purple-500" />;
    if (day >= 14) return <Heart className="w-6 h-6 text-pink-500" />;
    if (day >= 7) return <Star className="w-6 h-6 text-blue-500" />;
    if (day >= 3) return <Zap className="w-6 h-6 text-green-500" />;
    return <Gift className="w-6 h-6 text-emerald-500" />;
  };

  const getCurrentReward = () => {
    if (!player) return null;
    
    const nextTier = rewards.find(r => r.day > player.stats.consecutiveCheckIns);
    if (!nextTier) return rewards[rewards.length - 1];
    
    const previousTier = rewards
      .filter(r => r.day <= player.stats.consecutiveCheckIns)
      .sort((a, b) => b.day - a.day)[0];
    
    return previousTier;
  };

  const getDaysUntilNextReward = () => {
    if (!player) return 0;
    
    const nextTier = rewards.find(r => r.day > player.stats.consecutiveCheckIns);
    if (!nextTier) return 0;
    
    return nextTier.day - player.stats.consecutiveCheckIns;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Rewards</h1>
              <p className="text-gray-600">Check in daily to claim rewards and build your streak</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Streak</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">
                {player?.stats.consecutiveCheckIns || 0} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Check-in Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Login Streak Rewards</h3>
          
          <div className="flex flex-wrap gap-4">
            {rewards.map((tier) => (
              <div 
                key={tier.day}
                className={`relative flex-1 min-w-[150px] p-4 rounded-xl border-2 ${
                  tier.claimed ? 'border-green-300 bg-green-50' : 
                  player?.stats.consecutiveCheckIns >= tier.day ? 'border-blue-300 bg-blue-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Checkmark for claimed rewards */}
                {tier.claimed && (
                  <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* Day indicator */}
                <div className="flex items-center gap-2 mb-3">
                  {getRewardIcon(tier.day)}
                  <span className="font-bold text-gray-800">Day {tier.day}</span>
                </div>
                
                {/* Rewards */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {tier.rewards.turfTokens.toLocaleString()} $TURF
                    </span>
                  </div>
                  
                  {tier.rewards.items && tier.rewards.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                  
                  {tier.rewards.specialItems && tier.rewards.specialItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">{item}</span>
                    </div>
                  ))}
                </div>
                
                {/* Claim button */}
                {!tier.claimed && player?.stats.consecutiveCheckIns >= tier.day && (
                  <button
                    onClick={() => claimReward(tier)}
                    className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
                  >
                    Claim Now
                  </button>
                )}
                
                {/* Days remaining */}
                {!tier.claimed && player?.stats.consecutiveCheckIns < tier.day && (
                  <p className="w-full mt-3 py-2 px-3 bg-gray-200 text-gray-600 rounded-lg text-sm text-center">
                    {tier.day - (player?.stats.consecutiveCheckIns || 0)} days left
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Progress</h3>
          
          {calendar && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700">{calendar.month}</h4>
              
              <div className="grid grid-cols-7 gap-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div key={idx} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                
                {/* Empty days for correct starting position */}
                {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() - 1 }, (_, i) => (
                  <div key={`empty-${i}`} className="p-1"></div>
                ))}
                
                {/* Calendar days */}
                {calendar.days.map((day) => (
                  <div 
                    key={day.day}
                    className={`rounded-md p-1 text-center ${
                      day.claimed ? 'bg-green-100' : 
                      day.current ? 'bg-blue-100 ring-2 ring-blue-400' : 
                      'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-medium">{day.day}</div>
                    {day.claimed && (
                      <div className="flex justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                    )}
                    {day.special && !day.claimed && (
                      <div className="flex justify-center">
                        <Star className="w-3 h-3 text-yellow-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
                  <span className="text-gray-600">Claimed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded-sm"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-gray-600">Special</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Streak Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Your Login Streak
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-center items-center bg-purple-50 rounded-xl p-6">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold text-purple-600">{player?.stats.consecutiveCheckIns || 0}</span>
            </div>
            <p className="font-semibold text-gray-800">Current Streak</p>
            <p className="text-sm text-gray-600 mt-1">Consecutive Days</p>
          </div>
          
          <div className="md:col-span-2">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress to Next Reward</span>
                <span className="text-sm text-gray-600">
                  {getCurrentReward()?.day || 0}/{rewards.find(r => r.day > (player?.stats.consecutiveCheckIns || 0))?.day || 30}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full"
                  style={{ width: `${(player?.stats.consecutiveCheckIns || 0) / (rewards.find(r => r.day > (player?.stats.consecutiveCheckIns || 0))?.day || 30) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {getDaysUntilNextReward()} days until next reward tier
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Streak Benefits</h4>
                  <p className="text-sm text-yellow-700 mb-2">Keep your streak going to maximize rewards!</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Daily streak bonuses increase with consecutive days</li>
                    <li>• Unlock special rewards at day 7, 14, 21, and 30</li>
                    <li>• Higher chance of rare items in reward crates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation for claimed reward */}
      <AnimatePresence>
        {showClaimedAnimation && claimedReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ 
                y: [-20, 20, -10, 10, 0],
                scale: [1, 1.1, 0.9, 1.05, 1]
              }}
              transition={{ duration: 2 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 rounded-2xl shadow-lg text-white text-center"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-2">Reward Claimed!</h3>
              <p className="text-xl">{claimedReward.turfTokens.toLocaleString()} $TURF</p>
              
              {claimedReward.items && claimedReward.items.length > 0 && (
                <div className="mt-2">
                  {claimedReward.items.map((item, idx) => (
                    <p key={idx} className="text-green-100">+ {item}</p>
                  ))}
                </div>
              )}
              
              {claimedReward.specialItems && claimedReward.specialItems.length > 0 && (
                <div className="mt-2">
                  {claimedReward.specialItems.map((item, idx) => (
                    <p key={idx} className="text-yellow-200 font-semibold">✨ {item}</p>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyRewards;