import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  MessageCircle, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Zap,
  Brain,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Send,
  Lightbulb,
  BarChart3,
  Heart,
  Trophy,
  Eye
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import aiService, { type RaceAnalysis, type TrainingRecommendation, type MarketIntelligence } from '../services/aiService';

interface AIInsight {
  type: 'training' | 'racing' | 'market' | 'breeding' | 'general';
  title: string;
  content: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  insights?: AIInsight[];
}

const AIAssistant: React.FC = () => {
  const { player, horses, upcomingRaces } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'chat' | 'predictions'>('insights');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [raceAnalysis, setRaceAnalysis] = useState<RaceAnalysis | null>(null);
  const [trainingRecs, setTrainingRecs] = useState<TrainingRecommendation[]>([]);
  const [marketIntel, setMarketIntel] = useState<MarketIntelligence | null>(null);

  useEffect(() => {
    initializeAI();
    generateInsights();
  }, [player, horses]);

  const initializeAI = async () => {
    await aiService.initialize();
    addMessage('ai', "🤖 AI Assistant activated! I'm here to help you dominate the horse racing world. Ask me anything about training, racing, breeding, or market strategy!");
  };

  const generateInsights = async () => {
    if (!player || horses.length === 0) return;

    const newInsights: AIInsight[] = [];

    // Generate training insights
    const playerHorses = horses.filter(h => h.owner === player.walletAddress);
    for (const horse of playerHorses.slice(0, 3)) {
      try {
        const trainingRec = await aiService.generateTrainingRecommendations(horse, player);
        newInsights.push({
          type: 'training',
          title: `${horse.name} Training Optimization`,
          content: trainingRec.longTermStrategy,
          confidence: 85,
          priority: 'high',
          actionable: true,
          timestamp: Date.now()
        });
      } catch (error) {
        // Fallback insight
        newInsights.push({
          type: 'training',
          title: `${horse.name} Needs Attention`,
          content: `Consider focusing on ${horse.genetics.baseSpeed < 70 ? 'speed' : 'stamina'} training to improve performance`,
          confidence: 75,
          priority: 'medium',
          actionable: true,
          timestamp: Date.now()
        });
      }
    }

    // Generate market insights
    try {
      const marketData = {
        avgPrice: horses.reduce((sum, h) => sum + (h.price || 0), 0) / horses.length,
        totalVolume: horses.reduce((sum, h) => sum + (h.price || 0), 0)
      };
      const marketAnalysis = await aiService.generateMarketIntelligence(horses, marketData);
      
      newInsights.push({
        type: 'market',
        title: 'Market Opportunity Detected',
        content: marketAnalysis.investmentOpportunities[0] || 'Look for undervalued horses with high potential',
        confidence: 78,
        priority: 'medium',
        actionable: true,
        timestamp: Date.now()
      });
    } catch (error) {
      newInsights.push({
        type: 'market',
        title: 'Market Analysis',
        content: 'Current market conditions favor strategic investments in young, high-potential horses',
        confidence: 70,
        priority: 'medium',
        actionable: true,
        timestamp: Date.now()
      });
    }

    // Generate racing insights
    if (upcomingRaces.length > 0) {
      try {
        const race = upcomingRaces[0];
        const raceHorses = horses.slice(0, 6);
        const analysis = await aiService.analyzeRace(race, raceHorses);
        setRaceAnalysis(analysis);
        
        newInsights.push({
          type: 'racing',
          title: `${race.name} Strategy`,
          content: analysis.keyFactors[0] || 'Weather and track conditions will be crucial factors',
          confidence: 82,
          priority: 'high',
          actionable: true,
          timestamp: Date.now()
        });
      } catch (error) {
        newInsights.push({
          type: 'racing',
          title: 'Race Strategy',
          content: 'Focus on horses with strong stamina for upcoming longer distance races',
          confidence: 70,
          priority: 'medium',
          actionable: true,
          timestamp: Date.now()
        });
      }
    }

    setInsights(newInsights);
  };

  const addMessage = (type: 'user' | 'ai', content: string, insights?: AIInsight[]) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: Date.now(),
      insights
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    addMessage('user', userMessage);
    setIsThinking(true);

    try {
      // Process user message with AI (simplified for demo)
      let aiResponse = '';
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('train')) {
        aiResponse = "🏋️ For optimal training, I recommend focusing on your horses' weakest stats first. Speed training in the morning, stamina work in the afternoon for best results!";
      } else if (lowerMessage.includes('breed')) {
        aiResponse = "🧬 Breeding success depends on genetic compatibility. Look for complementary bloodlines and consider the offspring's potential market value!";
      } else if (lowerMessage.includes('race') || lowerMessage.includes('bet')) {
        aiResponse = "🏁 Racing strategy is key! Analyze track conditions, weather, and each horse's strengths. Don't just bet on favorites - look for value picks!";
      } else if (lowerMessage.includes('market') || lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
        aiResponse = "💰 Market timing is everything! Young horses with high genetic potential are great long-term investments. Watch for panic sellers after losses!";
      } else {
        aiResponse = "🤖 I'm here to help with training, racing, breeding, and market strategies! What specific aspect would you like to discuss?";
      }

      setTimeout(() => {
        addMessage('ai', aiResponse);
        setIsThinking(false);
      }, 1500);
    } catch (error) {
      setTimeout(() => {
        addMessage('ai', "🤖 I'm processing a lot of data right now. Let me help you with some general strategy tips instead!");
        setIsThinking(false);
      }, 1000);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'training': return <Zap className="w-4 h-4" />;
      case 'racing': return <Trophy className="w-4 h-4" />;
      case 'market': return <DollarSign className="w-4 h-4" />;
      case 'breeding': return <Heart className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-300 bg-green-50 text-green-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Racing Assistant</h3>
                    <p className="text-sm opacity-90">Your strategic advisor</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1 mt-4">
                {[
                  { id: 'insights', label: 'Insights', icon: Lightbulb },
                  { id: 'chat', label: 'Chat', icon: MessageCircle },
                  { id: 'predictions', label: 'Predictions', icon: BarChart3 }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-purple-600'
                        : 'text-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="h-80 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'insights' && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 h-full overflow-y-auto"
                  >
                    <div className="space-y-3">
                      {insights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-xl border-2 ${getPriorityColor(insight.priority)}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-1">
                              {getInsightIcon(insight.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                              <p className="text-xs leading-relaxed">{insight.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs opacity-75">
                                  Confidence: {insight.confidence}%
                                </span>
                                {insight.actionable && (
                                  <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full">
                                    Actionable
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {insights.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Analyzing your data...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-2xl text-sm ${
                              message.type === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                      
                      {isThinking && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 p-3 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                              <span className="text-xs text-gray-600">AI thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Ask about strategy, training, or markets..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isThinking}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'predictions' && (
                  <motion.div
                    key="predictions"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 h-full overflow-y-auto"
                  >
                    {raceAnalysis ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Race Predictions</h4>
                          <div className="space-y-2">
                            {raceAnalysis.predictions.slice(0, 3).map((pred, index) => {
                              const horse = horses.find(h => h.id === pred.horseId);
                              return (
                                <div key={pred.horseId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                      index === 0 ? 'bg-yellow-500' :
                                      index === 1 ? 'bg-gray-400' :
                                      'bg-orange-500'
                                    }`}>
                                      {index + 1}
                                    </span>
                                    <span className="font-medium text-sm">{horse?.name}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-green-600">
                                    {pred.winProbability.toFixed(1)}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Key Factors</h4>
                          <div className="space-y-1">
                            {raceAnalysis.keyFactors.map((factor, index) => (
                              <p key={index} className="text-xs text-gray-600 flex items-start gap-2">
                                <Target className="w-3 h-3 mt-0.5 text-blue-500" />
                                {factor}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No race data to analyze</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:from-purple-600 hover:to-blue-700 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isExpanded ? <ChevronDown className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default AIAssistant;