import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Gift, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Star,
  TrendingUp,
  Trophy,
  X
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const DailyCheckIn: React.FC = () => {
  const { player, performDailyCheckIn, getCheckInStatus } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [animation, setAnimation] = useState(false);
  const [status, setStatus] = useState({
    canClaim: true,
    timeUntilNext: 0,
    streak: 0
  });

  useEffect(() => {
    // Check if player has never checked in and show modal automatically
    if (player && !player.stats.lastCheckIn) {
      setShowModal(true);
    }
    
    // Update status initially
    updateStatus();
    
    // Set up interval to update time remaining
    const interval = setInterval(() => {
      updateStatus();
      updateTimeRemaining();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [player]);

  const updateStatus = () => {
    if (!player) return;
    setStatus(getCheckInStatus());
  };

  const updateTimeRemaining = () => {
    if (!player || status.canClaim) {
      setTimeRemaining('');
      return;
    }

    const timeLeft = status.timeUntilNext;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    setTimeRemaining(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  };

  const claimDailyReward = () => {
    if (performDailyCheckIn()) {
      setAnimation(true);
      // Update status after claiming
      updateStatus();
      
      // Reset animation state after it completes
      setTimeout(() => {
        setAnimation(false);
      }, 2000);
    }
  };

  if (!player) return null;

  const getStreakBonusAmount = () => {
    return Math.min(1000, (status.streak + 1) * 100);
  };

  const getTotalReward = () => {
    return 1000 + getStreakBonusAmount();
  };

  return (
    <>
      {/* Button to open modal */}
      <div 
        onClick={() => setShowModal(true)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
          status.canClaim 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-blue-50 text-blue-600'
        }`}
      >
        {status.canClaim ? (
          <>
            <Gift className="w-5 h-5" />
            <span className="font-semibold">Claim</span>
          </>
        ) : (
          <>
            <Clock className="w-5 h-5" />
            <span>{timeRemaining}</span>
          </>
        )}

        {/* Streak indicator */}
        {status.streak > 0 && (
          <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {status.streak}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Daily Check-In</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Current streak */}
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">Current Streak</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-purple-700">{status.streak}</span>
                    <span className="text-purple-600">days</span>
                  </div>
                </div>
              </div>

              {/* Weekly calendar */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Weekly Progress</h4>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-lg p-3 text-center ${
                        i < status.streak % 7 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : i === status.streak % 7 && status.canClaim
                          ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                          : i === status.streak % 7
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        {['M','T','W','T','F','S','S'][i]}
                      </div>
                      <div className="flex justify-center mt-1">
                        {i < status.streak % 7 ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border ${
                            i === status.streak % 7 
                              ? 'border-blue-500' 
                              : 'border-gray-300'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Today's Rewards</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Daily Reward</p>
                    <p className="text-xl font-bold text-green-600">1,000 $TURF</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-1">Streak Bonus</p>
                    <p className="text-xl font-bold text-yellow-600">+{getStreakBonusAmount()} $TURF</p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="flex justify-center">
                <motion.button
                  onClick={claimDailyReward}
                  disabled={!status.canClaim || animation}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-3 ${
                    !status.canClaim
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  }`}
                  whileHover={{ scale: status.canClaim ? 1.03 : 1 }}
                  whileTap={{ scale: status.canClaim ? 0.97 : 1 }}
                  animate={animation ? { 
                    scale: [1, 1.05, 1],
                    transition: { duration: 0.5 }
                  } : {}}
                >
                  {animation ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Claimed {getTotalReward().toLocaleString()} $TURF!</span>
                    </>
                  ) : status.canClaim ? (
                    <>
                      <Gift className="w-5 h-5" />
                      <span>Claim {getTotalReward().toLocaleString()} $TURF</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5" />
                      <span>Next reward in {timeRemaining}</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Upcoming milestone */}
              {status.streak > 0 && (
                <div className="mt-6 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">Next Milestone</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.ceil(status.streak / 7) * 7 - status.streak} days left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(status.streak % 7) / 7 * 100}%` }}
                      className="bg-purple-500 h-2 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    7-day milestone: Special reward box with rare items!
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyCheckIn;