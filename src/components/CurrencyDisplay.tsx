import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Star, Trophy, HelpCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface CurrencyDisplayProps {
  showHelp?: boolean;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ showHelp = false }) => {
  const { player } = useGameStore();
  const isGuest = player?.walletAddress?.startsWith('guest_');
  
  // Handle tooltip visibility
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Early return if no player
  if (!player) return null;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-xl">
        {/* Guest Mode Indicator */}
        {isGuest && (
          <div className="bg-amber-100 text-amber-800 px-3 py-1 text-xs font-medium rounded-full">
            Guest Mode
          </div>
        )}
        
        {/* Real Currency - Only shown for wallet users */}
        {!isGuest && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-green-700">
                {player.assets.turfBalance?.toLocaleString() || '0'} $TURF
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              <span className="font-semibold text-gray-700">
                {player.assets.solBalance?.toFixed(2) || '0.00'} SOL
              </span>
            </div>
          </>
        )}
        
        {/* Guest Currency */}
        {isGuest && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-amber-700">
                {player.assets.guestCoins?.toLocaleString() || '0'} GC
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Trophy className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-blue-700">
                {player.assets.racingCredits?.toLocaleString() || '0'} RC
              </span>
            </div>
          </>
        )}
        
        {/* Help icon for currency explanation */}
        {showHelp && (
          <div className="relative">
            <button 
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            
            {/* Currency Explanation Tooltip */}
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 right-0 top-8 w-64 p-3 bg-white rounded-lg shadow-lg text-xs text-left"
              >
                {isGuest ? (
                  <>
                    <h4 className="font-bold text-gray-800 mb-1">Guest Mode Currency</h4>
                    <p className="text-gray-600 mb-2">You're using virtual currency with no real value.</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span><strong>GC</strong> (Guest Coins): Main virtual currency</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-blue-500" />
                        <span><strong>RC</strong> (Racing Credits): For race entries</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-blue-600 font-semibold">Connect wallet to earn real $TURF tokens!</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-gray-800 mb-1">Blockchain Currency</h4>
                    <p className="text-gray-600 mb-2">You're using currencies with real value.</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3 text-green-500" />
                        <span><strong>$TURF</strong>: Game token for all transactions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span><strong>SOL</strong>: Solana blockchain's native token</span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyDisplay;