import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Trophy, 
  DollarSign,
  Calendar,
  Eye,
  Zap,
  Heart,
  Star,
  Crown,
  Activity,
  PieChart,
  LineChart,
  Filter,
  Download,
  Share
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface PerformanceData {
  period: string;
  races: number;
  wins: number;
  earnings: number;
  winRate: number;
}

interface HorseAnalytics {
  horseId: string;
  horseName: string;
  totalRaces: number;
  totalWins: number;
  totalEarnings: number;
  avgEarningsPerRace: number;
  winRate: number;
  recentForm: ('W' | 'L')[];
}

const AnalyticsDashboard: React.FC = () => {
  const { player, horses } = useGameStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'winRate' | 'earnings' | 'races'>('winRate');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [horseAnalytics, setHorseAnalytics] = useState<HorseAnalytics[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  const playerHorses = horses.filter(h => h.owner === player?.walletAddress);

  useEffect(() => {
    generatePerformanceData();
    generateHorseAnalytics();
  }, [selectedPeriod, playerHorses]);

  const generatePerformanceData = () => {
    const periods = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': 365
    };

    const days = periods[selectedPeriod];
    const data: PerformanceData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate performance data
      const races = Math.floor(Math.random() * 5) + 1;
      const wins = Math.floor(races * (0.2 + Math.random() * 0.4));
      const earnings = wins * (1000 + Math.random() * 5000);
      
      data.push({
        period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        races,
        wins,
        earnings,
        winRate: races > 0 ? (wins / races) * 100 : 0
      });
    }

    setPerformanceData(data);
  };

  const generateHorseAnalytics = () => {
    const analytics: HorseAnalytics[] = playerHorses.map(horse => {
      const recentForm: ('W' | 'L')[] = Array.from({ length: 10 }, () => 
        Math.random() > 0.6 ? 'W' : 'L'
      );

      return {
        horseId: horse.id,
        horseName: horse.name,
        totalRaces: horse.stats.races,
        totalWins: horse.stats.wins,
        totalEarnings: horse.stats.earnings,
        avgEarningsPerRace: horse.stats.races > 0 ? horse.stats.earnings / horse.stats.races : 0,
        winRate: horse.stats.races > 0 ? (horse.stats.wins / horse.stats.races) * 100 : 0,
        recentForm
      };
    });

    // Sort by selected metric
    analytics.sort((a, b) => {
      switch (selectedMetric) {
        case 'winRate': return b.winRate - a.winRate;
        case 'earnings': return b.totalEarnings - a.totalEarnings;
        case 'races': return b.totalRaces - a.totalRaces;
        default: return 0;
      }
    });

    setHorseAnalytics(analytics);
  };

  const getMaxValue = (data: PerformanceData[], key: keyof PerformanceData) => {
    return Math.max(...data.map(d => Number(d[key])));
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'winRate': return <Target className="w-5 h-5" />;
      case 'earnings': return <DollarSign className="w-5 h-5" />;
      case 'races': return <Trophy className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getFormColor = (result: 'W' | 'L') => {
    return result === 'W' ? 'bg-green-500' : 'bg-red-500';
  };

  const calculateTrend = () => {
    if (performanceData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = performanceData.slice(-7);
    const older = performanceData.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, d) => sum + d[selectedMetric], 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d[selectedMetric], 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      percentage: Math.abs(change)
    };
  };

  const trend = calculateTrend();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track performance, analyze trends, and optimize your racing strategy</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Time Period:</span>
            </div>
            <div className="flex gap-2">
              {[
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: '90d', label: '90 Days' },
                { id: 'all', label: 'All Time' }
              ].map(period => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPeriod === period.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Metric:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="winRate">Win Rate</option>
              <option value="earnings">Earnings</option>
              <option value="races">Races</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              trend.direction === 'up' ? 'text-green-600' :
              trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
              {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
              {trend.percentage.toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {player?.stats.wins || 0}
          </p>
          <p className="text-sm text-gray-600">Total Wins</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">
              Last 30 days
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {((player?.stats.wins || 0) / Math.max(player?.stats.totalRaces || 1, 1) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Win Rate</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12.5%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {((player?.stats.totalEarnings || 0) / 1000).toFixed(1)}K
          </p>
          <p className="text-sm text-gray-600">Total Earnings</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-sm text-gray-600">
              Active horses
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {playerHorses.length}
          </p>
          <p className="text-sm text-gray-600">Stable Size</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LineChart className="w-6 h-6 text-blue-600" />
            Performance Trends
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {getMetricIcon(selectedMetric)}
            <span className="capitalize">{selectedMetric.replace(/([A-Z])/g, ' $1')}</span>
          </div>
        </div>

        <div className="relative h-64 bg-gray-50 rounded-xl p-4">
          <div className="flex items-end justify-between h-full gap-2">
            {performanceData.map((data, index) => {
              const maxValue = getMaxValue(performanceData, selectedMetric);
              const height = maxValue > 0 ? (Number(data[selectedMetric]) / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group cursor-pointer min-h-[8px]"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 5)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {selectedMetric === 'winRate' ? `${Number(data[selectedMetric]).toFixed(1)}%` :
                       selectedMetric === 'earnings' ? `$${Number(data[selectedMetric]).toLocaleString()}` :
                       Number(data[selectedMetric]).toString()}
                    </div>
                  </motion.div>
                  <span className="text-xs text-gray-600 transform -rotate-45 origin-center">
                    {data.period}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Horse Performance Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-600" />
            Top Performers
          </h3>
          
          <div className="space-y-4">
            {horseAnalytics.slice(0, 5).map((horse, index) => (
              <div key={horse.horseId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-600' :
                  'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{horse.horseName}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {horse.totalWins}W/{horse.totalRaces}R
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {horse.winRate.toFixed(1)}% WR
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {(horse.totalEarnings / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-gray-600">Earnings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" />
            Recent Form
          </h3>
          
          <div className="space-y-4">
            {horseAnalytics.slice(0, 5).map((horse) => (
              <div key={horse.horseId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">{horse.horseName}</h4>
                  <div className="flex items-center gap-1">
                    {horse.recentForm.map((result, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getFormColor(result)}`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last 10 races</p>
                  <p className="font-semibold text-gray-800">
                    {horse.recentForm.filter(r => r === 'W').length}/10
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-purple-600" />
          Detailed Horse Analytics
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Horse</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Races</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Wins</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Win Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Earnings</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg/Race</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Form</th>
              </tr>
            </thead>
            <tbody>
              {horseAnalytics.map((horse, index) => (
                <tr key={horse.horseId} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800">{horse.horseName}</div>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700">{horse.totalRaces}</td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">{horse.totalWins}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      horse.winRate >= 50 ? 'bg-green-100 text-green-800' :
                      horse.winRate >= 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {horse.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 font-semibold text-gray-800">
                    {horse.totalEarnings.toLocaleString()}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700">
                    {horse.avgEarningsPerRace.toFixed(0)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {horse.recentForm.slice(0, 5).map((result, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${getFormColor(result)}`}
                          title={result === 'W' ? 'Win' : 'Loss'}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Export Analytics Data</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg">
                    <option>CSV (Excel compatible)</option>
                    <option>JSON (Raw data)</option>
                    <option>PDF (Report format)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>All time</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle export logic here
                    setShowExportModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Export Data
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsDashboard;