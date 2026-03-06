import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Crown, 
  Shield, 
  Star, 
  Trophy, 
  Target,
  DollarSign,
  TrendingUp,
  Calendar,
  MessageCircle,
  Settings,
  UserPlus,
  Award,
  Zap,
  Gift,
  Medal,
  Sword,
  Heart,
  Clock,
  Globe,
  Search,
  Filter,
  Home
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Guild, GuildMember } from '../types';

interface GuildEvent {
  id: string;
  type: 'tournament' | 'race' | 'training' | 'social';
  title: string;
  description: string;
  startTime: number;
  participants: string[];
  rewards: { turfTokens: number; items?: string[] };
  status: 'upcoming' | 'active' | 'completed';
}

const GuildSystem: React.FC = () => {
  const { player, addNotification } = useGameStore();
  const [currentGuild, setCurrentGuild] = useState<Guild | null>(null);
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([]);
  const [guildEvents, setGuildEvents] = useState<GuildEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'events' | 'members' | 'browse'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGuildData, setNewGuildData] = useState({
    name: '',
    description: '',
    requirements: { minReputation: 100, applicationRequired: true }
  });

  useEffect(() => {
    generateMockGuilds();
    generateGuildEvents();
  }, []);

  const generateMockGuilds = () => {
    const guilds: Guild[] = [
      {
        id: 'guild-1',
        name: 'Elite Trainers',
        description: 'Premier guild for professional horse trainers seeking excellence in racing.',
        founderId: 'founder-1',
        members: [
          { playerId: 'founder-1', role: 'Leader', joinDate: Date.now() - 86400000 * 90, contribution: 25000 },
          { playerId: 'member-1', role: 'Officer', joinDate: Date.now() - 86400000 * 60, contribution: 15000 },
          { playerId: 'member-2', role: 'Member', joinDate: Date.now() - 86400000 * 30, contribution: 8000 },
          { playerId: 'member-3', role: 'Member', joinDate: Date.now() - 86400000 * 15, contribution: 5000 }
        ],
        stats: {
          totalWins: 1250,
          totalEarnings: 2500000,
          reputation: 4500,
          level: 8
        },
        features: {
          sharedFacilities: true,
          groupTraining: true,
          tournamentTeams: true
        },
        requirements: {
          minReputation: 500,
          applicationRequired: true
        }
      },
      {
        id: 'guild-2',
        name: 'Speed Demons',
        description: 'High-octane guild focused on sprint racing and speed development.',
        founderId: 'founder-2',
        members: [
          { playerId: 'founder-2', role: 'Leader', joinDate: Date.now() - 86400000 * 120, contribution: 30000 },
          { playerId: 'speed-1', role: 'Officer', joinDate: Date.now() - 86400000 * 80, contribution: 20000 },
          { playerId: 'speed-2', role: 'Member', joinDate: Date.now() - 86400000 * 45, contribution: 12000 }
        ],
        stats: {
          totalWins: 980,
          totalEarnings: 1800000,
          reputation: 3200,
          level: 6
        },
        features: {
          sharedFacilities: true,
          groupTraining: false,
          tournamentTeams: true
        },
        requirements: {
          minReputation: 300,
          applicationRequired: false
        }
      },
      {
        id: 'guild-3',
        name: 'Breeding Masters',
        description: 'Dedicated to the art and science of horse breeding and genetics.',
        founderId: 'founder-3',
        members: [
          { playerId: 'founder-3', role: 'Leader', joinDate: Date.now() - 86400000 * 150, contribution: 40000 },
          { playerId: 'breeder-1', role: 'Officer', joinDate: Date.now() - 86400000 * 100, contribution: 25000 },
          { playerId: 'breeder-2', role: 'Officer', joinDate: Date.now() - 86400000 * 75, contribution: 18000 },
          { playerId: 'breeder-3', role: 'Member', joinDate: Date.now() - 86400000 * 50, contribution: 10000 },
          { playerId: 'breeder-4', role: 'Member', joinDate: Date.now() - 86400000 * 25, contribution: 7000 }
        ],
        stats: {
          totalWins: 750,
          totalEarnings: 3200000,
          reputation: 5500,
          level: 10
        },
        features: {
          sharedFacilities: true,
          groupTraining: true,
          tournamentTeams: false
        },
        requirements: {
          minReputation: 400,
          applicationRequired: true
        }
      }
    ];

    setAvailableGuilds(guilds);
    
    // Set player's current guild if they have one
    if (player && Math.random() > 0.5) {
      setCurrentGuild(guilds[0]);
    }
  };

  const generateGuildEvents = () => {
    const events: GuildEvent[] = [
      {
        id: 'event-1',
        type: 'tournament',
        title: 'Guild Championship',
        description: 'Inter-guild tournament with massive rewards for the winning team.',
        startTime: Date.now() + 86400000 * 3,
        participants: [],
        rewards: { turfTokens: 100000, items: ['Championship Banner', 'Guild Trophy'] },
        status: 'upcoming'
      },
      {
        id: 'event-2',
        type: 'training',
        title: 'Group Training Session',
        description: 'Collaborative training session with bonus experience for all participants.',
        startTime: Date.now() + 86400000,
        participants: [],
        rewards: { turfTokens: 5000 },
        status: 'upcoming'
      },
      {
        id: 'event-3',
        type: 'race',
        title: 'Guild Sprint Challenge',
        description: 'Internal racing competition to determine our fastest horses.',
        startTime: Date.now() + 86400000 * 2,
        participants: [],
        rewards: { turfTokens: 25000, items: ['Speed Badge'] },
        status: 'upcoming'
      }
    ];

    setGuildEvents(events);
  };

  const joinGuild = (guild: Guild) => {
    if (!player) return;

    if (player.stats.reputation < guild.requirements.minReputation) {
      addNotification({
        id: Date.now().toString(),
        type: 'guild_invite',
        title: 'Requirements Not Met',
        message: `You need ${guild.requirements.minReputation} reputation to join ${guild.name}`,
        timestamp: Date.now(),
        read: false
      });
      return;
    }

    setCurrentGuild(guild);
    addNotification({
      id: Date.now().toString(),
      type: 'guild_invite',
      title: 'Guild Joined!',
      message: `Welcome to ${guild.name}! Start collaborating with your new guild members.`,
      timestamp: Date.now(),
      read: false
    });
  };

  const createGuild = () => {
    if (!player || !newGuildData.name.trim()) return;

    const newGuild: Guild = {
      id: `guild-${Date.now()}`,
      name: newGuildData.name,
      description: newGuildData.description,
      founderId: player.id,
      members: [{
        playerId: player.id,
        role: 'Leader',
        joinDate: Date.now(),
        contribution: 0
      }],
      stats: {
        totalWins: 0,
        totalEarnings: 0,
        reputation: 100,
        level: 1
      },
      features: {
        sharedFacilities: false,
        groupTraining: false,
        tournamentTeams: false
      },
      requirements: newGuildData.requirements
    };

    setCurrentGuild(newGuild);
    setShowCreateModal(false);
    setNewGuildData({ name: '', description: '', requirements: { minReputation: 100, applicationRequired: true } });

    addNotification({
      id: Date.now().toString(),
      type: 'guild_invite',
      title: 'Guild Created!',
      message: `${newGuild.name} has been founded. Invite members to start building your empire!`,
      timestamp: Date.now(),
      read: false
    });
  };

  const getGuildLevelColor = (level: number) => {
    if (level >= 10) return 'from-yellow-400 to-orange-500';
    if (level >= 7) return 'from-purple-400 to-pink-500';
    if (level >= 4) return 'from-blue-400 to-indigo-500';
    return 'from-green-400 to-emerald-500';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Leader': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'Officer': return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredGuilds = availableGuilds.filter(guild =>
    guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guild.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Guild System</h1>
              <p className="text-gray-600">
                {currentGuild ? `Welcome to ${currentGuild.name}` : 'Join a guild to unlock collaborative features'}
              </p>
            </div>
          </div>
          
          {!currentGuild && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              Create Guild
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'browse', label: 'Browse Guilds', icon: Search }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                selectedTab === tab.id
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && currentGuild && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Guild Stats */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGuildLevelColor(currentGuild.stats.level)} flex items-center justify-center`}>
                  <span className="text-white font-bold text-xl">Lv.{currentGuild.stats.level}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{currentGuild.name}</h2>
                  <p className="text-gray-600">{currentGuild.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{currentGuild.stats.totalWins}</p>
                  <p className="text-sm text-gray-600">Total Wins</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {(currentGuild.stats.totalEarnings / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-gray-600">Earnings</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{currentGuild.stats.reputation}</p>
                  <p className="text-sm text-gray-600">Reputation</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{currentGuild.members.length}</p>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
              </div>
            </div>

            {/* Guild Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Guild Features</h3>
              
              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  currentGuild.features.sharedFacilities ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentGuild.features.sharedFacilities ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Shared Facilities</p>
                    <p className="text-sm text-gray-600">Access to guild training grounds</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  currentGuild.features.groupTraining ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentGuild.features.groupTraining ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Group Training</p>
                    <p className="text-sm text-gray-600">Collaborative training sessions</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  currentGuild.features.tournamentTeams ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentGuild.features.tournamentTeams ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <Sword className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Tournament Teams</p>
                    <p className="text-sm text-gray-600">Participate in guild tournaments</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guilds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Guild List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGuilds.map((guild) => (
                <motion.div
                  key={guild.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={`h-20 bg-gradient-to-r ${getGuildLevelColor(guild.stats.level)} relative`}>
                    <div className="absolute inset-0 bg-black bg-opacity-20" />
                    <div className="absolute bottom-4 left-6 text-white">
                      <h3 className="text-xl font-bold">{guild.name}</h3>
                      <p className="text-sm opacity-90">Level {guild.stats.level}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{guild.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-800">{guild.members.length}</p>
                        <p className="text-xs text-gray-600">Members</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-800">{guild.stats.reputation}</p>
                        <p className="text-xs text-gray-600">Reputation</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Requirements:</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                          {guild.requirements.minReputation}+ Rep
                        </span>
                        {guild.requirements.applicationRequired && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            Application Required
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => joinGuild(guild)}
                      disabled={currentGuild?.id === guild.id}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                        currentGuild?.id === guild.id
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      {currentGuild?.id === guild.id ? 'Current Guild' : 'Join Guild'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Guild Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Create Your Guild</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guild Name</label>
                  <input
                    type="text"
                    value={newGuildData.name}
                    onChange={(e) => setNewGuildData({...newGuildData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter guild name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newGuildData.description}
                    onChange={(e) => setNewGuildData({...newGuildData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe your guild's purpose and culture"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Reputation</label>
                  <input
                    type="number"
                    value={newGuildData.requirements.minReputation}
                    onChange={(e) => setNewGuildData({
                      ...newGuildData, 
                      requirements: {...newGuildData.requirements, minReputation: Number(e.target.value)}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="applicationRequired"
                    checked={newGuildData.requirements.applicationRequired}
                    onChange={(e) => setNewGuildData({
                      ...newGuildData,
                      requirements: {...newGuildData.requirements, applicationRequired: e.target.checked}
                    })}
                    className="rounded"
                  />
                  <label htmlFor="applicationRequired" className="text-sm text-gray-700">
                    Require application for membership
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createGuild}
                  disabled={!newGuildData.name.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    !newGuildData.name.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  Create Guild
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuildSystem;