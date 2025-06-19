import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle, 
  Zap,
  Shield,
  Activity,
  DollarSign,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface WalletStats {
  balance: number;
  transactions: number;
  staked: number;
  rewards: number;
}

const WalletConnection: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    balance: 0,
    transactions: 0,
    staked: 0,
    rewards: 0
  });
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { player, setPlayer } = useGameStore();

  // Simulate wallet connection
  const connectWallet = async (walletType: 'phantom' | 'solflare' | 'backpack') => {
    setIsConnecting(true);
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock wallet address generation
      const mockAddress = `${walletType.charAt(0).toUpperCase()}${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 4)}`;
      setConnectedWallet(mockAddress);
      
      // Create mock player data
      const mockPlayer = {
        id: Date.now().toString(),
        walletAddress: mockAddress,
        username: `Player_${Math.random().toString(36).substr(2, 6)}`,
        profile: {
          avatar: '',
          bio: 'New trainer ready to build a legendary stable!',
          joinDate: Date.now(),
          country: 'Global',
          stableName: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} Stables`
        },
        assets: {
          turfBalance: 10000 + Math.floor(Math.random() * 50000),
          solBalance: 2.5 + Math.random() * 10,
          horses: [],
          facilities: [
            {
              id: '1',
              type: 'Stable' as const,
              level: 1,
              capacity: 5,
              upgradeCost: 5000,
              benefits: {
                trainingEfficiency: 1.0,
                recoverySpeed: 1.0,
                breedingSuccessRate: 1.0
              }
            }
          ]
        },
        stats: {
          totalRaces: Math.floor(Math.random() * 50),
          wins: Math.floor(Math.random() * 20),
          winRate: 0,
          totalEarnings: Math.floor(Math.random() * 100000),
          totalSpent: Math.floor(Math.random() * 80000),
          netProfit: 0,
          reputation: Math.floor(Math.random() * 500),
          achievements: [
            {
              id: '1',
              name: 'First Steps',
              description: 'Connected your first wallet',
              icon: 'wallet',
              rarity: 'Common' as const,
              unlockedAt: Date.now(),
              rewards: {
                turfTokens: 1000,
                title: 'Newcomer'
              }
            }
          ]
        },
        social: {
          guildId: undefined,
          friends: [],
          followers: Math.floor(Math.random() * 100),
          following: Math.floor(Math.random() * 50)
        },
        preferences: {
          notifications: true,
          publicProfile: true,
          allowBreedingRequests: true
        }
      };
      
      // Calculate derived stats
      mockPlayer.stats.winRate = mockPlayer.stats.totalRaces > 0 ? 
        mockPlayer.stats.wins / mockPlayer.stats.totalRaces : 0;
      mockPlayer.stats.netProfit = mockPlayer.stats.totalEarnings - mockPlayer.stats.totalSpent;
      
      setPlayer(mockPlayer);
      
      // Set wallet stats
      setWalletStats({
        balance: mockPlayer.assets.solBalance,
        transactions: Math.floor(Math.random() * 200),
        staked: Math.random() * 5,
        rewards: Math.random() * 2
      });
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    setPlayer(null);
    setWalletStats({ balance: 0, transactions: 0, staked: 0, rewards: 0 });
  };

  const copyAddress = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const refreshBalance = () => {
    setRefreshing(true);
    setTimeout(() => {
      setWalletStats(prev => ({
        ...prev,
        balance: prev.balance + (Math.random() - 0.5) * 0.1,
        rewards: prev.rewards + Math.random() * 0.01
      }));
      setRefreshing(false);
    }, 1500);
  };

  const walletOptions = [
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Most popular Solana wallet',
      installed: true
    },
    {
      id: 'solflare',
      name: 'Solflare',
      icon: '☀️',
      description: 'Native Solana wallet',
      installed: true
    },
    {
      id: 'backpack',
      name: 'Backpack',
      icon: '🎒',
      description: 'Multi-chain wallet',
      installed: false
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!connectedWallet ? (
        /* Wallet Selection */
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
            <p className="text-gray-600">Choose your preferred Solana wallet to start playing</p>
          </div>

          <div className="grid gap-4 mb-8">
            {walletOptions.map((wallet) => (
              <motion.button
                key={wallet.id}
                onClick={() => !isConnecting && connectWallet(wallet.id as any)}
                disabled={isConnecting || !wallet.installed}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  wallet.installed 
                    ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50' 
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                } ${isConnecting ? 'opacity-50' : ''}`}
                whileHover={wallet.installed ? { scale: 1.02 } : {}}
                whileTap={wallet.installed ? { scale: 0.98 } : {}}
              >
                <div className="text-3xl">{wallet.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">{wallet.name}</h3>
                    {!wallet.installed && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium">
                        Not Installed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{wallet.description}</p>
                </div>
                {wallet.installed && (
                  <div className="text-blue-500">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {isConnecting && (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-100 rounded-xl">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-blue-700 font-medium">Connecting wallet...</span>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Security Notice</h4>
                <p className="text-sm text-yellow-700">
                  Only connect wallets you trust. Never share your seed phrase or private keys. 
                  This demo uses simulated wallet connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Connected Wallet Dashboard */
        <div className="space-y-6">
          {/* Wallet Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Wallet Connected</h2>
                  <p className="text-sm text-gray-600">Solana Mainnet • Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshBalance}
                  disabled={refreshing}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
                <p className="font-mono text-gray-800">{connectedWallet}</p>
              </div>
              
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copiedAddress ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copiedAddress ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Wallet Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">SOL Balance</p>
                  <p className="text-2xl font-bold text-gray-800">{walletStats.balance.toFixed(4)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+2.4% today</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">$TURF Balance</p>
                  <p className="text-2xl font-bold text-gray-800">{player?.assets.turfBalance.toLocaleString()}</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                Buy more $TURF
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-800">{walletStats.transactions}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Lifetime activity</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Staking Rewards</p>
                  <p className="text-2xl font-bold text-gray-800">{walletStats.rewards.toFixed(4)}</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                Claim rewards
              </button>
            </div>
          </div>

          {/* Advanced Settings */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">Advanced Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Network Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">RPC Endpoint</span>
                        <select className="text-sm bg-white border border-gray-300 rounded px-2 py-1">
                          <option>Mainnet Beta</option>
                          <option>Devnet</option>
                          <option>Testnet</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Auto-confirm transactions</span>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Security</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Transaction notifications</span>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Require confirmation</span>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Buy $TURF</span>
              </button>
              
              <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-700">Stake SOL</span>
              </button>
              
              <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                <ExternalLink className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">View on Explorer</span>
              </button>
              
              <button className="flex flex-col items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors">
                <Activity className="w-6 h-6 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Transaction History</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;