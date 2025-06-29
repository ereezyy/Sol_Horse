import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Gift, 
  Crown, 
  Star, 
  Flame, 
  Snowflake, 
  Sun, 
  Leaf,
  Trophy,
  Clock,
  Target,
  Zap,
  Heart,
  Award,
  Sparkles,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'special';
  type: 'racing' | 'breeding' | 'collection' | 'community';
  status: 'upcoming' | 'active' | 'completed';
  startDate: number;
  endDate: number;
  requirements: {
    level?: number;
    reputation?: number;
    horses?: number;
  };
  rewards: {
    turfTokens: number;
    experience: number;
    exclusiveItems: string[];
    titles: string[];
  };
  milestones: Milestone[];
  participants: number;
  maxParticipants?: number;
  icon: React.ReactNode;
  backgroundImage: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  requirement: number;
  current: number;
  reward: {
    turfTokens: number;
    items?: string[];
  };
  completed: boolean;
}

const SeasonalEvents: React.FC = () => {
  const { player, addNotification, updatePlayerBalance } = useGameStore();
  const [events, setEvents] = useState<SeasonalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SeasonalEvent | null>(null);
  const [currentSeason, setCurrentSeason] = useState<string>('spring');

  useEffect(() => {
    generateSeasonalEvents();
    updateCurrentSeason();
  }, []);

  const updateCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason('spring');
    else if (month >= 5 && month <= 7) setCurrentSeason('summer');
    else if (month >= 8 && month <= 10) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  };

  const generateSeasonalEvents = () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const seasonalEvents: SeasonalEvent[] = [
      {
        id: 'spring-festival',
        name: 'Spring Renewal Festival',
        description: 'Celebrate new beginnings with breeding bonuses and fresh challenges!',
        season: 'spring',
        type: 'breeding',
        status: 'active',
        startDate: now - oneDay * 2,
        endDate: now + oneDay * 12,
        requirements: { level: 10, horses: 2 },
        rewards: {
          turfTokens: 50000,
          experience: 2000,
          exclusiveItems: ['Spring Crown', 'Bloom Saddle'],
          titles: ['Spring Champion']
        },
        milestones: [
          {
            id: 'spring-1',
            name: 'First Bloom',
            description: 'Breed your first horse during the festival',
            requirement: 1,
            current: 0,
            reward: { turfTokens: 5000, items: ['Lucky Horseshoe'] },
            completed: false
          },
          {
            id: 'spring-2',
            name: 'Garden of Champions',
            description: 'Breed 3 horses with rare or higher rarity',
            requirement: 3,
            current: 0,
            reward: { turfTokens: 15000, items: ['Rare Breeding Certificate'] },
            completed: false
          },
          {
            id: 'spring-3',
            name: 'Master Breeder',
            description: 'Successfully breed 5 horses during the event',
            requirement: 5,
            current: 0,
            reward: { turfTokens: 30000, items: ['Spring Crown'] },
            completed: false
          }
        ],
        participants: 1247,
        maxParticipants: 5000,
        icon: <Leaf className="w-6 h-6" />,
        backgroundImage: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
      },
      {
        id: 'summer-championships',
        name: 'Summer Speed Championships',
        description: 'The hottest racing season is here! Compete for ultimate glory!',
        season: 'summer',
        type: 'racing',
        status: 'upcoming',
        startDate: now + oneDay * 15,
        endDate: now + oneDay * 45,
        requirements: { level: 25, reputation: 200 },
        rewards: {
          turfTokens: 100000,
          experience: 5000,
          exclusiveItems: ['Golden Lightning Bolt', 'Champion\'s Wreath'],
          titles: ['Summer Speed King', 'Heat Wave Victor']
        },
        milestones: [
          {
            id: 'summer-1',
            name: 'Speed Demon',
            description: 'Win 10 races during the championship',
            requirement: 10,
            current: 0,
            reward: { turfTokens: 20000, items: ['Speed Boost Potion'] },
            completed: false
          },
          {
            id: 'summer-2',
            name: 'Heat Seeker',
            description: 'Win races on 5 different tracks',
            requirement: 5,
            current: 0,
            reward: { turfTokens: 35000, items: ['Track Master Badge'] },
            completed: false
          },
          {
            id: 'summer-3',
            name: 'Blazing Glory',
            description: 'Achieve a 80%+ win rate with 15+ races',
            requirement: 15,
            current: 0,
            reward: { turfTokens: 50000, items: ['Golden Lightning Bolt'] },
            completed: false
          }
        ],
        participants: 0,
        maxParticipants: 3000,
        icon: <Sun className="w-6 h-6" />,
        backgroundImage: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)'
      },
      {
        id: 'halloween-spooktacular',
        name: 'Halloween Spooktacular',
        description: 'Mysterious horses emerge from the shadows. Rare ghost breeds available!',
        season: 'autumn',
        type: 'collection',
        status: 'upcoming',
        startDate: now + oneDay * 60,
        endDate: now + oneDay * 75,
        requirements: { level: 15 },
        rewards: {
          turfTokens: 75000,
          experience: 3000,
          exclusiveItems: ['Phantom Saddle', 'Ghostly Mane', 'Spooky Stable'],
          titles: ['Ghost Whisperer', 'Shadow Trainer']
        },
        milestones: [
          {
            id: 'halloween-1',
            name: 'First Fright',
            description: 'Collect your first Halloween horse',
            requirement: 1,
            current: 0,
            reward: { turfTokens: 10000, items: ['Pumpkin Badge'] },
            completed: false
          },
          {
            id: 'halloween-2',
            name: 'Supernatural Stable',
            description: 'Own 3 Halloween-themed horses',
            requirement: 3,
            current: 0,
            reward: { turfTokens: 25000, items: ['Phantom Saddle'] },
            completed: false
          },
          {
            id: 'halloween-3',
            name: 'Master of Mysteries',
            description: 'Complete 50 races with Halloween horses',
            requirement: 50,
            current: 0,
            reward: { turfTokens: 40000, items: ['Spooky Stable'] },
            completed: false
          }
        ],
        participants: 0,
        maxParticipants: 4000,
        icon: <Crown className="w-6 h-6" />,
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        id: 'winter-wonderland',
        name: 'Winter Wonderland Classic',
        description: 'Ice and snow create perfect conditions for endurance challenges!',
        season: 'winter',
        type: 'racing',
        status: 'completed',
        startDate: now - oneDay * 90,
        endDate: now - oneDay * 60,
        requirements: { level: 20, horses: 5 },
        rewards: {
          turfTokens: 80000,
          experience: 3500,
          exclusiveItems: ['Ice Crystal Crown', 'Frost Walker Shoes'],
          titles: ['Winter Warrior', 'Ice Runner']
        },
        milestones: [
          {
            id: 'winter-1',
            name: 'Freeze Frame',
            description: 'Complete 20 winter races',
            requirement: 20,
            current: 20,
            reward: { turfTokens: 15000 },
            completed: true
          },
          {
            id: 'winter-2',
            name: 'Blizzard Runner',
            description: 'Win races in extreme weather conditions',
            requirement: 10,
            current: 10,
            reward: { turfTokens: 30000, items: ['Frost Walker Shoes'] },
            completed: true
          },
          {
            id: 'winter-3',
            name: 'Ice King',
            description: 'Achieve top 100 ranking in winter leaderboard',
            requirement: 1,
            current: 1,
            reward: { turfTokens: 35000, items: ['Ice Crystal Crown'] },
            completed: true
          }
        ],
        participants: 2156,
        icon: <Snowflake className="w-6 h-6" />,
        backgroundImage: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
      },
      {
        id: 'lunar-new-year',
        name: 'Lunar New Year Spectacular',
        description: 'Welcome the Year of the Horse with exclusive golden breeds!',
        season: 'special',
        type: 'community',
        status: 'upcoming',
        startDate: now + oneDay * 100,
        endDate: now + oneDay * 115,
        requirements: { reputation: 500 },
        rewards: {
          turfTokens: 200000,
          experience: 8000,
          exclusiveItems: ['Golden Dragon Saddle', 'Lunar Crown', 'Year of Horse NFT'],
          titles: ['Lunar Legend', 'Golden Rider']
        },
        milestones: [
          {
            id: 'lunar-1',
            name: 'Red Envelope',
            description: 'Participate in 5 community events',
            requirement: 5,
            current: 0,
            reward: { turfTokens: 25000 },
            completed: false
          },
          {
            id: 'lunar-2',
            name: 'Dragon Dance',
            description: 'Breed a horse with perfect genetics',
            requirement: 1,
            current: 0,
            reward: { turfTokens: 50000, items: ['Golden Dragon Saddle'] },
            completed: false
          },
          {
            id: 'lunar-3',
            name: 'Celestial Champion',
            description: 'Win the Lunar Tournament',
            requirement: 1,
            current: 0,
            reward: { turfTokens: 125000, items: ['Year of Horse NFT'] },
            completed: false
          }
        ],
        participants: 0,
        maxParticipants: 1000,
        icon: <Flame className="w-6 h-6" />,
        backgroundImage: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)'
      }
    ];

    setEvents(seasonalEvents);
  };

  const joinEvent = (event: SeasonalEvent) => {
    if (!player) return;

    // Check requirements
    const meetsRequirements = 
      (!event.requirements.level || player.stats.reputation >= (event.requirements.level * 10)) &&
      (!event.requirements.reputation || player.stats.reputation >= event.requirements.reputation) &&
      (!event.requirements.horses || player.assets.horses.length >= event.requirements.horses);

    if (!meetsRequirements) {
      addNotification({
        id: Date.now().toString(),
        type: 'tournament',
        title: 'Requirements Not Met',
        message: 'You don\'t meet the requirements for this event yet.',
        timestamp: Date.now(),
        read: false
      });
      return;
    }

    // Join event
    setEvents(prev => prev.map(e => 
      e.id === event.id 
        ? { ...e, participants: e.participants + 1 }
        : e
    ));

    addNotification({
      id: Date.now().toString(),
      type: 'tournament',
      title: 'Event Joined!',
      message: `You've joined the ${event.name}! Good luck!`,
      timestamp: Date.now(),
      read: false
    });
  };

  const claimMilestoneReward = (eventId: string, milestoneId: string) => {
    const event = events.find(e => e.id === eventId);
    const milestone = event?.milestones.find(m => m.id === milestoneId);
    
    if (!milestone || !milestone.completed) return;

    updatePlayerBalance(milestone.reward.turfTokens);

    addNotification({
      id: Date.now().toString(),
      type: 'quest_complete',
      title: 'Milestone Completed!',
      message: `Claimed ${milestone.reward.turfTokens.toLocaleString()} $TURF from "${milestone.name}"`,
      timestamp: Date.now(),
      read: false
    });
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'spring': return <Leaf className="w-5 h-5 text-green-500" />;
      case 'summer': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'autumn': return <Crown className="w-5 h-5 text-orange-500" />;
      case 'winter': return <Snowflake className="w-5 h-5 text-blue-500" />;
      case 'special': return <Sparkles className="w-5 h-5 text-purple-500" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getTimeRemaining = (endDate: number) => {
    const now = Date.now();
    const timeLeft = endDate - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Seasonal Events</h1>
              <p className="text-gray-600">Limited-time events with exclusive rewards and experiences</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                {getSeasonIcon(currentSeason)}
                <span className="font-semibold text-gray-700 capitalize">{currentSeason}</span>
              </div>
              <p className="text-sm text-gray-600">Current Season</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Season Banner */}
      <div className="relative rounded-2xl overflow-hidden h-32" style={{ background: events.find(e => e.season === currentSeason && e.status === 'active')?.backgroundImage || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-2">
              {getSeasonIcon(currentSeason)}
              <h2 className="text-2xl font-bold capitalize">{currentSeason} Season</h2>
            </div>
            <p className="text-lg opacity-90">
              {events.filter(e => e.season === currentSeason && e.status === 'active').length} active events
            </p>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => (
          <motion.div
            key={event.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Event Header */}
            <div className="relative h-32" style={{ background: event.backgroundImage }}>
              <div className="absolute inset-0 bg-black bg-opacity-30" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {getSeasonIcon(event.season)}
                <span className="text-white font-semibold text-sm capitalize">{event.season}</span>
              </div>
              
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                  {event.status === 'active' ? 'Live Now' : event.status}
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg leading-tight">{event.name}</h3>
              </div>
            </div>

            {/* Event Content */}
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{event.description}</p>
              
              {/* Event Type & Timing */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    event.type === 'racing' ? 'bg-red-100 text-red-600' :
                    event.type === 'breeding' ? 'bg-pink-100 text-pink-600' :
                    event.type === 'collection' ? 'bg-purple-100 text-purple-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {event.type === 'racing' ? <Trophy className="w-4 h-4" /> :
                     event.type === 'breeding' ? <Heart className="w-4 h-4" /> :
                     event.type === 'collection' ? <Star className="w-4 h-4" /> :
                     <Target className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-gray-700 capitalize">{event.type}</span>
                </div>
                
                {event.status === 'active' && (
                  <div className="flex items-center gap-1 text-sm text-orange-600">
                    <Clock className="w-4 h-4" />
                    {getTimeRemaining(event.endDate)}
                  </div>
                )}
              </div>

              {/* Participants */}
              {event.maxParticipants && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Participants</span>
                    <span className="text-sm font-medium">{event.participants}/{event.maxParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements */}
              {Object.keys(event.requirements).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements</h4>
                  <div className="space-y-1">
                    {event.requirements.level && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-gray-600">Level {event.requirements.level}+</span>
                      </div>
                    )}
                    {event.requirements.reputation && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span className="text-gray-600">{event.requirements.reputation}+ reputation</span>
                      </div>
                    )}
                    {event.requirements.horses && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-600">{event.requirements.horses} horses minimum</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Milestones Progress */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Progress</h4>
                <div className="space-y-2">
                  {event.milestones.slice(0, 2).map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {milestone.completed ? (
                          <Award className="w-3 h-3 text-white" />
                        ) : (
                          <Lock className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800">{milestone.name}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (milestone.current / milestone.requirement) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards Preview */}
              <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Exclusive Rewards</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs text-yellow-700">
                    💰 {event.rewards.turfTokens.toLocaleString()} $TURF
                  </div>
                  <div className="text-xs text-yellow-700">
                    ⭐ {event.rewards.experience} XP
                  </div>
                </div>
                {event.rewards.exclusiveItems.length > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    + {event.rewards.exclusiveItems.length} exclusive items
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="flex gap-3">
                {event.status === 'active' ? (
                  <button
                    onClick={() => joinEvent(event)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-all"
                  >
                    Join Event
                  </button>
                ) : event.status === 'upcoming' ? (
                  <button
                    disabled
                    className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-semibold"
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-200 text-gray-600 py-2 px-4 rounded-lg font-semibold"
                  >
                    Completed
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{selectedEvent.name}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Event Info */}
                <div>
                  <div className="mb-6 p-4 rounded-xl" style={{ background: selectedEvent.backgroundImage }}>
                    <div className="bg-black bg-opacity-30 rounded-lg p-4">
                      <p className="text-white leading-relaxed">{selectedEvent.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Event Type</h4>
                      <p className="text-gray-600 capitalize">{selectedEvent.type}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Duration</h4>
                      <p className="text-gray-600">
                        {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Total Rewards</h4>
                      <div className="space-y-2">
                        <p className="text-gray-600">💰 {selectedEvent.rewards.turfTokens.toLocaleString()} $TURF</p>
                        <p className="text-gray-600">⭐ {selectedEvent.rewards.experience} Experience</p>
                        {selectedEvent.rewards.titles.map((title, index) => (
                          <p key={index} className="text-gray-600">🏆 {title} (Title)</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Event Milestones</h4>
                  <div className="space-y-4">
                    {selectedEvent.milestones.map((milestone, index) => (
                      <div key={milestone.id} className={`p-4 rounded-xl border-2 ${
                        milestone.completed ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {milestone.completed ? (
                                <Award className="w-4 h-4 text-white" />
                              ) : (
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              )}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-800">{milestone.name}</h5>
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">
                              {milestone.current}/{milestone.requirement}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                milestone.completed ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(100, (milestone.current / milestone.requirement) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Reward: {milestone.reward.turfTokens.toLocaleString()} $TURF
                            {milestone.reward.items && milestone.reward.items.length > 0 && (
                              <span> + {milestone.reward.items[0]}</span>
                            )}
                          </div>
                          
                          {milestone.completed && (
                            <button
                              onClick={() => claimMilestoneReward(selectedEvent.id, milestone.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                            >
                              Claim
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeasonalEvents;