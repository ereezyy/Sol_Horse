import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Trophy, 
  Heart, 
  ShoppingCart, 
  User, 
  Users, 
  Settings,
  Bell,
  Wallet,
  Crown,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const Navigation: React.FC = () => {
  const { currentView, setCurrentView, player, notifications } = useGameStore();
  
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'stable', label: 'My Stable', icon: Home, color: 'emerald' },
    { id: 'training', label: 'Training', icon: TrendingUp, color: 'blue' },
    { id: 'racing', label: 'Racing', icon: Trophy, color: 'red' },
    { id: 'breeding', label: 'Breeding', icon: Heart, color: 'pink' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, color: 'purple' },
    { id: 'guild', label: 'Guilds', icon: Users, color: 'orange' },
    { id: 'profile', label: 'Profile', icon: User, color: 'gray' }
  ];

  return (
    <div className="bg-white shadow-2xl border-b border-gray-200">
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Equus Ascendant
              </h1>
              <p className="text-xs text-gray-500">Solana Derby</p>
            </div>
          </div>

          {/* Player Info */}
          <div className="flex items-center gap-4">
            {/* Balance */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-blue-50 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  {player?.assets.turfBalance.toLocaleString() || '0'} $TURF
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                <span className="font-semibold text-gray-700">
                  {player?.assets.solBalance.toFixed(2) || '0.00'} SOL
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadNotifications}</span>
                  </div>
                )}
              </button>
            </div>

            {/* Wallet */}
            <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors">
              <Wallet className="w-4 h-4" />
              <span className="font-medium">
                {player?.walletAddress ? 
                  `${player.walletAddress.slice(0, 4)}...${player.walletAddress.slice(-4)}` : 
                  'Connect Wallet'
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6">
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-medium transition-all relative ${
                currentView === item.id
                  ? `text-${item.color}-600 bg-${item.color}-50`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              
              {currentView === item.id && (
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${item.color}-500`}
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation;