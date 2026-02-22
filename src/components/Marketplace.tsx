import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter,
  Grid, 
  List, 
  Star,
  TrendingUp, 
  DollarSign, 
  Eye, 
  Heart, 
  ShoppingCart,
  Clock,
  Zap,
  Crown,
  Award,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { HorseNFT, MarketplaceListing } from '../types';
import CurrencyDisplay from './CurrencyDisplay';

interface MarketplaceFilters {
  bloodline: string;
  rarity: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'price' | 'rarity' | 'performance' | 'age' | 'recent';
  sortOrder: 'asc' | 'desc';
}

const Marketplace: React.FC = () => {
  const { player, horses, updatePlayerBalance, addNotification } = useGameStore();
  const isGuest = player?.walletAddress?.startsWith('guest_');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MarketplaceFilters>({
    bloodline: 'all',
    rarity: 'all',
    minPrice: 0,
    maxPrice: 1000000,
    sortBy: 'recent',
    sortOrder: 'desc'
  });
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [marketStats, setMarketStats] = useState({
    totalVolume: 0,
    avgPrice: 0,
    totalListings: 0,
    topSale: 0
  });

  useEffect(() => {
    generateMarketplaceListings();
    calculateMarketStats();
  }, [horses]);

  const generateMarketplaceListings = () => {
    // Convert horses for sale to marketplace listings
    const listings: MarketplaceListing[] = horses
      .filter(horse => horse.isForSale && horse.price)
      .map(horse => ({
        id: `listing-${horse.id}`,
        type: 'Horse' as const,
        itemId: horse.id,
        sellerId: horse.owner,
        price: horse.price!,
        currency: 'TURF' as const,
        negotiable: Math.random() > 0.7,
        title: `${horse.name} - ${horse.genetics.rarity} ${horse.genetics.bloodline}`,
        description: `${horse.lore.backstory} Performance: ${horse.stats.wins}W/${horse.stats.races}R`,
        images: [`/horses/${horse.id}.jpg`],
        listedAt: Date.now() - Math.random() * 86400000 * 7,
        expiresAt: Date.now() + 86400000 * 30,
        status: 'Active' as const,
        views: Math.floor(Math.random() * 500),
        watchers: Array.from({ length: Math.floor(Math.random() * 20) }, (_, i) => `watcher-${i}`)
      }));

    setMarketplaceListings(listings);
  };

  const calculateMarketStats = () => {
    const listings = horses.filter(h => h.isForSale && h.price);
    const totalVolume = listings.reduce((sum, h) => sum + (h.price || 0), 0);
    const avgPrice = listings.length > 0 ? totalVolume / listings.length : 0;
    const topSale = Math.max(...listings.map(h => h.price || 0), 0);

    setMarketStats({
      totalVolume,
      avgPrice,
      totalListings: listings.length,
      topSale
    });
  };

  const filteredListings = marketplaceListings.filter(listing => {
    const horse = horses.find(h => h.id === listing.itemId);
    if (!horse) return false;

    // Search filter
    if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Bloodline filter
    if (filters.bloodline !== 'all' && horse.genetics.bloodline !== filters.bloodline) {
      return false;
    }

    // Rarity filter
    if (filters.rarity !== 'all' && horse.genetics.rarity !== filters.rarity) {
      return false;
    }

    // Price filters
    if (listing.price < filters.minPrice || listing.price > filters.maxPrice) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    const horseA = horses.find(h => h.id === a.itemId)!;
    const horseB = horses.find(h => h.id === b.itemId)!;
    
    let comparison = 0;
    switch (filters.sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'rarity': {
        const rarityOrder = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5 };
        comparison = rarityOrder[horseA.genetics.rarity] - rarityOrder[horseB.genetics.rarity];
        break;
      }
      case 'performance': {
        const perfA = horseA.stats.races > 0 ? horseA.stats.wins / horseA.stats.races : 0;
        const perfB = horseB.stats.races > 0 ? horseB.stats.wins / horseB.stats.races : 0;
        comparison = perfA - perfB;
        break;
      }
      case 'age':
        comparison = horseA.stats.age - horseB.stats.age;
        break;
      case 'recent':
        comparison = a.listedAt - b.listedAt;
        break;
    }
    
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  const handlePurchase = async (listing: MarketplaceListing) => {
    const hasSufficientFunds = isGuest 
      ? (player.assets.guestCoins || 0) >= listing.price 
      : player.assets.turfBalance >= listing.price;
    
    if (!player || !hasSufficientFunds) {
      addNotification({
        id: Date.now().toString(),
        type: 'marketplace_sale',
        title: 'Insufficient Funds',
        message: `You need ${listing.price.toLocaleString()} ${isGuest ? 'GC' : '$TURF'} to purchase this horse`,
        timestamp: Date.now(),
        read: false
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For guest mode, handle the transaction differently
    if (isGuest) {
      try {
        // Update guest coins directly in player state
        const updatedPlayer = {
          ...player,
          assets: {
            ...player.assets,
            guestCoins: (player.assets.guestCoins || 0) - listing.price
          }
        };
        
        // Update the game store directly
        useGameStore.setState({ player: updatedPlayer });
        
        // Update the horse ownership directly
        const updatedHorse = horses.find(h => h.id === listing.itemId);
        if (updatedHorse) {
          const modifiedHorse = {
            ...updatedHorse,
            owner: player.walletAddress,
            isForSale: false,
            price: undefined
          };
          
          // Update the horse in the store
          useGameStore.setState({
            horses: horses.map(h => h.id === modifiedHorse.id ? modifiedHorse : h)
          });
        }
      } catch (error) {
        console.error('Error processing guest purchase:', error);
        addNotification({
          id: Date.now().toString(),
          type: 'marketplace_sale',
          title: 'Purchase Failed',
          message: 'There was an error completing your purchase. Please try again.',
          timestamp: Date.now(),
          read: false
        });
        setIsLoading(false);
        return;
      }
    } else {
      // Real wallet user - use the updatePlayerBalance function
      updatePlayerBalance(-listing.price);
    }
    
    // Add purchase notification
    addNotification({
      id: Date.now().toString(),
      type: 'marketplace_sale',
      title: 'Purchase Successful!',
      message: `You successfully purchased ${listing.title} for ${listing.price.toLocaleString()} ${isGuest ? 'GC' : '$TURF'}`,
      timestamp: Date.now(),
      read: false
    });

    setShowBuyModal(false);
    setSelectedListing(null);
    setIsLoading(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'from-yellow-400 to-orange-500';
      case 'Epic': return 'from-purple-400 to-pink-500';
      case 'Rare': return 'from-blue-400 to-indigo-500';
      case 'Uncommon': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Stats Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Horse Marketplace</h1>
            <p className="text-gray-600">Buy and sell champion racing horses</p>
          </div>
          <button
            onClick={generateMarketplaceListings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {(marketStats.totalVolume / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-gray-600">Total Volume ({isGuest ? 'GC' : '$TURF'})</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {(marketStats.avgPrice / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-gray-600">Avg Price</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <ShoppingCart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{marketStats.totalListings}</p>
            <p className="text-sm text-gray-600">Active Listings</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">
              {(marketStats.topSale / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-gray-600">Top Sale</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search horses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.bloodline}
              onChange={(e) => setFilters({...filters, bloodline: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bloodlines</option>
              <option value="Arabian">Arabian</option>
              <option value="Thoroughbred">Thoroughbred</option>
              <option value="Quarter Horse">Quarter Horse</option>
              <option value="Mustang">Mustang</option>
              <option value="Legendary">Legendary</option>
            </select>

            <select
              value={filters.rarity}
              onChange={(e) => setFilters({...filters, rarity: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recently Listed</option>
              <option value="price">Price</option>
              <option value="rarity">Rarity</option>
              <option value="performance">Performance</option>
              <option value="age">Age</option>
            </select>

            <button
              onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>

          {/* View Mode */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredListings.map((listing) => {
          const horse = horses.find(h => h.id === listing.itemId);
          if (!horse) return null;

          return viewMode === 'grid' ? (
            <motion.div
              key={listing.id}
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
                  onClick={() => {
                    setSelectedListing(listing);
                    setShowBuyModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all"
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={listing.id}
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
                  onClick={() => {
                    setSelectedListing(listing);
                    setShowBuyModal(true);
                  }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No horses found</h3>
          <p className="text-gray-500">Try adjusting your search filters</p>
        </div>
      )}

      {/* Purchase Modal */}
      <AnimatePresence>
        {showBuyModal && selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBuyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Purchase</h3>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">{selectedListing.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{selectedListing.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {selectedListing.price.toLocaleString()} $TURF
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchase(selectedListing)}
                  disabled={isLoading || !player || (isGuest ? (player.assets.guestCoins || 0) : player.assets.turfBalance) < selectedListing.price}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isLoading || !player || (isGuest ? (player.assets.guestCoins || 0) : player.assets.turfBalance) < selectedListing.price
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Confirm Purchase'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;