import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Calendar, 
  DollarSign, 
  Crown, 
  Star, 
  Zap,
  Clock,
  Target,
  Award,
  TrendingUp,
  ChevronRight,
  Play,
  Medal,
  Swords,
  Shield,
  Flame
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Tournament, TournamentEntry, TournamentMatch } from '../types';

const TournamentCenter: React.FC = () => {
  const { player, horses, tournaments, addTournament, joinTournament, updatePlayerBalance, addNotification } = useGameStore();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [currentTab, setCurrentTab] = useState<'active' | 'upcoming' | 'history' | 'create'>('active');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);

  const playerHorses = horses.filter(h => h.owner === player?.walletAddress);

  // Generate mock tournaments for demonstration
  useEffect(() => {
    if (tournaments.length === 0) {
      generateMockTournaments();
    }
  }, []);

  const generateMockTournaments = () => {
    const mockTournaments: Tournament[] = [
      {
        id: 'tournament-1',
        name: 'Solana Spring Championship',
        description: 'The premier racing event of the season. Elite horses compete for massive prizes and eternal glory.',
        type: 'Single Elimination',
        requirements: {
          entryFee: 5000,
          minHorseLevel: 50,
          maxParticipants: 32,
          minReputation: 100
        },
        prizePool: 250000,
        prizeDistribution: {
          '1': 40, // 1st place gets 40%
          '2': 25, // 2nd place gets 25%  
          '3': 15, // 3rd place gets 15%
          '4': 10, // 4th place gets 10%
          'other': 10 // Participation rewards
        },
        registrationStart: Date.now() - 86400000,
        registrationEnd: Date.now() + 86400000 * 2,
        tournamentStart: Date.now() + 86400000 * 3,
        tournamentEnd: Date.now() + 86400000 * 7,
        participants: [],
        status: 'Registration',
        category: 'Championship',
        tier: 'Elite'
      },
      {
        id: 'tournament-2', 
        name: 'Weekly Speed Sprint',
        description: 'Fast-paced weekly tournament for speed specialists. Quick rounds, quick rewards!',
        type: 'Round Robin',
        requirements: {
          entryFee: 1000,
          minHorseLevel: 25,
          maxParticipants: 16
        },
        prizePool: 50000,
        prizeDistribution: {
          '1': 35,
          '2': 20,
          '3': 15,
          '4': 10,
          'other': 20
        },
        registrationStart: Date.now() - 3600000,
        registrationEnd: Date.now() + 3600000 * 6,
        tournamentStart: Date.now() + 3600000 * 12,
        tournamentEnd: Date.now() + 86400000 * 2,
        participants: [],
        status: 'Registration',
        category: 'Speed',
        tier: 'Professional'
      },
      {
        id: 'tournament-3',
        name: 'Rookie Derby',
        description: 'Perfect for new trainers and young horses. Build experience and earn your first victories!',
        type: 'Swiss System',
        requirements: {
          entryFee: 500,
          minHorseLevel: 10,
          maxParticipants: 24,
          maxReputation: 200
        },
        prizePool: 25000,
        prizeDistribution: {
          '1': 30,
          '2': 20,
          '3': 15,
          'other': 35
        },
        registrationStart: Date.now(),
        registrationEnd: Date.now() + 86400000,
        tournamentStart: Date.now() + 86400000 * 2,
        tournamentEnd: Date.now() + 86400000 * 4,
        participants: [],
        status: 'Registration',
        category: 'Rookie',
        tier: 'Amateur'
      }
    ];

    mockTournaments.forEach(tournament => addTournament(tournament));
  };

  const handleJoinTournament = () => {
    if (!selectedTournament || !selectedHorse || !player) return;

    const horse = horses.find(h => h.id === selectedHorse);
    if (!horse) return;

    // Check requirements
    if (player.assets.turfBalance < selectedTournament.requirements.entryFee) {
      addNotification({
        id: Date.now().toString(),
        type: 'tournament',
        title: 'Insufficient Funds',
        message: `You need ${selectedTournament.requirements.entryFee.toLocaleString()} $TURF to enter this tournament`,
        timestamp: Date.now(),
        read: false
      });
      return;
    }

    const horseLevel = Math.floor((horse.genetics.baseSpeed + horse.genetics.stamina + horse.genetics.agility + horse.genetics.intelligence + horse.genetics.temperament) / 5);
    
    if (horseLevel < selectedTournament.requirements.minHorseLevel) {
      addNotification({
        id: Date.now().toString(),
        type: 'tournament',
        title: 'Horse Level Too Low',
        message: `${horse.name} needs to be level ${selectedTournament.requirements.minHorseLevel} or higher`,
        timestamp: Date.now(),
        read: false
      });
      return;
    }

    // Join tournament
    const entry: TournamentEntry = {
      playerId: player.id,
      horseId: selectedHorse,
      playerName: player.username,
      horseName: horse.name,
      seed: selectedTournament.participants.length + 1,
      currentRound: 0,
      eliminated: false
    };

    joinTournament(selectedTournament.id, entry);
    updatePlayerBalance(-selectedTournament.requirements.entryFee);

    addNotification({
      id: Date.now().toString(),
      type: 'tournament',
      title: 'Tournament Joined!',
      message: `${horse.name} has been entered in ${selectedTournament.name}`,
      timestamp: Date.now(),
      read: false
    });

    setShowJoinModal(false);
    setSelectedHorse(null);
  };

  const getTournamentStatusColor = (status: string) => {
    switch (status) {
      case 'Registration': return 'bg-green-100 text-green-800 border-green-300';
      case 'Active': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Elite': return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'Professional': return <Star className="w-5 h-5 text-purple-600" />;
      case 'Amateur': return <Trophy className="w-5 h-5 text-blue-600" />;
      default: return <Medal className="w-5 h-5 text-green-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Championship': return <Flame className="w-5 h-5 text-red-500" />;
      case 'Speed': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Rookie': return <Shield className="w-5 h-5 text-green-500" />;
      default: return <Swords className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    switch (currentTab) {
      case 'active': return t.status === 'Active';
      case 'upcoming': return t.status === 'Registration';
      case 'history': return t.status === 'Completed';
      default: return true;
    }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Tournament Center</h1>
              <p className="text-gray-600">Compete in prestigious racing tournaments for glory and prizes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tournament Wins</p>
              <p className="text-2xl font-bold text-purple-600">
                {player?.stats.achievements.filter(a => a.name.includes('Tournament')).length || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                {((player?.stats.totalEarnings || 0) / 1000).toFixed(1)}K $TURF
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          {[
            { id: 'upcoming', label: 'Registration Open', icon: Calendar },
            { id: 'active', label: 'Active Tournaments', icon: Play },
            { id: 'history', label: 'Tournament History', icon: Clock },
            { id: 'create', label: 'Create Tournament', icon: Award }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentTab === tab.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tournament Grid */}
      <AnimatePresence mode="wait">
        {currentTab !== 'create' && (
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredTournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Tournament Header */}
                <div className="relative h-32 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500">
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getTierIcon(tournament.tier)}
                      <span className="text-white font-semibold text-sm">{tournament.tier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(tournament.category)}
                      <span className="text-white text-sm">{tournament.category}</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getTournamentStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg leading-tight">{tournament.name}</h3>
                  </div>
                </div>

                {/* Tournament Details */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{tournament.description}</p>
                  
                  {/* Prize Pool */}
                  <div className="flex items-center justify-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">Prize Pool</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {tournament.prizePool.toLocaleString()} $TURF
                      </p>
                    </div>
                  </div>

                  {/* Tournament Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Participants</p>
                      <p className="font-bold text-gray-800">
                        {tournament.participants.length}/{tournament.requirements.maxParticipants}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Entry Fee</p>
                      <p className="font-bold text-gray-800">
                        {tournament.requirements.entryFee.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Min Horse Level:</span>
                      <span className="font-medium">{tournament.requirements.minHorseLevel}</span>
                    </div>
                    
                    {tournament.requirements.minReputation && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Min Reputation:</span>
                        <span className="font-medium">{tournament.requirements.minReputation}</span>
                      </div>
                    )}
                    
                    {tournament.requirements.maxReputation && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Max Reputation:</span>
                        <span className="font-medium">{tournament.requirements.maxReputation}</span>
                      </div>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="space-y-2 mb-4 text-sm">
                    {tournament.status === 'Registration' && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Registration Ends:</span>
                        <span className="font-medium text-orange-600">
                          {new Date(tournament.registrationEnd).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tournament Starts:</span>
                      <span className="font-medium text-blue-600">
                        {new Date(tournament.tournamentStart).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {tournament.status === 'Registration' && !tournament.participants.some(p => p.playerId === player?.id) ? (
                      <button
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setShowJoinModal(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-semibold transition-all"
                      >
                        Join Tournament
                      </button>
                    ) : tournament.participants.some(p => p.playerId === player?.id) ? (
                      <button
                        disabled
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold"
                      >
                        ✓ Registered
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-600 py-2 px-4 rounded-lg font-semibold"
                      >
                        Registration Closed
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedTournament(tournament)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {currentTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Tournament Creation</h3>
              <p className="text-gray-600 mb-6">Premium feature coming soon! Create custom tournaments with your rules.</p>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Planned Features:</h4>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• Custom prize pools and entry fees</li>
                    <li>• Flexible tournament formats</li>
                    <li>• Guild-exclusive tournaments</li>
                    <li>• Sponsored corporate events</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Tournament Modal */}
      <AnimatePresence>
        {showJoinModal && selectedTournament && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Join {selectedTournament.name}</h3>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Tournament Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Entry Fee</p>
                    <p className="text-xl font-bold text-purple-600">
                      {selectedTournament.requirements.entryFee.toLocaleString()} $TURF
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prize Pool</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedTournament.prizePool.toLocaleString()} $TURF
                    </p>
                  </div>
                </div>
              </div>

              {/* Horse Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Your Horse</h4>
                
                {playerHorses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {playerHorses.map((horse) => {
                      const horseLevel = Math.floor((horse.genetics.baseSpeed + horse.genetics.stamina + horse.genetics.agility + horse.genetics.intelligence + horse.genetics.temperament) / 5);
                      const meetsRequirements = horseLevel >= selectedTournament.requirements.minHorseLevel;
                      
                      return (
                        <motion.div
                          key={horse.id}
                          onClick={() => meetsRequirements && setSelectedHorse(horse.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedHorse === horse.id
                              ? 'border-purple-500 bg-purple-50'
                              : meetsRequirements
                                ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                          }`}
                          whileHover={meetsRequirements ? { scale: 1.02 } : {}}
                          whileTap={meetsRequirements ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                              horse.genetics.coatColor === 'Bay' ? 'bg-amber-800' :
                              horse.genetics.coatColor === 'Black' ? 'bg-gray-900' :
                              horse.genetics.coatColor === 'Chestnut' ? 'bg-red-800' :
                              'bg-amber-600'
                            }`}>
                              {horse.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800">{horse.name}</h5>
                              <p className="text-sm text-gray-600">{horse.genetics.bloodline} • Level {horseLevel}</p>
                              {!meetsRequirements && (
                                <p className="text-xs text-red-600">
                                  Needs Level {selectedTournament.requirements.minHorseLevel}+
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No horses available</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinTournament}
                  disabled={!selectedHorse || !player || player.assets.turfBalance < selectedTournament.requirements.entryFee}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedHorse && player && player.assets.turfBalance >= selectedTournament.requirements.entryFee
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!selectedHorse ? 'Select a Horse' :
                   !player || player.assets.turfBalance < selectedTournament.requirements.entryFee ? 'Insufficient Funds' :
                   'Join Tournament'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TournamentCenter;