import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Camera, 
  Volume2, 
  VolumeX,
  Zap,
  Wind,
  CloudLightning,
  CloudDrizzle,
  CloudSnow,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Trophy,
  Clock
  Flag,
  Hourglass,
  Camera,
  Maximize,
  Award
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Race, HorseNFT } from '../types';
import { RaceEngine, RaceState, RaceResult } from '../services/raceEngine';
import { BettingEngine } from '../services/bettingEngine';

interface RaceTrackProps {
  race: Race;
  horses: HorseNFT[];  
}

// Sound effect constants
const SOUNDS = {
  START_BELL: 'https://assets.mixkit.co/active_storage/sfx/2039/2039.wav',
  HOOVES: 'https://assets.mixkit.co/active_storage/sfx/146/146.wav',
  CROWD: 'https://assets.mixkit.co/active_storage/sfx/151/151.wav',
  WINNER: 'https://assets.mixkit.co/active_storage/sfx/134/134.wav',
  COMMENTARY: [
    'https://assets.mixkit.co/active_storage/sfx/1991/1991.wav',
    'https://assets.mixkit.co/active_storage/sfx/2000/2000.wav'
  ]
}

const RaceTrack: React.FC<RaceTrackProps> = ({ race, horses }) => {
  // Main state
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [raceState, setRaceState] = useState<RaceState | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [cameraAngle, setCameraAngle] = useState<'track' | 'aerial' | 'finish' | 'closeup' | 'broadcast'>('track');
  const [previousAngle, setPreviousAngle] = useState<string>('track');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [raceFinished, setRaceFinished] = useState(false);
  const [raceProgress, setRaceProgress] = useState(0);
  const [showHorseStats, setShowHorseStats] = useState<string | null>(null);
  const [commentaryText, setCommentaryText] = useState<string>('');
  const [photoFinish, setPhotoFinish] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [commentaryIndex, setCommentaryIndex] = useState<number>(0);
  
  const raceEngineRef = useRef<RaceEngine | null>(null);
  const bettingEngineRef = useRef<BettingEngine>(new BettingEngine());
  const audioRefs = useRef<{[key: string]: HTMLAudioElement | null}>({
    startBell: null,
    hooves: null,
    crowd: null,
    winner: null,
    commentary1: null,
    commentary2: null
  });
  const trackRef = useRef<HTMLDivElement>(null);
  const cameraTransform = useMotionValue(getCameraTransform('track'));
  const smoothCameraTransform = useSpring(cameraTransform, { stiffness: 100, damping: 30 });
  
  const { updatePlayerBalance, addNotification } = useGameStore();

  // Initialize race when horses change
  useEffect(() => {
    resetRace();
    
    // Initialize audio elements if audio is enabled
    if (audioEnabled) {
      audioRefs.current.startBell = new Audio(SOUNDS.START_BELL);
      audioRefs.current.hooves = new Audio(SOUNDS.HOOVES);
      audioRefs.current.crowd = new Audio(SOUNDS.CROWD);
      audioRefs.current.winner = new Audio(SOUNDS.WINNER);
      audioRefs.current.commentary1 = new Audio(SOUNDS.COMMENTARY[0]);
      audioRefs.current.commentary2 = new Audio(SOUNDS.COMMENTARY[1]);
      
      // Set volume levels
      if (audioRefs.current.hooves) audioRefs.current.hooves.volume = 0.3;
      if (audioRefs.current.crowd) audioRefs.current.crowd.volume = 0.2;
      
      // Loop continuous sounds
      if (audioRefs.current.hooves) audioRefs.current.hooves.loop = true;
      if (audioRefs.current.crowd) audioRefs.current.crowd.loop = true;
    }
    
    return () => {
      // Clean up audio
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, [horses, race]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!trackRef.current) return;
    
    if (!document.fullscreenElement) {
      if (trackRef.current.requestFullscreen) {
        trackRef.current.requestFullscreen();
        setFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };
  
  // Handle fullscreen change from browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const startRace = () => {
    if (raceFinished) {
      resetRace();
      return;
    }

    if (horses.length === 0) return;

    // Start countdown
    setCountdown(3);
    
    // Play crowd sound if audio is enabled
    if (audioEnabled && audioRefs.current.crowd) {
      audioRefs.current.crowd.play();
    }
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          
          // Actually start race when countdown reaches 0
          startRaceExecution();
          
          // Play bell sound if audio is enabled
          if (audioEnabled && audioRefs.current.startBell) {
            audioRefs.current.startBell.play();
          }
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRaceExecution = () => {
    setIsRacing(true);
    
    // Play galloping sound if audio is enabled
    if (audioEnabled && audioRefs.current.hooves) {
      audioRefs.current.hooves.play();
    }
    
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
          
          // Stop race sounds
          if (audioEnabled) {
            if (audioRefs.current.hooves) audioRefs.current.hooves.pause();
            
            // Play winner sound
            if (audioRefs.current.winner) {
              audioRefs.current.winner.play();
            }
          }
          
          // Check if this was a close finish (within 0.2 seconds)
          const isPhotoFinish = results.length >= 2 && 
            (results[1].time - results[0].time) < 0.2;
            
          if (isPhotoFinish) {
            setPhotoFinish(true);
          }
          
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
    
    // Pause sounds
    if (audioEnabled && audioRefs.current.hooves) {
      audioRefs.current.hooves.pause();
    }
    
    if (raceEngineRef.current) {
      // In a full implementation, we'd pause the race engine
      // raceEngineRef.current.pauseRace();
    }
  };

  const resetRace = () => {
    setIsRacing(false);
    setRaceFinished(false);
    setRaceResults([]);
    setPhotoFinish(false);
    setCurrentTime(0);
    setRaceProgress(0);
    setRaceState(null);
    setCountdown(null);
    setCommentaryText('');
    raceEngineRef.current = null;
    bettingEngineRef.current?.resetBets();
    
    // Stop all sounds
    if (audioEnabled) {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          if (audio.currentTime) {
            audio.currentTime = 0;
          }
        }
      });
    }
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Clear': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'Cloudy': return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'Rainy': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'Windy': return <Wind className="w-4 h-4 text-gray-600" />;
      case 'Stormy': return <CloudLightning className="w-4 h-4 text-purple-500" />;
      case 'Snowy': return <CloudSnow className="w-4 h-4 text-blue-300" />;
      case 'Drizzle': return <CloudDrizzle className="w-4 h-4 text-blue-400" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const getCameraTransform = () => {
    switch (cameraAngle) {
      case 'broadcast':
        return 'perspective(1200px) rotateX(25deg) rotateY(5deg) scale(1.1)';
      case 'aerial':
        return 'perspective(1200px) rotateX(65deg) rotateY(0deg) scale(1.2)';
      case 'finish':
        return 'perspective(1200px) rotateX(20deg) rotateY(-15deg) scale(1.15)';
      case 'closeup':
        return 'perspective(900px) rotateX(10deg) rotateY(5deg) scale(1.5) translateY(30px)';
      default:
        return 'perspective(1000px) rotateX(15deg) rotateY(5deg) scale(1)';
    }
  };
  
  // Update camera transform when angle changes
  useEffect(() => {
    cameraTransform.set(getCameraTransform());
    
    if (cameraAngle === 'closeup' && isRacing) {
      // Return to previous angle after 3 seconds for closeups during race
      const timer = setTimeout(() => {
        setCameraAngle(previousAngle as any || 'track');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [cameraAngle]);
  
  // Set previous angle when changing camera angles
  useEffect(() => {
    setPreviousAngle(cameraAngle);
  }, [cameraAngle]);

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
  
  // Generate race commentary based on race state
  useEffect(() => {
    if (!raceState || !isRacing) return;
    
    // Only update commentary occasionally
    const shouldUpdateCommentary = Math.random() < 0.05;
    if (!shouldUpdateCommentary && commentaryText) return;
    
    const progress = Math.min(100, (raceState.horses[0]?.distanceCovered / raceState.distance) * 100);
    const leader = raceState.horses.find(h => h.position === 1);
    const secondPlace = raceState.horses.find(h => h.position === 2);
    
    if (!leader) return;
    
    const leaderHorse = horses.find(h => h.id === leader.id);
    const secondHorse = secondPlace ? horses.find(h => h.id === secondPlace.id) : null;
    
    // Play commentary sound occasionally
    if (shouldUpdateCommentary && audioEnabled && Math.random() < 0.3) {
      if (commentaryIndex === 0 && audioRefs.current.commentary1) {
        audioRefs.current.commentary1.play();
        setCommentaryIndex(1);
      } else if (commentaryIndex === 1 && audioRefs.current.commentary2) {
        audioRefs.current.commentary2.play();
        setCommentaryIndex(0);
      }
    }
    
    // Early race commentary
    if (progress < 30) {
      const comments = [
        `And they're off! ${leaderHorse?.name} takes an early lead!`,
        `${leaderHorse?.name} breaks well from the gate!`,
        `Good start for ${leaderHorse?.name}, moving to the front of the pack!`,
        `${leaderHorse?.name} showing good early speed!`
      ];
      setCommentaryText(comments[Math.floor(Math.random() * comments.length)]);
    } 
    // Mid-race commentary
    else if (progress < 70) {
      const comments = [
        `${leaderHorse?.name} continues to lead at the halfway mark!`,
        `${leaderHorse?.name} setting a strong pace!`,
        secondHorse ? `${secondHorse.name} is challenging ${leaderHorse?.name} for the lead!` : `${leaderHorse?.name} maintaining the advantage!`,
        `The horses are bunched up as they hit the back straight!`,
        `${leaderHorse?.name} looking comfortable in front!`
      ];
      setCommentaryText(comments[Math.floor(Math.random() * comments.length)]);
    } 
    // Final stretch commentary
    else {
      const comments = [
        `${leaderHorse?.name} entering the final stretch!`,
        `${leaderHorse?.name} digging deep for the finish line!`,
        secondHorse && (leader.distanceCovered - secondPlace.distanceCovered < 2) ? 
          `It's neck and neck between ${leaderHorse?.name} and ${secondHorse.name}!` : 
          `${leaderHorse?.name} pulling away!`,
        `${leaderHorse?.name} charging for home!`,
        `What a finish we're about to see!`
      ];
      setCommentaryText(comments[Math.floor(Math.random() * comments.length)]);
    }
  }, [raceState, isRacing, horses]);

  return (
    <div 
      ref={trackRef}
      className={`bg-gradient-to-b from-green-50 to-green-100 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all ${
        fullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
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
        
        {/* Commentary */}
        {commentaryText && isRacing && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 bg-white bg-opacity-80 px-6 py-3 rounded-full shadow-lg border border-yellow-400 max-w-xl text-center">
            <p className="font-bold text-gray-800 italic">{commentaryText}</p>
          </div>
        )}
        
        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-white w-32 h-32 rounded-full flex items-center justify-center"
              >
                <span className="text-6xl font-bold text-gray-800">{countdown}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Race Controls */}
        <div className="flex items-center gap-2">
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        
          {/* Photo Mode */}
          <button
            onClick={() => setCameraAngle('closeup')}
            className={`p-2 rounded-lg shadow-md transition-colors ${
              cameraAngle === 'closeup' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Camera className="w-5 h-5" />
          </button>
          
          <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
            {['track', 'broadcast', 'aerial', 'finish'].map((angle) => (
              <button
                key={angle}
                onClick={() => setCameraAngle(angle as any)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  cameraAngle === angle ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {angle.charAt(0).toUpperCase() + angle.slice(1)}
              </button>
            ))}
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
              <Flag className="w-4 h-4" />
              {Math.floor(raceProgress)}%
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {currentTime.toFixed(1)}s
            </span>
            {raceState && (
              <span className="flex items-center gap-1">
                <Hourglass className="w-4 h-4" />
                ~{Math.ceil((raceState.distance - (raceState.horses[0]?.distanceCovered || 0)) / 
                  Math.max(1, (raceState.horses[0]?.currentSpeed || 10)))}s
              </span>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${raceProgress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      </div>

      {/* 3D Race Track */}
      <div 
        className={`relative rounded-xl overflow-hidden shadow-inner bg-gradient-to-b ${
          fullscreen ? 'h-[calc(100vh-200px)]' : 'h-[500px]'
        }`}
        style={{
          background: race.surface === 'Turf' 
            ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
            : race.surface === 'Dirt' 
              ? 'linear-gradient(135deg, #d97706, #92400e)' 
              : 'linear-gradient(135deg, #6b7280, #4b5563)'
        }}
      >
        {/* Track Surface with smoother animation */}
        <motion.div 
          className="absolute inset-0"
          style={{ transform: smoothCameraTransform }}
        >
          {/* Sky */}
          <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 transition-opacity duration-500 ${
              race.conditions.weather === 'Clear' ? 'opacity-100' : 'opacity-0'
            }`} style={{background: 'linear-gradient(to bottom, #87CEEB, #E0F7FF)'}}></div>
            
            <div className={`absolute inset-0 transition-opacity duration-500 ${
              race.conditions.weather === 'Cloudy' ? 'opacity-100' : 'opacity-0'
            }`} style={{background: 'linear-gradient(to bottom, #B6B9C3, #E5E7EB)'}}></div>
            
            <div className={`absolute inset-0 transition-opacity duration-500 ${
              race.conditions.weather === 'Rainy' ? 'opacity-100' : 'opacity-0'
            }`} style={{background: 'linear-gradient(to bottom, #64748B, #94A3B8)'}}></div>
            
            <div className={`absolute inset-0 transition-opacity duration-500 ${
              race.conditions.weather === 'Windy' ? 'opacity-100' : 'opacity-0'
            }`} style={{background: 'linear-gradient(to bottom, #93C5FD, #DBEAFE)'}}></div>
          </div>
          
          {/* Track Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 z-5">
            {/* Track Surface Texture */}
            <div className="absolute inset-0 opacity-20">
              {race.surface === 'Dirt' && (
                <div className="absolute inset-0 bg-repeat-x" 
                  style={{
                    backgroundImage: 'url("https://assets.mixkit.co/images/preview/mixkit-dirt-track-texture-68.jpg")',
                    backgroundSize: '100px',
                  }}
                ></div>
              )}
              
              {race.surface === 'Turf' && (
                <div className="absolute inset-0 bg-repeat-x" 
                  style={{
                    backgroundImage: 'url("https://assets.mixkit.co/images/preview/mixkit-green-grass-texture-1200.jpg")',
                    backgroundSize: '100px',
                  }}
                ></div>
              )}
              
              {race.surface === 'Synthetic' && (
                <div className="absolute inset-0 bg-repeat-x" 
                  style={{
                    backgroundImage: 'url("https://assets.mixkit.co/images/preview/mixkit-synthetic-surface-texture-1202.jpg")',
                    backgroundSize: '100px',
                  }}
                ></div>
              )}
            </div>
          </div>
          
          {/* Track Surroundings */}
          <div className="absolute inset-0 z-1">
            {/* Grandstand (simplified) */}
            <div className="absolute top-0 right-0 w-1/3 h-1/4 bg-gray-300 opacity-60" 
              style={{
                background: 'linear-gradient(to bottom, rgba(209,213,219,0.7), rgba(209,213,219,0.3))',
                transform: 'perspective(500px) rotateX(10deg) rotateY(-10deg)'
              }}>
              {/* Windows/details */}
              <div className="grid grid-cols-8 grid-rows-4 gap-1 h-full p-2">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className="bg-blue-100 bg-opacity-30 rounded-sm"></div>
                ))}
              </div>
            </div>
            
            {/* Crowd (simplified) */}
            <div className="absolute top-0 right-[10%] w-1/5 h-[15%]">
              <div className="absolute inset-0 flex flex-wrap">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="w-2 h-2 rounded-full bg-gray-500"
                    style={{
                      x: 10 + (i % 10) * 5,
                      y: Math.floor(i / 10) * 4
                    }}
                    animate={{ y: [0, -2, 0], scale: [1, 1.1, 1] }}
                    transition={{ 
                      duration: 0.5 + Math.random() * 0.5, 
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Lane Dividers */}
          {Array.from({ length: horses.length + 1 }).map((_, index) => (
            <div
              key={index}
              className="absolute border-b border-white border-opacity-40 z-10"
              style={{
                top: `${(index + 1) * (100 / (horses.length + 1))}%`,
                left: '5%',
                right: '5%',
                height: '1px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
          ))}
          
          {/* Start Line */}
          <div className="absolute left-[5%] top-0 bottom-0 w-1 bg-white opacity-80 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          </div>
          
          {/* Finish Line */}
          <div className="absolute right-[5%] top-0 bottom-0 w-2 bg-white opacity-90 z-10">
            {/* Checkered pattern */}
            <div className="h-full w-full relative overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div 
                    className="absolute w-full h-[5%] bg-black" 
                    style={{ top: `${i * 10}%` }}
                  />
                  <div 
                    className="absolute w-full h-[5%] bg-black" 
                    style={{ top: `${i * 10 + 5}%`, left: '50%' }}
                  />
                </React.Fragment>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          </div>

          {/* Distance Markers */}
          {[25, 50, 75].map(percent => (
            <div
              key={percent}
              className="absolute top-0 bottom-0 w-0.5 bg-white opacity-40 z-10"
              style={{ 
                left: `${5 + (percent * 0.9)}%`,
                boxShadow: '0 0 3px rgba(255,255,255,0.8)'
              }}
            />
          ))}
          
          {/* Horse Positions */}
          <AnimatePresence>
            {raceState?.horses.map((horse, index) => {
              const progressPercent = Math.min(90, (horse.distanceCovered / race.distance) * 90);
              const speedPercent = horse.currentSpeed / horse.maxSpeed;
              const displayHorse = horses.find(h => h.id === horse.id);
              
              return displayHorse ? (
                <motion.div
                  key={horse.id}
                  className={`absolute flex items-center z-10 ${
                    showHorseStats === horse.id ? 'z-20' : ''
                  }`}
                  onClick={() => setShowHorseStats(horse.id === showHorseStats ? null : horse.id)}
                  onMouseEnter={() => setShowHorseStats(horse.id)}
                  onMouseLeave={() => setShowHorseStats(null)}
                  style={{
                    top: `${(horse.lane + 1) * (100 / (horses.length + 1)) - 3}%`,
                    left: `${5 + progressPercent}%`
                  }}
                  animate={{
                    left: `${5 + progressPercent}%`,
                    y: [0, -2, 0], // subtle bounce animation
                  }}
                  transition={{ 
                    left: { duration: 0.1, ease: "linear" },
                    y: { 
                      duration: 0.2, 
                      repeat: Infinity, 
                      repeatType: "mirror", 
                      ease: "easeInOut",
                      repeatDelay: 0.1
                    }
                  }}
                >
                  {/* Advanced Horse Sprite */}
                  <div className="relative cursor-pointer">
                    <motion.div
                      className={`horse-body relative ${
                        horse.position === 1 ? 'z-10' : ''
                      }`}
                      animate={{ 
                        rotateX: [0, 5, 0, -5, 0],
                        y: [0, -3, 0, -3, 0]
                      }}
                      transition={{ 
                        duration: 0.3 + (1 - speedPercent) * 0.5, // slower animation when horse is tired
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "linear" 
                      }}
                    >
                      {/* Horse body - more detailed */}
                      <div className="relative">
                        {/* Main body */}
                        <div 
                          className="w-12 h-7 rounded-lg shadow-lg overflow-hidden border border-black border-opacity-30"
                          style={{ backgroundColor: getHorseColor(displayHorse) }}
                        >
                          {/* Saddle */}
                          <div 
                            className="absolute top-0 w-5 h-2 rounded"
                            style={{ 
                              right: '3px',
                              backgroundColor: `hsl(${horse.id.charCodeAt(0) % 360}, 70%, 60%)`,
                              boxShadow: '0 1px 1px rgba(0,0,0,0.3)'
                            }}
                          />
                          
                          {/* Legs - animated */}
                          <div className="absolute bottom-0 left-1 w-1 h-2 bg-black opacity-60 animate-[gallop_0.2s_ease-in-out_infinite]"></div>
                          <div className="absolute bottom-0 left-3 w-1 h-2 bg-black opacity-60 animate-[gallop_0.2s_ease-in-out_infinite_0.1s]"></div>
                          <div className="absolute bottom-0 right-1 w-1 h-2 bg-black opacity-60 animate-[gallop_0.2s_ease-in-out_infinite_0.15s]"></div>
                          <div className="absolute bottom-0 right-3 w-1 h-2 bg-black opacity-60 animate-[gallop_0.2s_ease-in-out_infinite_0.05s]"></div>
                          
                          {/* Mane */}
                          <div className="absolute top-0 left-1 w-3 h-1 bg-black opacity-70"></div>
                        </div>
                        
                        {/* Head */}
                        <div 
                          className="absolute left-[-5px] top-1 w-6 h-4 transform rotate-[30deg]"
                          style={{ 
                            backgroundColor: getHorseColor(displayHorse),
                            borderRadius: '60% 40% 40% 20%',
                            border: '1px solid rgba(0,0,0,0.3)'
                          }}
                        />
                        
                        {/* Tail */}
                        <div 
                          className="absolute -right-2 top-2 w-3 h-5 transform -rotate-[20deg] origin-top"
                          style={{ 
                            backgroundColor: getHorseColor(displayHorse),
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                            opacity: 0.8
                          }}
                        />
                      </div>
                      
                      {/* Speed lines when moving fast */}
                      {horse.currentSpeed > horse.maxSpeed * 0.7 && (
                        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                          <motion.div
                            animate={{ 
                              opacity: [0.7, 0.4, 0.7],
                              x: [0, -2, 0]
                            }}
                            transition={{ 
                              duration: 0.15, 
                              repeat: Infinity,
                              repeatType: "reverse" 
                            }}
                          >
                            <div className="w-3 h-0.5 bg-white opacity-70 mb-1" />
                            <div className="w-2 h-0.5 bg-white opacity-50 mb-1" />
                            <div className="w-1 h-0.5 bg-white opacity-30" />
                          </motion.div>
                        </div>
                      )}
                      
                      {/* Dust cloud effect */}
                      {race.surface === 'Dirt' && speedPercent > 0.4 && (
                        <div className="absolute -bottom-1 left-1 transform -translate-x-1/2">
                          <motion.div
                            animate={{ 
                              opacity: [0.5, 0.2, 0],
                              scale: [0.5, 1, 1.5],
                              x: [-2, -4, -6]
                            }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity,
                              repeatType: "loop" 
                            }}
                            className="w-4 h-2 bg-amber-300 rounded-full opacity-30"
                          />
                        </div>
                      )}
                    </motion.div>

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
                          'bg-red-500 animate-pulse'
                        }`}
                        style={{ width: `${horse.energy}%` }}
                      />
                    </div>

                    {/* Enhanced Speed indicator */}
                    <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-xs font-bold text-white bg-black bg-opacity-70 px-1 py-0.5 rounded">
                      {Math.round(horse.currentSpeed)}
                    </div>
                    
                    {/* Hover Details Card */}
                    <AnimatePresence>
                      {showHorseStats === horse.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-48 z-30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-800">{displayHorse.name}</h4>
                            <div className={`px-2 py-1 text-[10px] rounded-full font-semibold ${
                              horse.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                              horse.position === 2 ? 'bg-gray-100 text-gray-800' :
                              horse.position === 3 ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              Position: {horse.position}
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Speed:</span>
                              <span className="font-semibold">{Math.round(horse.currentSpeed)}/{Math.round(horse.maxSpeed)} m/s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Distance:</span>
                              <span className="font-semibold">{Math.round(horse.distanceCovered)}/{raceState.distance}m</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Energy:</span>
                              <span className="font-semibold">{Math.round(horse.energy)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Race Record:</span>
                              <span className="font-semibold">{displayHorse.stats.wins}W/{displayHorse.stats.races}R</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : null;
            })}
          </AnimatePresence>
        </motion.div>
        
        {/* Enhanced Weather Effects */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Rain Effect */}
          <div className={`transition-opacity duration-500 ${
            race.conditions.weather === 'Rainy' ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0">
              {Array.from({ length: 150 }, (_, i) => (
                <motion.div
                  key={`rain-${i}`}
                  className="absolute w-0.5 h-8 bg-blue-200 opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    y: [0, 500],
                    x: [0, -20],
                    opacity: [0.7, 0.3, 0]
                  }}
                  transition={{
                    duration: 0.7 + Math.random() * 0.5,
                    repeat: Infinity,
                    delay: Math.random() * 1.5,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Wind Effect */}
          <div className={`transition-opacity duration-500 ${
            race.conditions.weather === 'Windy' ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Wind gusts */}
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div
                key={`wind-${i}`}
                className="absolute h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                style={{
                  top: `${15 + Math.random() * 70}%`,
                  width: `${50 + Math.random() * 50}%`,
                  left: '-50%'
                }}
                animate={{
                  x: ['0%', '150%']
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Blowing particles */}
            {Array.from({ length: 25 }, (_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 rounded-full bg-white opacity-40"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: '-5%'
                }}
                animate={{
                  x: ['0%', '105%'],
                  y: [0, Math.random() > 0.5 ? 20 : -20]
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
          
          {/* Cloudy Effect */}
          <div className={`transition-opacity duration-500 ${
            race.conditions.weather === 'Cloudy' ? 'opacity-100' : 'opacity-0'
          }`}>
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={`cloud-${i}`}
                className="absolute bg-white opacity-70 rounded-full"
                style={{
                  top: `${10 + Math.random() * 30}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${80 + Math.random() * 120}px`,
                  height: `${50 + Math.random() * 40}px`,
                  filter: 'blur(15px)'
                }}
                animate={{
                  x: [0, Math.random() > 0.5 ? 20 : -20]
                }}
                transition={{
                  duration: 10 + Math.random() * 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Track Conditions */}
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
      <div className="mt-6 bg-white rounded-xl p-4 shadow-lg relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Live Positions
          </h3>
          
          <div className="flex items-center text-sm">
            <span className={`px-3 py-1 rounded-lg font-semibold ${
              isRacing ? 'bg-green-100 text-green-800 animate-pulse' : 'bg-gray-100 text-gray-600'
            }`}>
              {raceFinished ? 'Race Complete' : isRacing ? 'Race in Progress' : 'Ready to Race'}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          {(raceState?.horses || horses.map((horse, i) => ({
            id: horse.id,
            name: horse.name,
            position: i + 1,
            currentSpeed: 0,
            energy: 100,
            distanceCovered: 0,
            lane: i
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
                      index === 0 && raceState ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                      index === 1 && raceState ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' :
                      index === 2 && raceState ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
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
                              className={`h-full rounded-full transition-all animate-pulse ${
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
            className={`absolute inset-0 transition-opacity duration-500 ${
              race.conditions.trackCondition === 'Fast' ? 'opacity-0' : 
              race.conditions.trackCondition === 'Good' ? 'opacity-20' : 
              race.conditions.trackCondition === 'Soft' ? 'opacity-40' : 
              'opacity-60'
            }`}
            style={{
              background: race.conditions.trackCondition === 'Heavy' ? 
                'radial-gradient(circle, rgba(0,0,0,0.2) 10%, transparent 10%)' : 
                race.conditions.trackCondition === 'Soft' ?
                'radial-gradient(circle, rgba(0,0,0,0.1) 5%, transparent 5%)' : 
                'none',
              backgroundSize: '20px 20px'
            }}
            })}
        </div>
      </div>

      {/* Race Results */}
      <AnimatePresence mode="wait">
        {photoFinish && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-6 bg-white rounded-xl p-6 border-2 border-red-500"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Camera className="w-6 h-6 text-red-600 animate-pulse" />
              <h3 className="text-xl font-bold text-gray-800">Photo Finish!</h3>
            </div>
            
            <div className="p-4 bg-black rounded-lg relative overflow-hidden">
              <div className="flex items-end h-20 justify-around">
                {raceResults.slice(0, 2).map((result, i) => {
                  const displayHorse = horses.find(h => h.id === result.horseId);
                  return displayHorse ? (
                    <div key={result.horseId} className="relative">
                      {/* Simplified horse at finish line */}
                      <div className="relative h-16">
                        <div
                          className="w-14 h-8 rounded-lg shadow"
                          style={{ backgroundColor: getHorseColor(displayHorse) }}
                        >
                          {/* Simplified jockey */}
                          <div 
                            className="absolute top-0 w-6 h-3 rounded"
                            style={{ 
                              right: '3px',
                              backgroundColor: i === 0 ? '#FEF08A' : '#E5E7EB' 
                            }}
                          />
                          
                          {/* Position */}
                          <div className="absolute -top-4 -left-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              i === 0 ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}>
                              {i + 1}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-white font-semibold mt-1">
                          {displayHorse.name.slice(0, 10)}{displayHorse.name.length > 10 ? '...' : ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          {result.time.toFixed(3)}s
                        </p>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
              
              {/* Finish line */}
              <div className="absolute h-full w-1 bg-white right-[30%] top-0">
                <div className="h-full w-full">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-full h-[10%] bg-black" 
                      style={{ top: `${i * 20}%` }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Time difference */}
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <p className="text-xs text-yellow-400 font-semibold">
                  Winning margin: {(raceResults[1]?.time - raceResults[0]?.time).toFixed(3)}s
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {raceFinished && raceResults.length > 0 && !photoFinish && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-6 shadow-lg"
          >
            <div className="text-center text-white relative overflow-hidden">
              {/* Confetti animation */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 50 }, (_, i) => (
                  <motion.div
                    key={`confetti-${i}`}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][Math.floor(Math.random() * 5)],
                      left: `${Math.random() * 100}%`,
                      top: '-5%'
                    }}
                    animate={{
                      y: [0, Math.random() * 100 + 100],
                      x: [0, (Math.random() - 0.5) * 100],
                      rotate: [0, Math.random() > 0.5 ? 180 : -180],
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="w-8 h-8" />
                <h3 className="text-2xl font-bold animate-pulse">Race Complete!</h3>
                <Trophy className="w-8 h-8" />
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white border-opacity-30">
                <p className="text-xl font-semibold flex items-center justify-center gap-2">
                  <Award className="w-6 h-6 text-yellow-300" />
                  Winner: {raceResults[0]?.name}
                </p>
                <p className="text-lg">Time: {raceResults[0]?.time.toFixed(2)} seconds</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                {[0, 1, 2].map((place) => {
                  const result = raceResults[place];
                  const emoji = ['🥇', '🥈', '🥉'][place];
                  const medal = place === 0 ? 'gold' : place === 1 ? 'silver' : 'bronze';
                  
                  return (
                    <div 
                      key={`place-${place}`} 
                      className={`bg-white bg-opacity-20 rounded-lg p-3 border border-white border-opacity-20 backdrop-blur-sm ${
                        place === 0 ? 'shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 
                        place === 1 ? 'shadow-[0_0_10px_rgba(192,192,192,0.3)]' : 
                        'shadow-[0_0_5px_rgba(205,127,50,0.3)]'
                      }`}
                    >
                      <p className="font-semibold flex items-center gap-1">
                        <span>{emoji}</span>
                        <span>{['1st', '2nd', '3rd'][place]} Place</span>
                      </p>
                      <p className="truncate">{result?.name || 'N/A'}</p>
                      {result && <p className="text-xs opacity-80">{result.time.toFixed(2)}s</p>}
                    </div>
                  );
                })}
              </div>
              
              {/* Race Statistics */}
              <div className="bg-black bg-opacity-30 rounded-lg p-3 backdrop-blur-sm">
                <h4 className="font-medium mb-2 text-yellow-100">Race Statistics</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-yellow-200" />
                    <span>Avg. Speed: {(race.distance / raceResults[0]?.time).toFixed(1)} m/s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flag className="w-3 h-3 text-yellow-200" />
                    <span>Winning Time: {raceResults[0]?.time.toFixed(2)}s</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add global animation for galloping effect to the CSS
const GlobalStyle = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes gallop {
        0% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
        100% { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
};

// Render the GlobalStyle along with RaceTrack
const EnhancedRaceTrack: React.FC<RaceTrackProps> = (props) => {
  return (
    <>
      <GlobalStyle />
      <RaceTrack {...props} />
    </>
  );
};

export default RaceTrack;