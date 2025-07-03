import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap,
  Trophy,
  Star,
  Crown,
  Heart,
  Shield,
  Wallet,
  User,
  HelpCircle
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

// Random horse racing and blockchain fun facts
const funFacts = [
  "The fastest recorded speed of a racehorse is approximately 55 mph (88.5 km/h).",
  "Solana can process up to 65,000 transactions per second.",
  "The longest horse race in the world is the Mongol Derby at 1,000 kilometers.",
  "NFT horse racing games have generated over $250 million in trading volume.",
  "A thoroughbred horse's heart can weigh up to 10 pounds, about 2% of its body weight.",
  "The most expensive virtual racehorse NFT sold for over $125,000.",
  "Secretariat, one of the greatest racehorses of all time, had a heart nearly three times the size of an average horse.",
  "Digital horse racing uses provably fair algorithms to ensure race outcomes cannot be manipulated.",
  "The Kentucky Derby trophy contains over 2 pounds of 14-karat gold.",
  "Players have earned real-world incomes through play-to-earn horse racing games.",
  "Horse racing is one of the oldest sports, dating back to ancient Greek Olympic Games in 648 BCE.",
  "Some blockchain gaming horses have better odds than real-world racehorses due to their genetic traits.",
  "Only 13 horses have won the Triple Crown since 1919.",
  "NFT horse values are determined by rarity traits, lineage, and racing performance."
];

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(Math.floor(Math.random() * funFacts.length));
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const { setPlayer } = useGameStore();

  // Generate a random guest player
  const createGuestPlayer = () => {
    const guestId = `Guest_${Math.random().toString(36).substr(2, 6)}`;
    
    return {
      id: Date.now().toString(),
      walletAddress: `guest_${Date.now()}`, // Special format to identify as guest
      username: guestId,
      profile: {
        avatar: '',
        bio: 'Guest horse trainer trying out the platform',
        joinDate: Date.now(),
        country: 'Global',
        stableName: `${guestId}'s Stable`
      },
      assets: {
        turfBalance: 0, // No real $TURF for guests
        racingCredits: 25000, // Guest currency
        solBalance: 0, // No real SOL for guests
        guestCoins: 200000, // Guest currency (like Stake.com's GC)
        horses: [],
        facilities: [
          {
            id: '1',
            type: 'Stable',
            level: 2,
            capacity: 8,
            upgradeCost: 10000,
            benefits: {
              trainingEfficiency: 1.1,
              recoverySpeed: 1.05,
              breedingSuccessRate: 1.0
            }
          }
        ]
      },
      stats: {
        totalRaces: 0,
        wins: 0,
        winRate: 0,
        totalEarnings: 0,
        totalSpent: 0,
        netProfit: 0,
        reputation: 100,
        lastCheckIn: null,
        consecutiveCheckIns: 0,
        achievements: [
          {
            id: '1',
            name: 'Welcome!',
            description: 'Started your racing journey as a guest',
            icon: 'star',
            rarity: 'Common',
            unlockedAt: Date.now(),
            rewards: {
              turfTokens: 0,
              guestCoins: 50000,
              title: 'Newcomer'
            }
          }
        ]
      },
      social: {
        guildId: undefined,
        friends: [],
        followers: 0,
        following: 0
      },
      preferences: {
        notifications: true,
        publicProfile: true,
        allowBreedingRequests: true,
        dailyCheckInReminder: true
      }
    };
  };

  // Simulate loading and rotate fun facts
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + (2 + Math.random() * 5);
        
        if (newProgress >= 100) {
          clearInterval(loadingInterval);
          clearInterval(factInterval);
          setLoading(false);
          setShowOptions(true);
          return 100;
        }
        return newProgress;
      });
    }, 150);
    
    // Rotate facts every 5 seconds
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % funFacts.length);
    }, 5000);
    
    return () => {
      clearInterval(loadingInterval);
      clearInterval(factInterval);
    };
  }, []);

  const handleContinueAsGuest = () => {
    const guestPlayer = createGuestPlayer();
    setPlayer(guestPlayer);
    onContinue();
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center z-50 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background elements */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: 2 + Math.random() * 4,
              height: 2 + Math.random() * 4,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -1000],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      <div className="max-w-2xl w-full px-8">
        {/* Logo and Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">Equus Ascendant</h1>
          <p className="text-blue-200">The Ultimate Solana Horse Racing Experience</p>
        </motion.div>
        
        {/* Fun Facts */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentFactIndex}
            className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-xl p-6 mb-8 border border-white border-opacity-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <HelpCircle className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-200 mb-2">Did you know?</h3>
                <p className="text-white text-base leading-relaxed">{funFacts[currentFactIndex]}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Loading Bar or Connection Options */}
        {loading ? (
          <div className="mb-12">
            <div className="flex justify-between text-sm text-blue-300 mb-2">
              <span>Loading Equus Ascendant</span>
              <span>{Math.min(100, Math.floor(loadingProgress))}%</span>
            </div>
            <div className="w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {showOptions && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Connect Wallet Option */}
                  <motion.div
                    className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 cursor-pointer"
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onContinue}
                  >
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
                      <p className="text-blue-200 mb-4">Full experience with NFT ownership</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-900 bg-opacity-50 rounded-full text-xs text-blue-300">Permanent Progress</span>
                        <span className="px-3 py-1 bg-blue-900 bg-opacity-50 rounded-full text-xs text-blue-300">True Ownership</span>
                        <span className="px-3 py-1 bg-blue-900 bg-opacity-50 rounded-full text-xs text-blue-300">$TURF Rewards</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Play as Guest Option */}
                  <motion.div
                    className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 cursor-pointer"
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueAsGuest}
                  >
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Play as Guest</h3>
                      <p className="text-blue-200 mb-4">Try before you connect</p>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-amber-900 bg-opacity-50 rounded-full text-xs text-amber-300">200,000 GC</span>
                        <span className="px-3 py-1 bg-amber-900 bg-opacity-50 rounded-full text-xs text-amber-300">No Wallet Needed</span>
                        <span className="px-3 py-1 bg-amber-900 bg-opacity-50 rounded-full text-xs text-amber-300">Instant Start</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Currency Explanation */}
                <motion.div 
                  className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-5 border border-purple-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-2" />
                    Currency System
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">$TURF</span>
                      </div>
                      <p className="text-xs text-blue-200">Real value, blockchain-based</p>
                      <p className="text-xs text-blue-200">Available with wallet connection</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">Guest Coins (GC)</span>
                      </div>
                      <p className="text-xs text-blue-200">Virtual currency for guests</p>
                      <p className="text-xs text-blue-200">No real-world value</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Disclaimer */}
        <motion.p
          className="text-blue-300 text-center text-xs mt-8 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
        >
          Powered by Solana • All in-game assets are non-fungible tokens
        </motion.p>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;