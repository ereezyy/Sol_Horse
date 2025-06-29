import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Zap, 
  Target,
  DollarSign,
  Trophy,
  Activity,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Eye,
  Calendar,
  Star
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import aiService, { type RaceAnalysis, type MarketIntelligence } from '../services/aiService';

interface PredictionModel {
  id: string;
  name: string;
  type: 'race_outcome' | 'market_price' | 'breeding_success' | 'training_efficiency';
  accuracy: number;
  confidence: number;
  lastUpdated: number;
  predictions: any[];
}

interface MarketPrediction {
  horseId: string;
  currentPrice: number;
  predictedPrice: number;
  timeframe: string;
  probability: number;
  factors: string[];
}

interface PerformancePrediction {
  horseId: string;
  nextRaceWinProbability: number;
  optimalRaceType: string;
  expectedEarnings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const PredictiveAnalytics: React.FC = () => {
  const { horses, upcomingRaces, player } = useGameStore();
  const [selectedModel, setSelectedModel] = useState<string>('race_outcome');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [marketPredictions, setMarketPredictions] = useState<MarketPrediction[]>([]);
  const [performancePredictions, setPerformancePredictions] = useState<PerformancePrediction[]>([]);
  const [raceAnalysis, setRaceAnalysis] = useState<RaceAnalysis | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    initializeModels();
    runPredictiveAnalysis();
  }, [horses, upcomingRaces]);

  const initializeModels = () => {
    const predictionModels: PredictionModel[] = [
      {
        id: 'race_outcome',
        name: 'Race Outcome Predictor',
        type: 'race_outcome',
        accuracy: 78.5,
        confidence: 82,
        lastUpdated: Date.now(),
        predictions: []
      },
      {
        id: 'market_price',
        name: 'Market Price Forecaster',
        type: 'market_price',
        accuracy: 73.2,
        confidence: 76,
        lastUpdated: Date.now(),
        predictions: []
      },
      {
        id: 'breeding_success',
        name: 'Breeding Success Analyzer',
        type: 'breeding_success',
        accuracy: 84.1,
        confidence: 88,
        lastUpdated: Date.now(),
        predictions: []
      },
      {
        id: 'training_efficiency',
        name: 'Training Efficiency Optimizer',
        type: 'training_efficiency',
        accuracy: 91.3,
        confidence: 95,
        lastUpdated: Date.now(),
        predictions: []
      }
    ];

    setModels(predictionModels);
  };

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      // Generate race predictions
      if (upcomingRaces.length > 0) {
        const race = upcomingRaces[0];
        const raceHorses = horses.slice(0, 8);
        const analysis = await aiService.analyzeRace(race, raceHorses);
        setRaceAnalysis(analysis);
      }

      // Generate market predictions
      const marketPreds: MarketPrediction[] = horses.slice(0, 5).map(horse => {
        const basePrice = horse.price || 50000;
        const volatility = 0.2 + Math.random() * 0.3;
        const trendFactor = Math.random() - 0.5;
        
        return {
          horseId: horse.id,
          currentPrice: basePrice,
          predictedPrice: Math.round(basePrice * (1 + trendFactor * volatility)),
          timeframe: '7 days',
          probability: 70 + Math.random() * 25,
          factors: [
            `${horse.genetics.rarity} rarity premium`,
            `Performance trend analysis`,
            `Market sentiment indicator`
          ]
        };
      });
      setMarketPredictions(marketPreds);

      // Generate performance predictions
      const perfPreds: PerformancePrediction[] = horses.slice(0, 6).map(horse => {
        const winRate = horse.stats.races > 0 ? horse.stats.wins / horse.stats.races : 0.5;
        const statAvg = (horse.genetics.baseSpeed + horse.genetics.stamina + horse.genetics.agility) / 300;
        
        return {
          horseId: horse.id,
          nextRaceWinProbability: Math.min(95, Math.max(5, (winRate * 40 + statAvg * 60) * 100)),
          optimalRaceType: horse.genetics.baseSpeed > horse.genetics.stamina ? 'Sprint' : 'Distance',
          expectedEarnings: Math.round((winRate * 30000 + statAvg * 20000) * (1 + Math.random() * 0.5)),
          riskLevel: winRate > 0.6 ? 'low' : winRate > 0.3 ? 'medium' : 'high'
        };
      });
      setPerformancePredictions(perfPreds);

      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error running predictive analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'race_outcome': return <Trophy className="w-5 h-5" />;
      case 'market_price': return <DollarSign className="w-5 h-5" />;
      case 'breeding_success': return <Sparkles className="w-5 h-5" />;
      case 'training_efficiency': return <Zap className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-green-600 bg-green-100';
    if (accuracy >= 75) return 'text-blue-600 bg-blue-100';
    if (accuracy >= 65) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Predictive Analytics</h1>
              <p className="text-gray-600">AI-powered insights for strategic decision making</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={runPredictiveAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Prediction Models</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {models.map((model) => (
            <motion.div
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedModel === model.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  selectedModel === model.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getModelIcon(model.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{model.name}</h4>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Accuracy</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(model.accuracy)}`}>
                    {model.accuracy}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${model.confidence}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {model.confidence}% confidence
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Predictions Display */}
      <AnimatePresence mode="wait">
        {selectedModel === 'race_outcome' && (
          <motion.div
            key="race_outcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Race Outcome Predictions
            </h3>
            
            {raceAnalysis ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Win Probabilities</h4>
                    <div className="space-y-3">
                      {(raceAnalysis.predictions || []).slice(0, 5).map((pred, index) => {
                        const horse = horses.find(h => h.id === pred.horseId);
                        return (
                          <div key={pred.horseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-500' :
                                'bg-gray-300'
                              }`}>
                                {pred.expectedPosition}
                              </span>
                              <div>
                                <p className="font-semibold text-gray-800">{horse?.name}</p>
                                <p className="text-sm text-gray-600">{horse?.genetics.bloodline}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                {pred.winProbability.toFixed(1)}%
                              </p>
                              <p className="text-xs text-gray-500">
                                {pred.confidence.toFixed(0)}% confidence
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Key Analysis Points</h4>
                    <div className="space-y-3">
                      {(raceAnalysis.keyFactors || []).map((factor, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                          <p className="text-sm text-gray-700">{factor}</p>
                        </div>
                      ))}
                      
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-yellow-800 text-sm">Weather Impact</p>
                            <p className="text-sm text-yellow-700">{raceAnalysis.weatherImpact || 'Analyzing weather conditions...'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2">Race Narrative</h4>
                  <p className="text-indigo-700 leading-relaxed">{raceAnalysis.raceNarrative || 'Generating race analysis...'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No upcoming races to analyze</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedModel === 'market_price' && (
          <motion.div
            key="market_price"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Market Price Forecasts
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {marketPredictions.map((pred) => {
                const horse = horses.find(h => h.id === pred.horseId);
                const priceChange = pred.predictedPrice - pred.currentPrice;
                const changePercent = (priceChange / pred.currentPrice) * 100;
                
                return (
                  <div key={pred.horseId} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">{horse?.name}</h4>
                        <p className="text-sm text-gray-600">{horse?.genetics.rarity} {horse?.genetics.bloodline}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        changePercent > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Price</p>
                        <p className="text-lg font-bold text-gray-800">
                          {pred.currentPrice.toLocaleString()} $TURF
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Predicted ({pred.timeframe})</p>
                        <p className={`text-lg font-bold ${
                          changePercent > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {pred.predictedPrice.toLocaleString()} $TURF
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Probability</span>
                        <span className="text-sm font-semibold">{pred.probability.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${pred.probability}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">Key Factors:</p>
                      {(pred.factors || []).slice(0, 2).map((factor, index) => (
                        <p key={index} className="text-xs text-gray-500">• {factor}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {selectedModel === 'training_efficiency' && (
          <motion.div
            key="training_efficiency"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Training Efficiency Analysis
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {performancePredictions.map((pred) => {
                const horse = horses.find(h => h.id === pred.horseId);
                
                return (
                  <div key={pred.horseId} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">{horse?.name}</h4>
                        <p className="text-sm text-gray-600">{horse?.genetics.bloodline}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pred.riskLevel)}`}>
                        {pred.riskLevel} risk
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Next Race Win Probability</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${pred.nextRaceWinProbability}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-green-600">
                            {pred.nextRaceWinProbability.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Optimal Race Type</p>
                        <p className="font-semibold text-gray-800">{pred.optimalRaceType}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Expected Earnings</p>
                        <p className="text-lg font-bold text-green-600">
                          {pred.expectedEarnings.toLocaleString()} $TURF
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Performance Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Model Performance Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {models.reduce((sum, m) => sum + m.accuracy, 0) / models.length}%
            </p>
            <p className="text-sm text-gray-600">Avg Accuracy</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{models.length}</p>
            <p className="text-sm text-gray-600">Active Models</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {Math.max(...models.map(m => m.accuracy))}%
            </p>
            <p className="text-sm text-gray-600">Best Model</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <Calendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">24/7</p>
            <p className="text-sm text-gray-600">Monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;