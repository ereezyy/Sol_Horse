import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trophy, 
  Target, 
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Zap,
  Crown,
  Award,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalEarnings: number;
  totalRaces: number;
  totalWins: number;
  winRate: number;
  averageEarnings: number;
  topHorse: string;
  recentTrend: 'up' | 'down' | 'stable';
  monthlyData: Array<{
    month: string;
    earnings: number;
    races: number;
    wins: number;
  }>;
  horsePerformance: Array<{
    name: string;
    races: number;
    wins: number;
    earnings: number;
    winRate: number;
    rarity: string;
  }>;
  raceTypeStats: Array<{
    type: string;
    races: number;
    wins: number;
    winRate: number;
    avgEarnings: number;
  }>;
  competitorAnalysis: Array<{
    name: string;
    matchups: number;
    wins: number;
    winRate: number;
  }>;
}

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'horses' | 'races' | 'competitors'>('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Generate comprehensive mock analytics data
    const mockData: AnalyticsData = {
      totalEarnings: 2847500,
      totalRaces: 156,
      totalWins: 89,
      winRate: 0.571,
      averageEarnings: 18254,
      topHorse: 'Thunder Strike',
      recentTrend: 'up',
      monthlyData: [
        { month: 'Jan', earnings: 245000, races: 18, wins: 12 },
        { month: 'Feb', earnings: 312000, races: 22, wins: 14 },
        { month: 'Mar', earnings: 398000, races: 25, wins: 16 },
        { month: 'Apr', earnings: 456000, races: 28, wins: 18 },
        { month: 'May', earnings: 523000, races: 31, wins: 19 },
        { month: 'Jun', earnings: 613500, races: 32, wins: 20 }
      ],
      horsePerformance: [
        { name: 'Thunder Strike', races: 24, wins: 18, earnings: 456000, winRate: 0.75, rarity: 'Legendary' },
        { name: 'Lightning Bolt', races: 22, wins: 15, earnings: 387000, winRate: 0.68, rarity: 'Epic' },
        { name: 'Storm Chaser', races: 20, wins: 12, earnings: 298000, winRate: 0.60, rarity: 'Rare' },
        { name: 'Wind Runner', races: 18, wins: 10, earnings: 234000, winRate: 0.56, rarity: 'Rare' },
        { name: 'Fire Spirit', races: 16, wins: 8, earnings: 187000, winRate: 0.50, rarity: 'Uncommon' }
      ],
      raceTypeStats: [
        { type: 'Sprint', races: 45, wins: 28, winRate: 0.62, avgEarnings: 18500 },
        { type: 'Middle Distance', races: 67, wins: 38, winRate: 0.57, avgEarnings: 22300 },
        { type: 'Long Distance', races: 32, wins: 16, winRate: 0.50, avgEarnings: 28700 },
        { type: 'Steeplechase', races: 12, wins: 7, winRate: 0.58, avgEarnings: 35200 }
      ],
      competitorAnalysis: [
        { name: 'Elite Stables', matchups: 23, wins: 14, winRate: 0.61 },
        { name: 'Champion Trainers', matchups: 18, wins: 10, winRate: 0.56 },
        { name: 'Racing Legends', matchups: 15, wins: 8, winRate: 0.53 },
        { name: 'Speed Masters', matchups: 12, wins: 6, winRate: 0.50 }
      ]
    };

    setAnalyticsData(mockData);
  }, [selectedTimeframe]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend,
    color = 'blue' 
  }: {
    title: string;
    value: string;
    change?: string;
    icon: any;
    trend?: 'up' | 'down' | 'stable';
    color?: string;
  }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' && <ArrowUp className="w-4 h-4 mr-1" />}
              {trend === 'down' && <ArrowDown className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value={`${(analyticsData.totalEarnings / 1000).toFixed(0)}K TURF`}
          change="+12.5% vs last month"
          icon={DollarSign}
          trend="up"
          color="green"
        />
        <StatCard
          title="Win Rate"
          value={`${(analyticsData.winRate * 100).toFixed(1)}%`}
          change="+3.2% vs last month"
          icon={Trophy}
          trend="up"
          color="yellow"
        />
        <StatCard
          title="Total Races"
          value={analyticsData.totalRaces.toString()}
          change="+8 this month"
          icon={Target}
          trend="up"
          color="blue"
        />
        <StatCard
          title="Avg Earnings"
          value={`${(analyticsData.averageEarnings / 1000).toFixed(1)}K`}
          change="+5.8% vs last month"
          icon={TrendingUp}
          trend="up"
          color="purple"
        />
      </div>

      {/* Monthly Performance Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Monthly Performance</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Earnings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Wins</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-4">
          {analyticsData.monthlyData.map((month, index) => (
            <div key={month.month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center gap-2">
                {/* Earnings Bar */}
                <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(month.earnings / 650000) * 200}px` }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-blue-500 w-full rounded-t-lg"
                  />
                </div>
                {/* Wins Bar */}
                <div className="w-full bg-gray-100 rounded-b-lg overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(month.wins / 25) * 40}px` }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="bg-green-500 w-full rounded-b-lg"
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 mt-2">{month.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Horses</h3>
          <div className="space-y-4">
            {analyticsData.horsePerformance.slice(0, 3).map((horse, index) => (
              <div key={horse.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{horse.name}</p>
                    <p className="text-sm text-gray-600">{horse.rarity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{(horse.winRate * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">{horse.wins}W/{horse.races}R</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Race Type Performance</h3>
          <div className="space-y-4">
            {analyticsData.raceTypeStats.map((raceType) => (
              <div key={raceType.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{raceType.type}</p>
                  <p className="text-sm text-gray-600">{raceType.races} races</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{(raceType.winRate * 100).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">{(raceType.avgEarnings / 1000).toFixed(1)}K avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHorseAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Individual Horse Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Horse</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rarity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Races</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Wins</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Win Rate</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.horsePerformance.map((horse, index) => (
                <motion.tr
                  key={horse.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {horse.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800">{horse.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                      horse.rarity === 'Legendary' ? 'bg-yellow-500' :
                      horse.rarity === 'Epic' ? 'bg-purple-500' :
                      horse.rarity === 'Rare' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {horse.rarity}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{horse.races}</td>
                  <td className="py-4 px-4 text-gray-700">{horse.wins}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${horse.winRate * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {(horse.winRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-green-600">
                    {(horse.earnings / 1000).toFixed(0)}K TURF
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your racing performance and optimize your strategy</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Timeframe Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                  selectedTimeframe === timeframe
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>

          {/* View Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['overview', 'horses', 'races', 'competitors'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                  selectedView === view
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={selectedView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'horses' && renderHorseAnalysis()}
        {selectedView === 'races' && renderOverview()} {/* Placeholder */}
        {selectedView === 'competitors' && renderOverview()} {/* Placeholder */}
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;

