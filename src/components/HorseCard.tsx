import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { 
  Star, 
  Zap, 
  Heart,
  Target,
  Brain,
  Shield, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  DollarSign 
} from 'lucide-react';
import { HorseNFT } from '../types';

interface HorseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  horse: HorseNFT;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const HorseCard: React.FC<HorseCardProps> = ({ 
  horse, 
  onSelect, 
  isSelected = false,
  showActions = true, 
  compact = false 
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'from-yellow-400 to-orange-500';
      case 'Epic': return 'from-purple-400 to-pink-500';
      case 'Rare': return 'from-blue-400 to-indigo-500';
      case 'Uncommon': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getCoatColorStyle = (color: string) => {
    switch (color) {
      case 'Bay': return 'from-amber-800 to-amber-900';
      case 'Black': return 'from-gray-900 to-black';
      case 'Chestnut': return 'from-red-800 to-red-900';
      case 'Gray': return 'from-gray-500 to-gray-600';
      case 'Palomino': return 'from-yellow-600 to-yellow-700';
      default: return 'from-amber-700 to-amber-800';
    }
  };

  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'baseSpeed': return <Zap className="w-4 h-4" />;
      case 'stamina': return <Heart className="w-4 h-4" />;
      case 'agility': return <Target className="w-4 h-4" />;
      case 'temperament': return <Shield className="w-4 h-4" />;
      case 'intelligence': return <Brain className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getStatColor = (value: number) => {
    if (value >= 90) return 'text-yellow-600 bg-yellow-100';
    if (value >= 80) return 'text-purple-600 bg-purple-100';
    if (value >= 70) return 'text-blue-600 bg-blue-100';
    if (value >= 60) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const winRate = horse.stats.races > 0 ? (horse.stats.wins / horse.stats.races) * 100 : 0;

  if (compact) {
    return (
      <motion.button
        type="button"
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 cursor-pointer"
        whileHover={{ y: -2, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
        onClick={() => onSelect && onSelect(horse.id)}
      >
        <div className="flex items-center gap-3">
          {/* Horse Avatar */}
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getCoatColorStyle(horse.genetics.coatColor)} flex items-center justify-center text-white font-bold`}>
            <span className="text-white font-bold text-lg">
              {horse.name.charAt(0)}
            </span>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">{horse.name}</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(horse.genetics.rarity)}`}>
                {horse.genetics.rarity}
              </div>
            </div>
            <h4 className="font-semibold text-gray-800" data-testid="horse-name">{horse.name}</h4>
            <p className="text-sm text-gray-600">{horse.genetics.bloodline}</p>
          </div>

          {/* Quick Stats */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800" data-testid="horse-record">{horse.stats.wins}W/{horse.stats.races}R</p>
            <p className="text-xs text-gray-600">{winRate.toFixed(1)}% WR</p>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div 
      className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${isSelected ? 'ring-4 ring-blue-500' : ''}`}
      whileHover={{ y: -4, shadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Rarity */}
      <div className={`h-2 bg-gradient-to-r ${getRarityColor(horse.genetics.rarity)}`} />
      
      <div className="p-6">
        {/* Horse Identity */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Horse Avatar */}
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getCoatColorStyle(horse.genetics.coatColor)} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-2xl">
                {horse.name.charAt(0)}
              </span>
            </div>

            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-800">{horse.name}</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(horse.genetics.rarity)}`}>
                  {horse.genetics.rarity}
                </div>
                <p className="text-lg font-bold text-gray-800 win-rate">{winRate.toFixed(1)}%</p>
              </div>
              <p className="text-gray-600 font-medium">{horse.genetics.bloodline}</p>
              <p className="text-sm text-gray-500">Generation {horse.genetics.generation}</p>
            </div>
          </div>

          {/* Price/Value */}
          {horse.isForSale && horse.price && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-lg font-bold text-green-600">{horse.price.toLocaleString()} $TURF</p>
            </div>
          )}
        </div>

        {/* Genetics Stats */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Genetic Traits</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(horse.genetics).map(([key, value]) => {
              if (typeof value === 'number' && ['baseSpeed', 'stamina', 'agility', 'temperament', 'intelligence'].includes(key)) {
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${getStatColor(value)}`}>
                      {getStatIcon(key)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600 capitalize">
                          {key.replace('base', '')}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            value >= 90 ? 'bg-yellow-500' :
                            value >= 80 ? 'bg-purple-500' :
                            value >= 70 ? 'bg-blue-500' :
                            value >= 60 ? 'bg-green-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-2 mx-auto">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{horse.stats.wins}</p>
              <p className="text-xs text-gray-600 wins-count">Wins</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-2 mx-auto">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-800 win-rate">{winRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-600">Win Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mb-2 mx-auto">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{horse.stats.age}</p>
              <p className="text-xs text-gray-600">Months</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mb-2 mx-auto">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-lg font-bold text-gray-800">{(horse.stats.earnings / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-600">Earnings</p>
            </div>
          </div>
        </div>

        {/* Physical Traits */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Physical Traits</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
              {horse.genetics.coatColor}
            </span>
            {horse.genetics.markings.map((marking, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {marking}
              </span>
            ))}
          </div>
        </div>

        {/* Breeding Status */}
        {horse.breeding.canBreed && (
          <div className="mb-6 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-semibold text-pink-800">Available for Breeding</span>
            </div>
            {horse.breeding.studFee && (
              <p className="text-xs text-pink-600">Stud Fee: {horse.breeding.studFee.toLocaleString()} $TURF</p>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3">
            <motion.button
              onClick={() => onSelect && onSelect(horse.id)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors view-details-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Details
            </motion.button>
            
            {horse.isForSale ? (
              <motion.button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                Buy Now
              </motion.button>
            ) : (
              <motion.button
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                Enter Race
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HorseCard;