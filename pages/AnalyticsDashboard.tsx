import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Clock, Target, BookOpen, Brain, 
  Calendar, Award, Activity as ActivityIcon, Sparkles, Wand2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../pages/utils/timeUtils';
import { analyzeProgress } from '../services/geminiService';

const AnalyticsDashboard: React.FC = () => {
  const { activities, readingLogs, dailyGoals, roadmapTasks, user } = useApp();
  const [smartAnalysis, setSmartAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
        if (activities.length > 3 || readingLogs.length > 0) {
            setIsAnalyzing(true);
            const analysis = await analyzeProgress(activities, readingLogs);
            setSmartAnalysis(analysis);
            setIsAnalyzing(false);
        }
    };
    fetchAnalysis();
  }, [activities.length, readingLogs.length]);

  // Process data for charts
  const focusStats = useMemo(() => {
    const focusSessions = activities.filter(a => a.type === 'focus');
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
        const sessionsOnDay = focusSessions.filter(s => s.timestamp.startsWith(date));
        const totalDuration = sessionsOnDay.reduce((acc, s) => acc + (s.duration || 0), 0);
        return {
            date: date.split('-').slice(2).join('/'),
            minutes: Math.floor(totalDuration / 60)
        };
    });
  }, [activities]);

  const readingStats = useMemo(() => {
    const categories: Record<string, number> = {};
    readingLogs.forEach(log => {
        // We'd need to link log to item category
        // For now, let's just group by itemTitle or use mock data if logs are few
        const title = log.itemTitle || 'Other';
        categories[title] = (categories[title] || 0) + log.durationSeconds;
    });

    return Object.entries(categories).map(([name, value]) => ({
        name,
        value: Math.floor(value / 60)
    })).slice(0, 5);
  }, [readingLogs]);

  const COLORS = ['#001b3d', '#ff7a00', '#ff9d4d', '#1a3454', '#ffc18c'];

  // Smart insights using user data
  const insights = useMemo(() => {
    const totalFocusTime = activities.filter(a => a.type === 'focus').reduce((acc, a) => acc + (a.duration || 0), 0);
    const totalReadingTime = readingLogs.reduce((acc, l) => acc + l.durationSeconds, 0);
    const goalsCompleted = dailyGoals.filter(g => g.completed).length;

    return [
        {
            title: 'Learning Velocity',
            value: `${Math.floor((totalFocusTime + totalReadingTime) / 3600)}h`,
            desc: 'Total focused study time this month.',
            icon: <TrendingUp className="text-green-500" />,
            trend: '+12%'
        },
        {
            title: 'Focus Consistency',
            value: `${user?.streak || 0} Days`,
            desc: 'Your current daily study streak.',
            icon: <Award className="text-amber-500" />
        },
        {
            title: 'Goal Mastery',
            value: `${goalsCompleted}`,
            desc: 'Micro-goals successfully conquered.',
            icon: <Target className="text-brand-orange" />
        }
    ];
  }, [activities, readingLogs, dailyGoals, user]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 group-hover:scale-125 transition-transform">
                {insight.icon}
            </div>
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gray-50 rounded-lg">{insight.icon}</div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{insight.title}</h4>
            </div>
            <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-gray-800">{insight.value}</span>
                {insight.trend && <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{insight.trend}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-2">{insight.desc}</p>
          </div>
        ))}
      </div>

      {/* Smart Analysis Section */}
      <div className="bg-gradient-to-br from-deep-blue to-blue-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <Brain size={120} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                    <Wand2 size={24} className="text-brand-orange" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">AI Habit Analysis</h3>
            </div>
            
            {isAnalyzing ? (
                <div className="flex items-center space-x-3 animate-pulse bg-white/5 p-4 rounded-xl">
                    <div className="w-3 h-3 bg-brand-orange rounded-full"></div>
                    <div className="w-3 h-3 bg-brand-orange rounded-full"></div>
                    <div className="w-3 h-3 bg-brand-orange rounded-full"></div>
                    <span className="text-sm font-bold ml-2 text-white/70 tracking-widest uppercase">Cracking the patterns...</span>
                </div>
            ) : (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <p className="text-xl leading-relaxed font-bold text-white/90 italic">
                        "{smartAnalysis || "Sync more study data to get a personalized habit analysis!"}"
                    </p>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Focus Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-deep-blue flex items-center tracking-tight">
              <Clock className="mr-2 text-brand-orange" size={24} /> Focus Distributions
            </h3>
            <select className="text-xs font-bold bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none text-gray-600">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusStats}>
                <defs>
                    <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff7a00" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    itemStyle={{ color: '#ff7a00', fontWeight: '900' }}
                />
                <Area type="monotone" dataKey="minutes" stroke="#ff7a00" strokeWidth={4} fillOpacity={1} fill="url(#colorMins)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reading Categories */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h3 className="text-xl font-black text-deep-blue mb-8 flex items-center tracking-tight">
            <BookOpen className="mr-2 text-brand-orange" size={24} /> Knowledge Intake
          </h3>
          <div className="flex flex-col md:flex-row items-center">
            <div className="h-64 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={readingStats.length > 0 ? readingStats : [{ name: 'No Data', value: 1 }]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {(readingStats.length > 0 ? readingStats : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={readingStats.length > 0 ? COLORS[index % COLORS.length] : '#f1f5f9'} />
                    ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0 md:pl-8">
                {readingStats.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-sm font-bold text-gray-600 truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="text-sm font-black text-deep-blue">{item.value}m</span>
                    </div>
                ))}
                {readingStats.length === 0 && <p className="text-sm text-gray-400 italic font-medium">Start reading to see your intake data.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 font-sans">
        <h3 className="text-xl font-black text-deep-blue mb-8 flex items-center tracking-tight">
          <ActivityIcon className="mr-2 text-brand-orange" size={24} /> Recent Footprints
        </h3>
        <div className="space-y-8">
            {activities.slice(0, 5).map((activity, i) => (
                <div key={activity.id} className="flex items-start space-x-6 relative">
                    {i !== activities.slice(0, 5).length - 1 && (
                        <div className="absolute top-10 left-5 w-0.5 h-full bg-gray-100 -translate-x-1/2" />
                    )}
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 z-10 shadow-sm">
                        {activity.type === 'focus' && <Clock size={18} className="text-red-500" />}
                        {activity.type === 'reading' && <BookOpen size={18} className="text-brand-orange" />}
                        {activity.type === 'roadmap_progress' && <TrendingUp size={18} className="text-green-500" />}
                        {activity.type === 'goal_completion' && <Target size={18} className="text-deep-blue" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <h5 className="text-md font-black text-deep-blue tracking-tight">
                                {activity.type === 'focus' && 'Focus Session Completed'}
                                {activity.type === 'reading' && `Read: ${activity.metadata?.itemTitle}`}
                                {activity.type === 'roadmap_progress' && `Journey Progress: ${activity.metadata?.title}`}
                                {activity.type === 'goal_completion' && 'Daily Goal Reached'}
                            </h5>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 font-medium">
                            {activity.type === 'focus' && `You focused for ${Math.floor((activity.duration || 0) / 60)} minutes.`}
                            {activity.type === 'reading' && `Spent ${Math.floor((activity.metadata?.durationSeconds || 0) / 60)} minutes learning.`}
                            {activity.type === 'roadmap_progress' && `Completed a milestone for your big goal.`}
                            {activity.type === 'goal_completion' && 'Gained 10 points for completing your daily target.'}
                        </p>
                    </div>
                </div>
            ))}
            {activities.length === 0 && (
                <div className="py-16 text-center">
                    <Sparkles size={64} className="mx-auto text-orange-100 mb-6 animate-pulse" />
                    <p className="text-gray-400 font-bold italic">Your journey footprint will appear here once you start studying.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
