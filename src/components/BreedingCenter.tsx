import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Zap, 
  Star, 
  Crown, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Target,
  Shield,
  Brain
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { HorseNFT } from '../types';
import { BreedingEngine, BreedingResult, CompatibilityAnalysis } from '../services/breedingEngine';
import HorseCard from './HorseCard';

const BreedingCenter: React.FC = () => {
  const { player, horses, addHorse, updatePlayerBalance, addNotification } = useGameStore();
  const [selectedMare, setSelectedMare] = useState<HorseNFT | null>(null);
  const [selectedStallion, setSelectedStallion] = useState<HorseNFT | null>(null);
  const [breedingInProgress, setBreedingInProgress] = useState(false);
  const [breedingResult, setBreedingResult] = useState<BreedingResult | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityAnalysis | null>(null);
  const [availableStuds, setAvailableStuds] = useState<HorseNFT[]>([]);
  const [breedingHistory, setBreedingHistory] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'breed' | 'studs' | 'history'>('breed');

  const breedingEngine = new BreedingEngine();
  const playerHorses = horses.filter(h => h.owner === player?.walletAddress);
  const eligibleMares = playerHorses.filter(h => 
    h.breeding.canBreed && 
    h.stats.age >= 36 && 
    h.stats.age <= 180 && // 3-15 years
    h.genetics.rarity !== 'Legendary' // Legendary horses can't breed normally
  );

  const eligibleStallions = horses.filter(h => 
    h.breeding.canBreed && 
    h.breeding.isPublicStud &&
    h.stats.age >= 36 &&
    h.stats.age <= 240 && // stallions can breed longer
    h.id !== selectedMare?.id
  );

  // Calculate compatibility when both horses are selected
  useEffect(() => {
    if (selectedMare && selectedStallion) {
      const analysis = breedingEngine.analyzeCompatibility(selectedMare, selectedStallion);
      setCompatibility(analysis);
    } else {
      setCompatibility(null);
    }
  }, [selectedMare, selectedStallion]);

  // Load available studs
  useEffect(() => {
    const studs = horses.filter(h => 
      h.breeding.isPublicStud && 
      h.breeding.canBreed &&
      h.owner !== player?.walletAddress
    );
    setAvailableStuds(studs);
  }, [horses, player]);

  const startBreeding = async () => {
    if (!selectedMare || !selectedStallion || !player) return;

    const studFee = selectedStallion.breeding.studFee || 0;
    const breedingCost = 2500; // Base breeding cost
    const totalCost = studFee + breedingCost;

    if (player.assets.turfBalance < totalCost) {
      addNotification({
        id: Date.now().toString(),
        type: 'breeding_complete',
        title: 'Insufficient Funds',
        message: `You need ${totalCost} $TURF to breed these horses`,
        timestamp: Date.now(),
        read: false
      });
      return;
    }

    setBreedingInProgress(true);
    setShowPreview(true);

    // Simulate breeding process with realistic timing
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const result = breedingEngine.breedHorses(selectedMare, selectedStallion);
      
      // Deduct costs
      updatePlayerBalance(-totalCost);
      
      // Add new horse to collection
      addHorse(result.offspring);
      
      setBreedingResult(result);
      
      // Add to breeding history
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mare: selectedMare.name,
        stallion: selectedStallion.name,
        offspring: result.offspring.name,
        success: result.success,
        cost: totalCost,
        rarity: result.offspring.genetics.rarity
      };
      setBreedingHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

      addNotification({
        id: Date.now().toString(),
        type: 'breeding_complete',
        title: 'Breeding Successful!',
        message: `${result.offspring.name} has been born! A ${result.offspring.genetics.rarity} ${result.offspring.genetics.bloodline}`,
        timestamp: Date.now(),
        read: false
      });

    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'breeding_complete',
        title: 'Breeding Failed',
        message: 'The breeding attempt was unsuccessful. Please try again.',
        timestamp: Date.now(),
        read: false
      });
    } finally {
      setBreedingInProgress(false);
      setSelectedMare(null);
      setSelectedStallion(null);
      setTimeout(() => {
        setShowPreview(false);
        setBreedingResult(null);
      }, 5000);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRarityBonus = (mare: HorseNFT, stallion: HorseNFT) => {
    const rarityScores = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5 };
    const mareScore = rarityScores[mare.genetics.rarity];
    const stallionScore = rarityScores[stallion.genetics.rarity];
    return ((mareScore + stallionScore) / 10) * 15; // Up to 15% bonus
  };

  const StatPreview: React.FC<{ label: string; mareValue: number; stallionValue: number; projected: number; icon: React.ReactNode }> = ({
    label, mareValue, stallionValue, projected, icon
  }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-pink-600">{mareValue}</span>
        <span className="text-gray-400">+</span>
        <span className="text-blue-600">{stallionValue}</span>
        <span className="text-gray-400">=</span>
        <span className="font-bold text-green-600">{projected}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Breeding Center</h1>
              <p className="text-gray-600">Create the next generation of champions</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-green-600">
              {player?.assets.turfBalance.toLocaleString() || '0'} $TURF
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          {[
            { id: 'breed', label: 'Breed Horses', icon: Heart },
            { id: 'studs', label: 'Stud Market', icon: Crown },
            { id: 'history', label: 'Breeding History', icon: Clock }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                selectedTab === tab.id
                  ? 'bg-pink-500 text-white shadow-lg'
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
        {selectedTab === 'breed' && (
          <motion.div
            key="breed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Mare Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
                Select Mare ({eligibleMares.length} available)
              </h3>
              
              {eligibleMares.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {eligibleMares.map(mare => (
                    <motion.div
                      key={mare.id}
                      onClick={() => setSelectedMare(mare)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedMare?.id === mare.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {mare.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{mare.name}</h4>
                          <p className="text-sm text-gray-600">{mare.genetics.bloodline} • {mare.genetics.rarity}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">Avg Stats: {Math.round((mare.genetics.baseSpeed + mare.genetics.stamina + mare.genetics.agility) / 3)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No eligible mares available</p>
                  <p className="text-sm text-gray-500">Mares must be 3-15 years old and available for breeding</p>
                </div>
              )}
            </div>

            {/* Stallion Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                Select Stallion ({eligibleStallions.length} available)
              </h3>
              
              {eligibleStallions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {eligibleStallions.map(stallion => (
                    <motion.div
                      key={stallion.id}
                      onClick={() => setSelectedStallion(stallion)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedStallion?.id === stallion.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {stallion.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{stallion.name}</h4>
                          <p className="text-sm text-gray-600">{stallion.genetics.bloodline} • {stallion.genetics.rarity}</p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-gray-600">Avg: {Math.round((stallion.genetics.baseSpeed + stallion.genetics.stamina + stallion.genetics.agility) / 3)}</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              {stallion.breeding.studFee?.toLocaleString() || 0} $TURF
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No stallions available</p>
                  <p className="text-sm text-gray-500">Check the Stud Market for available stallions</p>
                </div>
              )}
            </div>

            {/* Breeding Analysis & Control */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
<<<<<<< HEAD
                <Target className="w-6 h-6 text-purple-600" />
=======
                <Atom className="w-6 h-6 text-purple-600" />
>>>>>>> 60725211e97a90a5df62961f81e295c0e4175345
                Breeding Analysis
              </h3>

              {selectedMare && selectedStallion && compatibility ? (
                <div className="space-y-6">
                  {/* Compatibility Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${getCompatibilityColor(compatibility.compatibilityScore)}`}>
                      <Sparkles className="w-5 h-5" />
                      {compatibility.compatibilityScore}% Compatible
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{compatibility.recommendation}</p>
                  </div>

                  {/* Projected Offspring Stats */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Projected Offspring Stats
                    </h4>
                    
                    <StatPreview
                      label="Speed"
                      mareValue={selectedMare.genetics.baseSpeed}
                      stallionValue={selectedStallion.genetics.baseSpeed}
                      projected={compatibility.projectedStats.baseSpeed}
                      icon={<Zap className="w-4 h-4 text-yellow-600" />}
                    />
                    
                    <StatPreview
                      label="Stamina"
                      mareValue={selectedMare.genetics.stamina}
                      stallionValue={selectedStallion.genetics.stamina}
                      projected={compatibility.projectedStats.stamina}
                      icon={<Heart className="w-4 h-4 text-red-600" />}
                    />
                    
                    <StatPreview
                      label="Agility"
                      mareValue={selectedMare.genetics.agility}
                      stallionValue={selectedStallion.genetics.agility}
                      projected={compatibility.projectedStats.agility}
                      icon={<Target className="w-4 h-4 text-blue-600" />}
                    />
                    
                    <StatPreview
                      label="Intelligence"
                      mareValue={selectedMare.genetics.intelligence}
                      stallionValue={selectedStallion.genetics.intelligence}
                      projected={compatibility.projectedStats.intelligence}
                      icon={<Brain className="w-4 h-4 text-purple-600" />}
                    />
                  </div>

                  {/* Breeding Cost */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Stud Fee:</span>
                      <span className="font-medium">{selectedStallion.breeding.studFee?.toLocaleString() || 0} $TURF</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Breeding Cost:</span>
                      <span className="font-medium">2,500 $TURF</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-800">Total Cost:</span>
                      <span className="font-bold text-green-600">
                        {((selectedStallion.breeding.studFee || 0) + 2500).toLocaleString()} $TURF
                      </span>
                    </div>
                  </div>

                  {/* Breed Button */}
                  <motion.button
                    onClick={startBreeding}
                    disabled={breedingInProgress || (player?.assets.turfBalance || 0) < ((selectedStallion.breeding.studFee || 0) + 2500)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                      breedingInProgress
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : (player?.assets.turfBalance || 0) < ((selectedStallion.breeding.studFee || 0) + 2500)
                          ? 'bg-red-200 text-red-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg'
                    }`}
                    whileHover={!breedingInProgress ? { y: -2 } : {}}
                    whileTap={!breedingInProgress ? { y: 0 } : {}}
                  >
                    {breedingInProgress ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Breeding in Progress...
                      </div>
                    ) : (player?.assets.turfBalance || 0) < ((selectedStallion.breeding.studFee || 0) + 2500) ? (
                      'Insufficient Funds'
                    ) : (
                      'Start Breeding'
                    )}
                  </motion.button>
                </div>
              ) : (
                <div className="text-center py-12">
<<<<<<< HEAD
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
=======
                  <Atom className="w-16 h-16 text-gray-400 mx-auto mb-4" />
>>>>>>> 60725211e97a90a5df62961f81e295c0e4175345
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Select Both Parents</h4>
                  <p className="text-gray-500">Choose a mare and stallion to see breeding analysis</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {selectedTab === 'studs' && (
          <motion.div
            key="studs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Public Stud Market</h3>
            
            {availableStuds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableStuds.map(stallion => (
                  <HorseCard 
                    key={stallion.id} 
                    horse={stallion} 
                    compact={false}
                    showActions={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Studs Available</h4>
                <p className="text-gray-500">Check back later for available stallions</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Breeding History</h3>
            
            {breedingHistory.length > 0 ? (
              <div className="space-y-4">
                {breedingHistory.map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{entry.offspring}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {entry.mare} × {entry.stallion}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-800' :
                        entry.rarity === 'Epic' ? 'bg-purple-100 text-purple-800' :
                        entry.rarity === 'Rare' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {entry.rarity}
                      </span>
                      <span className="text-sm text-gray-600">Cost: {entry.cost.toLocaleString()} $TURF</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Breeding History</h4>
                <p className="text-gray-500">Your breeding attempts will appear here</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breeding Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
            >
              {breedingInProgress ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Breeding in Progress</h3>
                  <p className="text-gray-600 mb-4">Creating the next generation...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </div>
              ) : breedingResult ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Breeding Successful!</h3>
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <h4 className="font-bold text-lg text-gray-800">{breedingResult.offspring.name}</h4>
                    <p className="text-gray-600">{breedingResult.offspring.genetics.rarity} {breedingResult.offspring.genetics.bloodline}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>Speed: {breedingResult.offspring.genetics.baseSpeed}</div>
                      <div>Stamina: {breedingResult.offspring.genetics.stamina}</div>
                      <div>Agility: {breedingResult.offspring.genetics.agility}</div>
                      <div>Intelligence: {breedingResult.offspring.genetics.intelligence}</div>
                    </div>
                  </div>
                  <p className="text-gray-600">Your new horse has been added to your stable!</p>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BreedingCenter;