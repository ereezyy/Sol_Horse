import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Calendar, 
  CheckCircle,
  XCircle,
  DollarSign,
  Trophy,
  Clock
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface DailyRewardPopupProps {
  onClose: () => void;
}

const DailyRewardPopup: React.FC<DailyRewardPopupProps> = ({ onClose }) => {
  const { player, updatePlayerBalance, addNotification } = useGameStore();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  
  const isGuest = player?.walletAddress?.startsWith('guest_');
  
  // Calculate reward based on streak
  const getRewardAmount = () => {
    if (!player) return { turf: 0, guestCoins: 0 };
    
    const streak = player.stats.consecutiveCheckIns || 0;
    const streakBonus = Math.min(1000, streak * 100);
    
    return {
      turf: isGuest ? 0 : 1000 + streakBonus,
      guestCoins: isGuest ? 10000 + (streak * 5000) : 0
    };
  };
  
  const reward = getRewardAmount();

  // Animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClaimReward = () => {
    if (!player || rewardClaimed) return;
    
    // Update player balance based on account type
    if (isGuest) {
      // Update guest coins instead of TURF
      const updatedPlayer = {
        ...player,
        assets: {
          ...player.assets,
          guestCoins: (player.assets.guestCoins || 0) + reward.guestCoins
        },
        stats: {
          ...player.stats,
          lastCheckIn: Date.now(),
          consecutiveCheckIns: (player.stats.consecutiveCheckIns || 0) + 1
        }
      };
      
      useGameStore.setState({ player: updatedPlayer });
      
      // Add notification
      addNotification({
        id: `daily-reward-${Date.now()}`,
        type: 'quest_complete',
        title: 'Daily Reward Claimed!',
        message: `You received ${reward.guestCoins.toLocaleString()} Guest Coins!`,
        timestamp: Date.now(),
        read: false
      });
    } else {
      // Update real TURF for wallet users
      updatePlayerBalance(reward.turf);
      
      // Add notification
      addNotification({
        id: `daily-reward-${Date.now()}`,
        type: 'quest_complete',
        title: 'Daily Reward Claimed!',
        message: `You received ${reward.turf.toLocaleString()} $TURF tokens!`,
        timestamp: Date.now(),
        read: false
      });
    }
    
    setRewardClaimed(true);
    
    // Close after a delay
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl max-w-md w-full mx-4 shadow-2xl overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Animated Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: 4 + Math.random() * 6,
                    height: 4 + Math.random() * 6,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0.1 + Math.random() * 0.3
                  }}
                  animate={{
                    y: [0, -100],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
            
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-yellow-500 p-3 rounded-full mb-2 shadow-glow">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Daily Reward</h2>
            </motion.div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-blue-200 mb-2">Thanks for returning to Equus Ascendant!</p>
              
              <div className="flex items-center justify-center gap-2 text-white mb-4">
                <Calendar className="w-5 h-5 text-blue-300" />
                <p className="font-semibold">
                  Day {(player?.stats.consecutiveCheckIns || 0) + 1} Streak
                </p>
              </div>
              
              {/* Reward Display */}
              <motion.div
                className={`bg-gradient-to-r ${isGuest ? 'from-amber-900 to-yellow-900' : 'from-green-900 to-emerald-900'} rounded-xl p-5 mb-6 relative overflow-hidden`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative z-10">
                  <p className="text-lg text-blue-100 mb-3">Today's Reward</p>
                  
                  <motion.div
                    className="flex items-center justify-center gap-3"
                    initial={{ scale: 0.8 }}
                    animate={hasAnimated ? { scale: [0.8, 1.2, 1] } : { scale: 0.8 }}
                    transition={{ duration: 0.6 }}
                  >
                    {isGuest ? (
                      <>
                        <Star className="w-6 h-6 text-yellow-400" />
                        <p className="text-3xl font-bold text-yellow-300">
                          {reward.guestCoins.toLocaleString()} GC
                        </p>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-6 h-6 text-green-400" />
                        <p className="text-3xl font-bold text-green-300">
                          {reward.turf.toLocaleString()} $TURF
                        </p>
                      </>
                    )}
                  </motion.div>
                  
                  <p className="text-sm mt-2 text-blue-200">
                    {isGuest ? 'Guest Coins' : 'TURF Tokens'}
                  </p>
                </div>
                
                {/* Background decoration */}
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  {isGuest ? (
                    <Star className="w-32 h-32 text-yellow-300" />
                  ) : (
                    <DollarSign className="w-32 h-32 text-green-300" />
                  )}
                </div>
              </motion.div>
              
              {/* Guest Mode Message */}
              {isGuest && (
                <motion.div
                  className="bg-blue-900 bg-opacity-50 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm text-white mb-1">
                        <span className="font-bold text-amber-300">Guest Coins (GC)</span> are virtual currency with no real-world value.
                      </p>
                      <p className="text-xs text-blue-200">
                        Connect a wallet to earn real $TURF tokens and NFT horses!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Streak Information */}
              <motion.div
                className="flex items-center gap-3 mb-6 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-1 text-blue-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Next reward in 24h</span>
                </div>
              </motion.div>
              
              {/* Claim Button */}
              <motion.button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  rewardClaimed 
                    ? 'bg-green-600 text-white cursor-not-allowed' 
                    : isGuest
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
                }`}
                onClick={handleClaimReward}
                disabled={rewardClaimed}
                whileHover={!rewardClaimed ? { scale: 1.03 } : {}}
                whileTap={!rewardClaimed ? { scale: 0.98 } : {}}
              >
                {rewardClaimed ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Reward Claimed!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5" />
                    <span>Claim Daily Reward</span>
                  </div>
                )}
              </motion.button>
              
              {/* Wallet Promo for Guest Users */}
              {isGuest && !rewardClaimed && (
                <p className="text-xs text-center mt-4 text-blue-300">
                  Wallet users earn 10x more valuable $TURF tokens!
                </p>
              )}
              
              {/* Small skip button */}
              {!rewardClaimed && (
                <button
                  className="text-xs text-blue-400 hover:text-blue-300 mt-4 mx-auto block"
                  onClick={onClose}
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyRewardPopup;