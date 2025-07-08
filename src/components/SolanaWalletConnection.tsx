import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGameStore } from '../store/gameStore';
import playerService from '../services/playerService';

interface SolanaWalletConnectionProps {
  onConnect?: () => void;
}

const SolanaWalletConnection: React.FC<SolanaWalletConnectionProps> = ({ onConnect }) => {
  const { publicKey, connected } = useWallet();
  const { player, setPlayer } = useGameStore();
  const [loading, setLoading] = useState(false);

  // When wallet connects, fetch or create player
  useEffect(() => {
    const fetchOrCreatePlayer = async () => {
      if (!publicKey || !connected) return;
      
      setLoading(true);
      
      try {
        const walletAddress = publicKey.toString();
        
        // Try to fetch existing player
        const existingPlayer = await playerService.getPlayerByWallet(walletAddress);
        
        if (existingPlayer) {
          // Player exists, use their data
          setPlayer(existingPlayer);
        } else {
          // Create a new player
          const newPlayer = {
            id: `player-${Date.now()}`,
            walletAddress,
            username: `Player_${walletAddress.substring(0, 6)}`,
            profile: {
              avatar: '',
              bio: 'New trainer ready to build a legendary stable!',
              joinDate: Date.now(),
              country: 'Global',
              stableName: `${walletAddress.substring(0, 6)} Stables`
            },
            assets: {
              turfBalance: 25000,
              solBalance: 0, // Will be populated with actual balance
              horses: [],
              facilities: [
                {
                  id: '1',
                  type: 'Stable',
                  level: 1,
                  capacity: 5,
                  upgradeCost: 10000,
                  benefits: {
                    trainingEfficiency: 1.0,
                    recoverySpeed: 1.0,
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
              achievements: []
            },
            social: {
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
          
          const createdPlayer = await playerService.createPlayer(newPlayer);
          if (createdPlayer) {
            setPlayer(createdPlayer);
          }
        }
      } catch (error) {
        console.error('Error fetching/creating player:', error);
      } finally {
        setLoading(false);
        // Call onConnect callback if provided to notify parent component
        if (onConnect && connected) {
          onConnect();
        }
      }
    };

    fetchOrCreatePlayer();
  }, [publicKey, connected, setPlayer]);

  return (
    <div className="flex items-center">
      <WalletMultiButton />
      {loading && (
        <div className="ml-4 text-gray-600">Loading profile...</div>
      )}
    </div>
  );
};

export default SolanaWalletConnection;