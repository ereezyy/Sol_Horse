import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Heart, 
  Target, 
  Brain, 
  Shield, 
  Clock, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Trophy,
  Play,
  BarChart3,
  Award,
  Calendar,
  Sparkles,
  Activity
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { HorseNFT } from '../types';
import { TrainingEngine, TrainingProgram, TrainingSession, TrainingResult } from '../services/trainingEngine';

const TrainingCenter: React.FC = () => {
  const { player, horses, updateHorse, updatePlayerBalance, addNotification } = useGameStore();
  const [selectedHorse, setSelectedHorse] = useState<HorseNFT | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [trainingEngine] = useState(() => new TrainingEngine());
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [progress, setProgress] = useState(0);
  const [availablePrograms, setAvailablePrograms] = useState<TrainingProgram[]>([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState<TrainingProgram[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<'train' | 'history' | 'stats'>('train');
  const [completionModal, setCompletionModal] = useState<{ show: boolean; result: TrainingResult | null }>({ show: false, result: null });

  const playerHorses = horses.filter(h => h.owner === player?.walletAddress);
  const facilityLevel = player?.assets.facilities.find(f => f.type === 'Training Ground')?.level || 1;

  // Update available programs when horse or facility changes
  useEffect(() => {
    if (selectedHorse) {
      const programs = trainingEngine.getAvailablePrograms(selectedHorse, facilityLevel);
      const recommended = trainingEngine.getRecommendedPrograms(selectedHorse, facilityLevel);
      setAvailablePrograms(programs);
      setRecommendedPrograms(recommended);
      
      // Check if horse is already training
      const session = trainingEngine.getActiveSession(selectedHorse.id);
      setActiveSession(session || null);
    }
  }, [selectedHorse, facilityLevel]);

  // Progress tracking for active training
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const currentProgress = trainingEngine.getSessionProgress(selectedHorse!.id);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        completeTraining();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const startTraining = async () => {
    if (!selectedHorse || !selectedProgram || !player) return;

    if (player.assets.turfBalance < selectedProgram.cost) {
      addNotification({
        id: Date.now().toString(),
        type: 'training_complete',
        title: 'Insufficient Funds',
        message: `You need ${selectedProgram.cost} $TURF to start this training program`,
        timestamp: Date.now(),
        read: false
      });
      return;
    }

    const session = trainingEngine.startTraining(selectedHorse, selectedProgram.id, facilityLevel);
    if (!session) {
      addNotification({
        id: Date.now().toString(),
        type: 'training_complete',
        title: 'Training Failed',
        message: 'Unable to start training. Check requirements.',
        timestamp: Date.now(),
        read: false
      });
      return;
    }

    // Deduct cost
    updatePlayerBalance(-selectedProgram.cost);
    
    setActiveSession(session);
    setProgress(0);
    setSelectedProgram(null);

    addNotification({
      id: Date.now().toString(),
      type: 'training_complete',
      title: 'Training Started',
      message: `${selectedHorse.name} has begun ${selectedProgram.name} training`,
      timestamp: Date.now(),
      read: false
    });
  };

  const completeTraining = () => {
    if (!activeSession || !selectedHorse) return;

    const result = trainingEngine.completeTraining(selectedHorse, activeSession.id);
    if (!result) return;

    // Update horse stats
    const updatedHorse = { ...selectedHorse };
    
    Object.entries(result.statChanges).forEach(([stat, change]) => {
      if (change > 0) {
        switch (stat) {
          case 'speed':
            updatedHorse.genetics.baseSpeed = Math.min(100, updatedHorse.genetics.baseSpeed + change);
            break;
          case 'stamina':
            updatedHorse.genetics.stamina = Math.min(100, updatedHorse.genetics.stamina + change);
            break;
          case 'agility':
            updatedHorse.genetics.agility = Math.min(100, updatedHorse.genetics.agility + change);
            break;
          case 'intelligence':
            updatedHorse.genetics.intelligence = Math.min(100, updatedHorse.genetics.intelligence + change);
            break;
          case 'temperament':
            updatedHorse.genetics.temperament = Math.min(100, updatedHorse.genetics.temperament + change);
            break;
        }
      }
    });

    updatedHorse.stats.fitness = Math.max(10, Math.min(100, updatedHorse.stats.fitness + result.fitnessChange));
    updatedHorse.stats.experience += result.experienceGained;

    updateHorse(selectedHorse.id, updatedHorse);
    setSelectedHorse(updatedHorse);

    // Add to training history
    const historyEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      horseName: selectedHorse.name,
      programName: trainingEngine.getProgram(activeSession.programId)?.name || 'Unknown',
      result: result.success,
      statChanges: result.statChanges,
      cost: selectedProgram?.cost || 0
    };
    setTrainingHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

    setActiveSession(null);
    setProgress(0);
    setCompletionModal({ show: true, result });

    // Auto-hide modal after 5 seconds
    setTimeout(() => {
      setCompletionModal({ show: false, result: null });
    }, 5000);
  };

  const getStatColor = (value: number) => {
    if (value >= 90) return 'text-yellow-600 bg-yellow-100';
    if (value >= 80) return 'text-purple-600 bg-purple-100';
    if (value >= 70) return 'text-blue-600 bg-blue-100';
    if (value >= 60) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatIcon = (statType: string) => {
    switch (statType) {
      case 'Speed': return <Zap className="w-4 h-4" />;
      case 'Stamina': return <Heart className="w-4 h-4" />;
      case 'Agility': return <Target className="w-4 h-4" />;
      case 'Intelligence': return <Brain className="w-4 h-4" />;
      case 'Temperament': return <Shield className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getProgramDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 border-green-300';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 3: return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const calculatePotentialGain = (horse: HorseNFT, program: TrainingProgram) => {
    const currentStat = getCurrentStat(horse, program.type);
    if (currentStat >= 90) return 1;
    if (currentStat >= 80) return Math.floor(program.effects.statBoost * 0.6);
    if (currentStat >= 70) return Math.floor(program.effects.statBoost * 0.8);
    return program.effects.statBoost;
  };

  const getCurrentStat = (horse: HorseNFT, statType: string): number => {
    switch (statType) {
      case 'Speed': return horse.genetics.baseSpeed;
      case 'Stamina': return horse.genetics.stamina;
      case 'Agility': return horse.genetics.agility;
      case 'Intelligence': return horse.genetics.intelligence;
      case 'Temperament': return horse.genetics.temperament;
      default: return 0;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Training Center</h1>
              <p className="text-gray-600">Develop your horses' potential through specialized training</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Facility Level</p>
            <p className="text-2xl font-bold text-blue-600">{facilityLevel}</p>
            <p className="text-xs text-gray-500">Training Ground</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          {[
            { id: 'train', label: 'Training Programs', icon: TrendingUp },
            { id: 'history', label: 'Training History', icon: Clock },
            { id: 'stats', label: 'Performance Stats', icon: BarChart3 }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
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
        {currentTab === 'train' && (
          <motion.div
            key="train"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 xl:grid-cols-4 gap-6"
          >
            {/* Horse Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                Select Horse
              </h3>
              
              {playerHorses.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {playerHorses.map(horse => {
                    const isTraining = trainingEngine.isTraining(horse.id);
                    
                    return (
                      <motion.div
                        key={horse.id}
                        onClick={() => !isTraining && setSelectedHorse(horse)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedHorse?.id === horse.id
                            ? 'border-blue-500 bg-blue-50'
                            : isTraining
                              ? 'border-yellow-300 bg-yellow-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                        }`}
                        whileHover={!isTraining ? { scale: 1.02 } : {}}
                        whileTap={!isTraining ? { scale: 0.98 } : {}}
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
                            <h4 className="font-semibold text-gray-800">{horse.name}</h4>
                            <p className="text-sm text-gray-600">{horse.genetics.bloodline}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-gray-600">Fitness: {horse.stats.fitness}%</span>
                              </div>
                              {isTraining && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  Training
                                </span>
                              )}
                            </div>
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
                  <p className="text-sm text-gray-500">Purchase horses from the marketplace</p>
                </div>
              )}
            </div>

            {/* Horse Stats Display */}
            {selectedHorse && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  {selectedHorse.name} Stats
                </h3>
                
                <div className="space-y-4">
                  {/* Current Stats */}
                  <div className="space-y-3">
                    {[
                      { label: 'Speed', value: selectedHorse.genetics.baseSpeed, icon: 'Speed' },
                      { label: 'Stamina', value: selectedHorse.genetics.stamina, icon: 'Stamina' },
                      { label: 'Agility', value: selectedHorse.genetics.agility, icon: 'Agility' },
                      { label: 'Intelligence', value: selectedHorse.genetics.intelligence, icon: 'Intelligence' },
                      { label: 'Temperament', value: selectedHorse.genetics.temperament, icon: 'Temperament' }
                    ].map(stat => (
                      <div key={stat.label} className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatColor(stat.value)}`}>
                          {getStatIcon(stat.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                            <span className="text-sm font-bold text-gray-800">{stat.value}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                stat.value >= 90 ? 'bg-yellow-500' :
                                stat.value >= 80 ? 'bg-purple-500' :
                                stat.value >= 70 ? 'bg-blue-500' :
                                stat.value >= 60 ? 'bg-green-500' :
                                'bg-gray-400'
                              }`}
                              style={{ width: `${stat.value}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Horse Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium ml-2">{Math.floor(selectedHorse.stats.age / 12)} years</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Fitness:</span>
                        <span className="font-medium ml-2">{selectedHorse.stats.fitness}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium ml-2">{selectedHorse.stats.experience}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Races:</span>
                        <span className="font-medium ml-2">{selectedHorse.stats.races}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Training Programs */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Training Programs
              </h3>
              
              {selectedHorse ? (
                <div className="space-y-4">
                  {/* Recommended Programs */}
                  {recommendedPrograms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended</h4>
                      <div className="space-y-2">
                        {recommendedPrograms.map(program => (
                          <motion.div
                            key={program.id}
                            onClick={() => setSelectedProgram(program)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedProgram?.id === program.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-purple-200 hover:border-purple-300 hover:bg-purple-25'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-gray-800 text-sm">{program.name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProgramDifficultyColor(program.level)}`}>
                                Level {program.level}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>{program.duration} min • {program.cost} $TURF</span>
                              <span>+{calculatePotentialGain(selectedHorse, program)} {program.type}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Available Programs */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">All Programs</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {availablePrograms.map(program => (
                        <motion.div
                          key={program.id}
                          onClick={() => setSelectedProgram(program)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedProgram?.id === program.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getStatIcon(program.type)}
                            <span className="font-semibold text-gray-800 text-sm">{program.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProgramDifficultyColor(program.level)}`}>
                              Level {program.level}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{program.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div>
                              <span>{program.duration} min • {program.cost} $TURF</span>
                            </div>
                            <div>
                              <span>+{calculatePotentialGain(selectedHorse, program)} {program.type} • {program.effects.successRate}% success</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Select a horse to view programs</p>
                  <p className="text-sm text-gray-500">Choose from available training programs</p>
                </div>
              )}
            </div>

            {/* Training Control Panel */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-green-600" />
                Training Control
              </h3>
              
              {activeSession ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Training in Progress</h4>
                    <p className="text-gray-600 mb-4">
                      {selectedHorse?.name} is training: {trainingEngine.getProgram(activeSession.programId)?.name}
                    </p>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <motion.div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full flex items-center justify-center"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>
                      </motion.div>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      Time remaining: {Math.ceil((100 - progress) * (trainingEngine.getProgram(activeSession.programId)?.duration || 60) / 100)} minutes
                    </p>
                  </div>
                </div>
              ) : selectedProgram && selectedHorse ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-2">{selectedProgram.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{selectedProgram.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium ml-2">{selectedProgram.duration} min</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-medium ml-2">{selectedProgram.cost} $TURF</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stat Boost:</span>
                        <span className="font-medium ml-2">+{calculatePotentialGain(selectedHorse, selectedProgram)} {selectedProgram.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium ml-2">{selectedProgram.effects.successRate}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={startTraining}
                    disabled={!player || player.assets.turfBalance < selectedProgram.cost}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                      !player || player.assets.turfBalance < selectedProgram.cost
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                    }`}
                    whileHover={player && player.assets.turfBalance >= selectedProgram.cost ? { y: -2 } : {}}
                    whileTap={player && player.assets.turfBalance >= selectedProgram.cost ? { y: 0 } : {}}
                  >
                    {!player || player.assets.turfBalance < selectedProgram.cost ? 'Insufficient Funds' : 'Start Training'}
                  </motion.button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">Ready to Train</h4>
                  <p className="text-gray-500 text-sm">Select a horse and training program to begin</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Training History</h3>
            
            {trainingHistory.length > 0 ? (
              <div className="space-y-4">
                {trainingHistory.map((entry) => (
                  <div key={entry.id} className={`p-4 rounded-xl border-2 ${
                    entry.result ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {entry.result ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-800">{entry.horseName}</h4>
                          <p className="text-sm text-gray-600">{entry.programName}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {Object.entries(entry.statChanges).map(([stat, change]) => (
                          change > 0 && (
                            <span key={stat} className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              +{change} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                            </span>
                          )
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">Cost: {entry.cost} $TURF</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Training History</h4>
                <p className="text-gray-500">Completed training sessions will appear here</p>
              </div>
            )}
          </motion.div>
        )}

        {currentTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Training Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Training Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-bold text-gray-800">{trainingHistory.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Successful Sessions</span>
                  <span className="font-bold text-green-600">
                    {trainingHistory.filter(h => h.result).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-blue-600">
                    {trainingHistory.length > 0 ? 
                      Math.round((trainingHistory.filter(h => h.result).length / trainingHistory.length) * 100) 
                      : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Investment</span>
                  <span className="font-bold text-purple-600">
                    {trainingHistory.reduce((sum, h) => sum + h.cost, 0).toLocaleString()} $TURF
                  </span>
                </div>
              </div>
            </div>

            {/* Facility Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Facility Information</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-6 h-6 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Training Ground Level {facilityLevel}</h4>
                  </div>
                  
                  <div className="text-sm text-blue-700">
                    <p>• Access to Level {facilityLevel} training programs</p>
                    <p>• {facilityLevel * 20}% training efficiency bonus</p>
                    <p>• Can train {facilityLevel * 2} horses simultaneously</p>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Upgrade Benefits</h4>
                  <div className="text-sm text-yellow-700">
                    <p>• Unlock advanced training programs</p>
                    <p>• Improved success rates</p>
                    <p>• Reduced training times</p>
                    <p>• Higher stat gains</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Training Completion Modal */}
      <AnimatePresence>
        {completionModal.show && completionModal.result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setCompletionModal({ show: false, result: null })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  completionModal.result.success 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  {completionModal.result.success ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Training {completionModal.result.success ? 'Successful!' : 'Failed'}
                </h3>
                
                <p className="text-gray-600 mb-4">{completionModal.result.message}</p>
                
                {completionModal.result.success && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Improvements:</h4>
                    <div className="space-y-1">
                      {Object.entries(completionModal.result.statChanges).map(([stat, change]) => (
                        change > 0 && (
                          <div key={stat} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 capitalize">{stat}:</span>
                            <span className="font-bold text-green-600">+{change}</span>
                          </div>
                        )
                      ))}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-bold text-blue-600">+{completionModal.result.experienceGained}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setCompletionModal({ show: false, result: null })}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainingCenter;