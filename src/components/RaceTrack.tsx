import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Camera, 
  Volume2, 
  VolumeX,
  Zap,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Trophy,
  Clock
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Race, HorseNFT } from '../types';
import { RaceEngine, RaceState, RaceResult } from '../services/raceEngine';
import { BettingEngine } from '../services/bettingEngine';

interface RaceTrackProps {
  race: Race;
  horses: HorseNFT[];
}

const RaceTrack: React.FC<RaceTrackProps> = ({ race, horses }) => {
  const [isRacing, setIsRacing] = useState(false);
  const [raceState, setRaceState] = useState<RaceState | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [cameraAngle, setCameraAngle] = useState<'track' | 'aerial' | 'finish'>('track');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [raceFinished, setRaceFinished] = useState(false);
  const [raceProgress, setRaceProgress] = useState(0);
  
  const raceEngineRef = useRef<RaceEngine | null>(null);
  const bettingEngineRef = useRef<BettingEngine>(new BettingEngine());
  const { updatePlayerBalance, addNotification } = useGameStore();

  // Initialize race when horses change
  useEffect(() => {
    resetRace();
  }, [horses, race]);

  const startRace = () => {
    if (raceFinished) {
      resetRace();
      return;
    }

    if (horses.length === 0) return;

    setIsRacing(true);
    
    // Initialize race engine
    raceEngineRef.current = new RaceEngine(
      horses,
      {
        distance: race.distance,
        conditions: race.conditions
      },
      {
        onUpdate: (state: RaceState) => {
          setRaceState(state);
          setCurrentTime(state.timeElapsed);
          
          // Calculate progress based on leader
          const leader = state.horses.reduce((prev, current) => 
            current.distanceCovered > prev.distanceCovered ? current : prev
          );
          const progress = Math.min(100, (leader.distanceCovered / state.distance) * 100);
          setRaceProgress(progress);
        },
        onFinish: (results: RaceResult[]) => {
          setRaceResults(results);
          setRaceFinished(true);
          setIsRacing(false);
          
          // Process betting results
          const payouts = bettingEngineRef.current?.calculatePayouts(results) || [];
          const totalWinnings = payouts
            .filter(p => p.won)
            .reduce((sum, p) => sum + p.payout, 0);
          
          if (totalWinnings > 0) {
            updatePlayerBalance(totalWinnings);
          }
          
          const winner = results[0];
          addNotification({
            id: Date.now().toString(),
            type: 'race_result',
            title: 'Race Finished!',
            message: `${winner.name} won in ${winner.time.toFixed(2)}s! ${totalWinnings > 0 ? `You won ${totalWinnings.toLocaleString()} $TURF!` : ''}`,
            timestamp: Date.now(),
            read: false
          });
        }
      }
    );

    raceEngineRef.current.startRace();
  };

  const pauseRace = () => {
    setIsRacing(false);
    // Note: RaceEngine would need pause functionality for full implementation
  };

  const resetRace = () => {
    setIsRacing(false);
    setRaceFinished(false);
    setRaceResults([]);
    setCurrentTime(0);
    setRaceProgress(0);
    setRaceState(null);
    raceEngineRef.current = null;
    bettingEngineRef.current?.resetBets();
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Clear': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'Cloudy': return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'Rainy': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'Windy': return <Wind className="w-4 h-4 text-gray-600" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const getCameraTransform = () => {
    switch (cameraAngle) {
      case 'aerial':
        return 'perspective(1000px) rotateX(60deg) rotateY(0deg)';
      case 'finish':
        return 'perspective(1000px) rotateX(20deg) rotateY(-10deg)';
      default:
        return 'perspective(1000px) rotateX(15deg) rotateY(5deg)';
    }
  };

  const getHorseColor = (horse: HorseNFT) => {
    switch (horse.genetics.coatColor) {
      case 'Bay': return '#92400e';
      case 'Black': return '#1f2937';
      case 'Chestnut': return '#dc2626';
      case 'Gray': return '#6b7280';
      case 'Palomino': return '#d97706';
      default: return '#92400e';
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-2xl p-6 shadow-2xl">
      {/* Race Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{race.name}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              {getWeatherIcon(race.conditions.weather)}
              {race.conditions.weather}
            </span>
            <span className="flex items-center gap-1">
              <Thermometer className="w-4 h-4" />
              {race.conditions.temperature}°C
            </span>
            <span>{race.surface} • {race.distance}m</span>
            <span className="capitalize">{race.conditions.trackCondition}</span>
          </div>
        </div>
        
        {/* Race Controls */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setCameraAngle('track')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                cameraAngle === 'track' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Track
            </button>
            <button
              onClick={() => setCameraAngle('aerial')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                cameraAngle === 'aerial' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Aerial
            </button>
            <button
              onClick={() => setCameraAngle('finish')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                cameraAngle === 'finish' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Finish
            </button>
          </div>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <button
            onClick={isRacing ? pauseRace : startRace}
            disabled={horses.length === 0}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              horses.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : raceFinished 
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : isRacing 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {raceFinished ? (
              <>
                <RotateCcw className="w-4 h-4" />
                New Race
              </>
            ) : isRacing ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Race
              </>
            )}
          </button>
        </div>
      </div>

      {/* Race Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Race Progress</span>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {currentTime.toFixed(1)}s
            </span>
            <span>{raceProgress.toFixed(1)}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${raceProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* 3D Race Track */}
      <div 
        className="relative rounded-xl overflow-hidden shadow-inner bg-gradient-to-b"
        style={{ 
          height: '400px',
          background: race.surface === 'Turf' 
            ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
            : race.surface === 'Dirt' 
              ? 'linear-gradient(135deg, #d97706, #92400e)' 
              : 'linear-gradient(135deg, #6b7280, #4b5563)'
        }}
      >
        {/* Track Surface */}
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: getCameraTransform() }}
        >
          {/* Lane Dividers */}
          {horses.map((_, index) => (
            <div
              key={index}
              className="absolute border-b border-white border-opacity-30"
              style={{
                top: `${(index + 1) * (100 / (horses.length + 1))}%`,
                left: '5%',
                right: '5%',
                height: '1px'
              }}
            />
          ))}
          
          {/* Start Line */}
          <div className="absolute left-[5%] top-0 bottom-0 w-1 bg-white opacity-80" />
          
          {/* Finish Line */}
          <div className="absolute right-[5%] top-0 bottom-0 w-1 bg-white opacity-80">
            <div className="absolute inset-0 bg-black opacity-50 animate-pulse" />
          </div>

          {/* Distance Markers */}
          {[25, 50, 75].map(percent => (
            <div
              key={percent}
              className="absolute top-0 bottom-0 w-0.5 bg-white opacity-40"
              style={{ left: `${5 + (percent * 0.9)}%` }}
            />
          ))}
          
          {/* Horse Positions */}
          <AnimatePresence>
            {raceState?.horses.map((horse, index) => {
              const progressPercent = Math.min(90, (horse.distanceCovered / race.distance) * 90);
              const displayHorse = horses.find(h => h.id === horse.id);
              
              return (
                <motion.div
                  key={horse.id}
                  className="absolute flex items-center z-10"
                  style={{
                    top: `${(horse.lane + 1) * (100 / (horses.length + 1)) - 2}%`,
                    left: `${5 + progressPercent}%`,
                  }}
                  animate={{
                    left: `${5 + progressPercent}%`
                  }}
                  transition={{ duration: 0.1, ease: "linear" }}
                >
                  {/* Horse Body */}
                  <div className="relative">
                    <div 
                      className="w-8 h-6 rounded-lg shadow-lg border border-black border-opacity-20"
                      style={{ backgroundColor: getHorseColor(displayHorse!) }}
                    >
                      {/* Speed lines when moving fast */}
                      {horse.currentSpeed > horse.maxSpeed * 0.8 && (
                        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-1 h-0.5 bg-white opacity-70 mb-0.5" />
                          <div className="w-1 h-0.5 bg-white opacity-50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Position Number */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border border-gray-300 shadow-sm">
                      {horse.position}
                    </div>
                    
                    {/* Energy Bar */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-200 ${
                          horse.energy > 60 ? 'bg-green-500' :
                          horse.energy > 30 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${horse.energy}%` }}
                      />
                    </div>

                    {/* Speed indicator */}
                    <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-xs font-bold text-white bg-black bg-opacity-60 px-1 rounded">
                      {Math.round(horse.currentSpeed)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Weather Effects */}
        {race.conditions.weather === 'Rainy' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 100 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-6 bg-blue-300 opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  y: [0, 400],
                  opacity: [0.6, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        )}

        {race.conditions.weather === 'Windy' && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="w-full h-full bg-white opacity-10"
              animate={{
                x: [0, 20, 0, -20, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        )}
      </div>

      {/* Live Leaderboard */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Live Positions
        </h3>
        <div className="space-y-2">
          {(raceState?.horses || horses.map((horse, i) => ({
            id: horse.id,
            name: horse.name,
            position: i + 1,
            currentSpeed: 0,
            energy: 100,
            distanceCovered: 0
          }))).sort((a, b) => a.position - b.position).map((horse, index) => {
              const displayHorse = horses.find(h => h.id === horse.id)!;
              const isFinished = raceResults.some(r => r.horseId === horse.id);
              const result = raceResults.find(r => r.horseId === horse.id);
              
              return (
                <motion.div
                  key={horse.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    index === 0 && raceState ? 'bg-yellow-100 border border-yellow-300' :
                    index === 1 && raceState ? 'bg-gray-100 border border-gray-300' :
                    index === 2 && raceState ? 'bg-orange-100 border border-orange-300' :
                    'bg-gray-50'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 && raceState ? 'bg-yellow-500 text-white' :
                      index === 1 && raceState ? 'bg-gray-500 text-white' :
                      index === 2 && raceState ? 'bg-orange-500 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {horse.position}
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getHorseColor(displayHorse) }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{horse.name}</p>
                        <p className="text-xs text-gray-600">{displayHorse.genetics.bloodline}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {isFinished && result ? (
                      <div>
                        <p className="text-sm font-bold text-green-600">Finished</p>
                        <p className="text-xs text-gray-600">{result.time.toFixed(2)}s</p>
                      </div>
                    ) : raceState ? (
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {((horse.distanceCovered / race.distance) * 100).toFixed(1)}%
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                horse.energy > 60 ? 'bg-green-500' :
                                horse.energy > 30 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${horse.energy}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-8">{Math.round(horse.currentSpeed)}m/s</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Ready</p>
                        <p className="text-xs text-gray-500">Max: {Math.round(displayHorse.genetics.baseSpeed * 0.45)}m/s</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Race Results */}
      <AnimatePresence>
        {raceFinished && raceResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-6"
          >
            <div className="text-center text-white">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Race Complete!</h3>
                <Trophy className="w-8 h-8" />
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                <p className="text-xl font-semibold">🏆 Winner: {raceResults[0]?.name}</p>
                <p className="text-lg">Time: {raceResults[0]?.time.toFixed(2)} seconds</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="font-semibold">🥇 1st Place</p>
                  <p>{raceResults[0]?.name}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="font-semibold">🥈 2nd Place</p>
                  <p>{raceResults[1]?.name || 'N/A'}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="font-semibold">🥉 3rd Place</p>
                  <p>{raceResults[2]?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RaceTrack;