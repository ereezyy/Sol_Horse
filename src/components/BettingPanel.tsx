import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Calculator,
  Trophy,
  Clock,
  Star
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Race, HorseNFT, Bet } from '../types';

interface BettingPanelProps {
  race: Race;
  horses: HorseNFT[];
}

const BettingPanel: React.FC<BettingPanelProps> = ({ race, horses }) => {
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [betType, setBetType] = useState<'Win' | 'Place' | 'Show' | 'Exacta' | 'Trifecta'>('Win');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [secondPick, setSecondPick] = useState<string | null>(null);
  const [thirdPick, setThirdPick] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { player, placeBet, addNotification } = useGameStore();

  // Calculate dynamic odds based on horse performance
  const calculateOdds = (horse: HorseNFT): number => {
    const winRate = horse.stats.races > 0 ? horse.stats.wins / horse.stats.races : 0;
    const baseOdds = winRate > 0.7 ? 2.1 : winRate > 0.5 ? 3.5 : winRate > 0.3 ? 5.2 : 8.5;
    
    // Add some randomness for market dynamics
    const variance = 0.3 + Math.random() * 0.4;
    return Number((baseOdds * variance).toFixed(1));
  };

  const calculatePayout = (): number => {
    if (!selectedHorse) return 0;
    
    const horse = horses.find(h => h.id === selectedHorse);
    if (!horse) return 0;
    
    const odds = calculateOdds(horse);
    
    switch (betType) {
      case 'Win':
        return betAmount * odds;
      case 'Place':
        return betAmount * (odds * 0.6);
      case 'Show':
        return betAmount * (odds * 0.4);
      case 'Exacta':
        return betAmount * odds * 3.5;
      case 'Trifecta':
        return betAmount * odds * 12;
      default:
        return 0;
    }
  };

  const canPlaceBet = (): boolean => {
    if (!player || !selectedHorse || betAmount <= 0) return false;
    if (player.assets.turfBalance < betAmount) return false;
    
    if (betType === 'Exacta' && !secondPick) return false;
    if (betType === 'Trifecta' && (!secondPick || !thirdPick)) return false;
    
    return true;
  };

  const handlePlaceBet = () => {
    if (!canPlaceBet()) return;
    
    const bet: Bet = {
      id: Date.now().toString(),
      playerId: player!.id,
      raceId: race.id,
      horseId: selectedHorse!,
      type: betType,
      amount: betAmount,
      odds: calculateOdds(horses.find(h => h.id === selectedHorse)!),
      potentialPayout: calculatePayout(),
      status: 'Active'
    };
    
    placeBet(bet);
    
    addNotification({
      id: Date.now().toString(),
      type: 'race_result',
      title: 'Bet Placed!',
      message: `${betType} bet of ${betAmount} $TURF placed on ${horses.find(h => h.id === selectedHorse)?.name}`,
      timestamp: Date.now(),
      read: false
    });
    
    setShowConfirmation(false);
    setSelectedHorse(null);
    setBetAmount(100);
  };

  const getBetTypeDescription = (type: string): string => {
    switch (type) {
      case 'Win': return 'Horse must finish 1st';
      case 'Place': return 'Horse must finish 1st or 2nd';
      case 'Show': return 'Horse must finish 1st, 2nd, or 3rd';
      case 'Exacta': return 'Pick 1st and 2nd in exact order';
      case 'Trifecta': return 'Pick 1st, 2nd, and 3rd in exact order';
      default: return '';
    }
  };

  const quickBetAmounts = [50, 100, 250, 500, 1000, 2500];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Place Your Bets</h2>
            <p className="text-sm text-gray-600">{race.name} • {race.distance}m</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Available Balance</p>
          <p className="text-lg font-bold text-green-600">
            {player?.assets.turfBalance.toLocaleString() || '0'} $TURF
          </p>
        </div>
      </div>

      {/* Bet Type Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Bet Type</h3>
        <div className="grid grid-cols-5 gap-2">
          {(['Win', 'Place', 'Show', 'Exacta', 'Trifecta'] as const).map((type) => (
            <motion.button
              key={type}
              onClick={() => setBetType(type)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                betType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold text-sm">{type}</div>
              <div className="text-xs mt-1">
                {type === 'Win' && '1st'}
                {type === 'Place' && '1st-2nd'}
                {type === 'Show' && '1st-3rd'}
                {type === 'Exacta' && '1st+2nd'}
                {type === 'Trifecta' && '1st+2nd+3rd'}
              </div>
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">{getBetTypeDescription(betType)}</p>
      </div>

      {/* Horse Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Horse(s)</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {horses.map((horse) => {
            const odds = calculateOdds(horse);
            const isSelected = selectedHorse === horse.id;
            
            return (
              <motion.div
                key={horse.id}
                onClick={() => setSelectedHorse(horse.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                      horse.genetics.coatColor === 'Bay' ? 'from-amber-800 to-amber-900' :
                      horse.genetics.coatColor === 'Black' ? 'from-gray-900 to-black' :
                      horse.genetics.coatColor === 'Chestnut' ? 'from-red-800 to-red-900' :
                      'from-amber-700 to-amber-800'
                    } flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {horse.name.charAt(0)}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{horse.name}</h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(horse.genetics.baseSpeed / 20)
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>{horse.genetics.bloodline}</span>
                        <span>{horse.stats.wins}W / {horse.stats.races}R</span>
                        <span>{horse.stats.races > 0 ? ((horse.stats.wins / horse.stats.races) * 100).toFixed(1) : '0'}% WR</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{odds}:1</div>
                    <div className="text-xs text-gray-500">odds</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Additional Picks for Exacta/Trifecta */}
      {(betType === 'Exacta' || betType === 'Trifecta') && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Picks</h3>
          
          {betType === 'Exacta' && (
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-2">2nd Place</label>
              <select
                value={secondPick || ''}
                onChange={(e) => setSecondPick(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select horse for 2nd place</option>
                {horses.filter(h => h.id !== selectedHorse).map(horse => (
                  <option key={horse.id} value={horse.id}>{horse.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {betType === 'Trifecta' && (
            <>
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-2">2nd Place</label>
                <select
                  value={secondPick || ''}
                  onChange={(e) => setSecondPick(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select horse for 2nd place</option>
                  {horses.filter(h => h.id !== selectedHorse).map(horse => (
                    <option key={horse.id} value={horse.id}>{horse.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-2">3rd Place</label>
                <select
                  value={thirdPick || ''}
                  onChange={(e) => setThirdPick(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select horse for 3rd place</option>
                  {horses.filter(h => h.id !== selectedHorse && h.id !== secondPick).map(horse => (
                    <option key={horse.id} value={horse.id}>{horse.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bet Amount */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Bet Amount</h3>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {quickBetAmounts.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => setBetAmount(amount)}
              className={`p-2 rounded-lg text-sm font-medium transition-all ${
                betAmount === amount
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {amount >= 1000 ? `${amount / 1000}K` : amount}
            </motion.button>
          ))}
        </div>
        
        {/* Custom Amount Input */}
        <div className="relative">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter custom amount"
            min="1"
            max={player?.assets.turfBalance || 0}
          />
          <DollarSign className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Bet Summary */}
      {selectedHorse && betAmount > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Bet Summary</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Horse:</span>
              <span className="font-medium">{horses.find(h => h.id === selectedHorse)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bet Type:</span>
              <span className="font-medium">{betType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{betAmount.toLocaleString()} $TURF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Odds:</span>
              <span className="font-medium">{calculateOdds(horses.find(h => h.id === selectedHorse)!)}:1</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between">
              <span className="font-semibold text-gray-800">Potential Payout:</span>
              <span className="font-bold text-green-600">{calculatePayout().toLocaleString()} $TURF</span>
            </div>
          </div>
        </div>
      )}

      {/* Place Bet Button */}
      <motion.button
        onClick={() => setShowConfirmation(true)}
        disabled={!canPlaceBet()}
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
          canPlaceBet()
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={canPlaceBet() ? { y: -2 } : {}}
        whileTap={canPlaceBet() ? { y: 0 } : {}}
      >
        {!selectedHorse ? 'Select a Horse' :
         betAmount <= 0 ? 'Enter Bet Amount' :
         (player?.assets.turfBalance || 0) < betAmount ? 'Insufficient Balance' :
         'Place Bet'}
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Your Bet</h3>
                <p className="text-gray-600">Please review your bet details before confirming</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Horse:</span>
                  <span className="font-medium">{horses.find(h => h.id === selectedHorse)?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Bet Type:</span>
                  <span className="font-medium">{betType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{betAmount.toLocaleString()} $TURF</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-gray-800">Potential Payout:</span>
                  <span className="font-bold text-green-600">{calculatePayout().toLocaleString()} $TURF</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlaceBet}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  Confirm Bet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BettingPanel;