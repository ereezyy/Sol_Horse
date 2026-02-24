import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart } from 'lucide-react';
import { HorseNFT, MarketplaceListing } from '../types';

interface MarketplaceItemProps {
  listing: MarketplaceListing;
  horse: HorseNFT;
  viewMode: 'grid' | 'list';
  onBuy: (listing: MarketplaceListing) => void;
  isGuest: boolean;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Legendary': return 'from-yellow-400 to-orange-500';
    case 'Epic': return 'from-purple-400 to-pink-500';
    case 'Rare': return 'from-blue-400 to-indigo-500';
    case 'Uncommon': return 'from-green-400 to-emerald-500';
    default: return 'from-gray-400 to-gray-500';
  }
};

const MarketplaceItem: React.FC<MarketplaceItemProps> = ({
  listing,
  horse,
  viewMode,
  onBuy,
  isGuest
}) => {
  if (viewMode === 'grid') {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Horse Image Placeholder */}
        <div className={`h-48 bg-gradient-to-br ${getRarityColor(horse.genetics.rarity)} relative`}>
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(horse.genetics.rarity)}`}>
              {horse.genetics.rarity}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-black bg-opacity-50 rounded-full p-2">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-xs ml-1">{listing.views}</span>
            </div>
            <div className="bg-black bg-opacity-50 rounded-full p-2">
              <Heart className="w-4 h-4 text-white" />
              <span className="text-white text-xs ml-1">{listing.watchers.length}</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{horse.name}</h3>
            <p className="text-sm opacity-90">{horse.genetics.bloodline}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-lg font-bold text-green-600">
                {horse.stats.races > 0 ? ((horse.stats.wins / horse.stats.races) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Stats</p>
              <p className="text-lg font-bold text-blue-600">
                {Math.round((horse.genetics.baseSpeed + horse.genetics.stamina + horse.genetics.agility + horse.genetics.intelligence + horse.genetics.temperament) / 5)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-800">{listing.price.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{isGuest ? 'GC' : '$TURF'}</p>
            </div>
            {listing.negotiable && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Negotiable
              </span>
            )}
          </div>

          <button
            onClick={() => onBuy(listing)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all"
          >
            Buy Now
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-6 hover:shadow-xl transition-all"
      whileHover={{ scale: 1.01 }}
    >
      <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getRarityColor(horse.genetics.rarity)} flex items-center justify-center`}>
        <span className="text-white font-bold text-2xl">{horse.name.charAt(0)}</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-gray-800">{horse.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(horse.genetics.rarity)}`}>
            {horse.genetics.rarity}
          </span>
        </div>
        <p className="text-gray-600 mb-2">{horse.genetics.bloodline} • {horse.stats.wins}W/{horse.stats.races}R</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Listed {Math.floor((Date.now() - listing.listedAt) / 86400000)} days ago</span>
          <span>{listing.views} views</span>
          <span>{listing.watchers.length} watching</span>
        </div>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-gray-800">{listing.price.toLocaleString()}</p>
        <p className="text-sm text-gray-600 mb-3">$TURF</p>
        <button
          onClick={() => onBuy(listing)}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
        >
          Buy Now
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(MarketplaceItem);
