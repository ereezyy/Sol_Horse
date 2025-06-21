import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Star, 
  Clock, 
  DollarSign,
  Target,
  Award,
  Zap,
  Crown,
  Medal,
  Gift
} from 'lucide-react';
import { HorseNFT, Race } from '../types';

interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'elimination' | 'round_robin' | 'championship';
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  rounds: TournamentRound[];
  requirements: {
    minRaces: number;
    minWinRate: number;
    maxRarity?: string;
  };
  rewards: {
    first: { turf: number; sol: number; nft?: string };
    second: { turf: number; sol: number };
    third: { turf: number; sol: number };
    participation: { turf: number };
  };
}

interface TournamentRound {
  id: string;
  name: string;
  races: Race[];
  status: 'pending' | 'active' | 'completed';
  startTime: string;
}

interface TournamentSystemProps {
  playerHorses: HorseNFT[];
  onEnterTournament: (tournamentId: string, horseId: string) => void;
}

const TournamentSystem: React.FC<TournamentSystemProps> = ({
  playerHorses,
  onEnterTournament
}) => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    // Generate sample tournaments
    const sampleTournaments: Tournament[] = [
      {
        id: 'spring_championship',
        name: 'Spring Championship Series',
        description: 'The premier racing event of the season featuring the best horses from around the world.',
        type: 'championship',
        status: 'active',
        startDate: '2024-06-20T10:00:00Z',
        endDate: '2024-06-27T18:00:00Z',
        entryFee: 50000,
        prizePool: 2000000,
        maxParticipants: 64,
        currentParticipants: 48,
        rounds: [
          {
            id: 'round1',
            name: 'Qualifying Round',
            races: [],
            status: 'completed',
            startTime: '2024-06-20T10:00:00Z'
          },
          {
            id: 'round2',
            name: 'Quarter Finals',
            races: [],
            status: 'active',
            startTime: '2024-06-23T14:00:00Z'
          },
          {
            id: 'round3',
            name: 'Semi Finals',
            races: [],
            status: 'pending',
            startTime: '2024-06-25T16:00:00Z'
          },
          {
            id: 'round4',
            name: 'Grand Final',
            races: [],
            status: 'pending',
            startTime: '2024-06-27T18:00:00Z'
          }
        ],
        requirements: {
          minRaces: 10,
          minWinRate: 0.3,
          maxRarity: 'Legendary'
        },
        rewards: {
          first: { turf: 800000, sol: 50, nft: 'Champion Trophy NFT' },
          second: { turf: 400000, sol: 25 },
          third: { turf: 200000, sol: 10 },
          participation: { turf: 10000 }
        }
      },
      {
        id: 'rookie_cup',
        name: 'Rookie Cup',
        description: 'A tournament designed for new horses to prove their worth.',
        type: 'elimination',
        status: 'upcoming',
        startDate: '2024-06-25T12:00:00Z',
        endDate: '2024-06-28T16:00:00Z',
        entryFee: 15000,
        prizePool: 500000,
        maxParticipants: 32,
        currentParticipants: 12,
        rounds: [],
        requirements: {
          minRaces: 3,
          minWinRate: 0.0,
          maxRarity: 'Rare'
        },
        rewards: {
          first: { turf: 200000, sol: 10 },
          second: { turf: 100000, sol: 5 },
          third: { turf: 50000, sol: 2 },
          participation: { turf: 5000 }
        }
      },
      {
        id: 'legends_invitational',
        name: 'Legends Invitational',
        description: 'An exclusive tournament for the most elite horses.',
        type: 'round_robin',
        status: 'upcoming',
        startDate: '2024-07-01T15:00:00Z',
        endDate: '2024-07-05T20:00:00Z',
        entryFee: 100000,
        prizePool: 5000000,
        maxParticipants: 16,
        currentParticipants: 8,
        rounds: [],
        requirements: {
          minRaces: 25,
          minWinRate: 0.6,
          maxRarity: 'Legendary'
        },
        rewards: {
          first: { turf: 2000000, sol: 100, nft: 'Legend Status NFT' },
          second: { turf: 1000000, sol: 50 },
          third: { turf: 500000, sol: 25 },
          participation: { turf: 50000 }
        }
      }
    ];

    setTournaments(sampleTournaments);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-emerald-600';
      case 'upcoming': return 'from-blue-500 to-indigo-600';
      case 'completed': return 'from-gray-500 to-slate-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'championship': return <Crown className="w-5 h-5" />;
      case 'elimination': return <Target className="w-5 h-5" />;
      case 'round_robin': return <Users className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const canEnterTournament = (tournament: Tournament, horse: HorseNFT) => {
    if (tournament.status !== 'upcoming') return false;
    if (tournament.currentParticipants >= tournament.maxParticipants) return false;
    if (horse.stats.races < tournament.requirements.minRaces) return false;
    if (horse.stats.winRate < tournament.requirements.minWinRate) return false;
    return true;
  };

  const filteredTournaments = tournaments.filter(t => t.status === selectedTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Tournament System</h2>
        <p className="text-gray-600">Compete in prestigious tournaments and prove your horses' worth</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          {(['active', 'upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                selectedTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredTournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Tournament Header */}
              <div className={`bg-gradient-to-r ${getStatusColor(tournament.status)} p-4 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(tournament.type)}
                    <span className="text-sm font-semibold uppercase tracking-wide">
                      {tournament.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    tournament.status === 'active' ? 'bg-green-500' :
                    tournament.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {tournament.status.toUpperCase()}
                  </div>
                </div>
                <h3 className="text-xl font-bold">{tournament.name}</h3>
              </div>

              {/* Tournament Details */}
              <div className="p-4 space-y-4">
                <p className="text-gray-600 text-sm">{tournament.description}</p>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-semibold">Prize Pool</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {(tournament.prizePool / 1000).toFixed(0)}K TURF
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-semibold">Participants</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {tournament.currentParticipants}/{tournament.maxParticipants}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Min Races: {tournament.requirements.minRaces}</div>
                    <div>Min Win Rate: {(tournament.requirements.minWinRate * 100).toFixed(0)}%</div>
                    {tournament.requirements.maxRarity && (
                      <div>Max Rarity: {tournament.requirements.maxRarity}</div>
                    )}
                  </div>
                </div>

                {/* Rewards Preview */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Top Rewards
                  </h4>
                  <div className="text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Medal className="w-3 h-3 text-yellow-500" />
                      1st: {(tournament.rewards.first.turf / 1000).toFixed(0)}K TURF + {tournament.rewards.first.sol} SOL
                    </div>
                    {tournament.rewards.first.nft && (
                      <div className="flex items-center gap-1 mt-1">
                        <Gift className="w-3 h-3 text-purple-500" />
                        Special NFT Reward
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  onClick={() => setSelectedTournament(tournament)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    tournament.status === 'upcoming'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : tournament.status === 'active'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  whileHover={{ scale: tournament.status !== 'completed' ? 1.02 : 1 }}
                  whileTap={{ scale: tournament.status !== 'completed' ? 0.98 : 1 }}
                  disabled={tournament.status === 'completed'}
                >
                  {tournament.status === 'upcoming' ? 'Enter Tournament' :
                   tournament.status === 'active' ? 'View Progress' : 'View Results'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tournament Detail Modal */}
      <AnimatePresence>
        {selectedTournament && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTournament(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`bg-gradient-to-r ${getStatusColor(selectedTournament.status)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{selectedTournament.name}</h2>
                  <button
                    onClick={() => setSelectedTournament(null)}
                    className="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-2 opacity-90">{selectedTournament.description}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Tournament Rounds */}
                {selectedTournament.rounds.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Tournament Rounds</h3>
                    <div className="space-y-3">
                      {selectedTournament.rounds.map((round, index) => (
                        <div
                          key={round.id}
                          className={`p-4 rounded-lg border-2 ${
                            round.status === 'completed' ? 'border-green-200 bg-green-50' :
                            round.status === 'active' ? 'border-blue-200 bg-blue-50' :
                            'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{round.name}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(round.startTime).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              round.status === 'completed' ? 'bg-green-200 text-green-800' :
                              round.status === 'active' ? 'bg-blue-200 text-blue-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Horse Selection for Entry */}
                {selectedTournament.status === 'upcoming' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select Your Horse</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {playerHorses.map((horse) => {
                        const canEnter = canEnterTournament(selectedTournament, horse);
                        return (
                          <div
                            key={horse.id}
                            className={`p-4 rounded-lg border-2 ${
                              canEnter ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{horse.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {horse.stats.wins}W/{horse.stats.races}R ({(horse.stats.winRate * 100).toFixed(1)}%)
                                </p>
                              </div>
                              <motion.button
                                onClick={() => canEnter && onEnterTournament(selectedTournament.id, horse.id)}
                                className={`px-4 py-2 rounded-lg font-semibold ${
                                  canEnter
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                }`}
                                whileHover={{ scale: canEnter ? 1.05 : 1 }}
                                whileTap={{ scale: canEnter ? 0.95 : 1 }}
                                disabled={!canEnter}
                              >
                                {canEnter ? 'Enter' : 'Ineligible'}
                              </motion.button>
                            </div>
                            {!canEnter && (
                              <div className="mt-2 text-xs text-red-600">
                                {horse.stats.races < selectedTournament.requirements.minRaces && 
                                  `Need ${selectedTournament.requirements.minRaces - horse.stats.races} more races`}
                                {horse.stats.winRate < selectedTournament.requirements.minWinRate && 
                                  ` Win rate too low (${(horse.stats.winRate * 100).toFixed(1)}% < ${(selectedTournament.requirements.minWinRate * 100).toFixed(0)}%)`}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TournamentSystem;

