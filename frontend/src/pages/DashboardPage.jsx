import { useEffect, useState } from 'react';
import { Sprout, AlertTriangle, CheckCircle2, XCircle, Bell, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/crops/dashboard')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  const pieData = stats ? [
    { name: 'Healthy', value: stats.stats.healthyCrops },
    { name: 'Warning', value: stats.stats.warningCrops },
    { name: 'Critical', value: stats.stats.criticalCrops },
  ] : [];

  const stageCounts = {};
  (stats?.recentCrops || []).forEach(c => { stageCounts[c.currentStage] = (stageCounts[c.currentStage] || 0) + 1; });
  const barData = Object.entries(stageCounts).map(([stage, count]) => ({ stage, count }));

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your farm today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Sprout className="text-primary-500" />} label="Total Crops" value={stats?.stats.totalCrops ?? 0} bg="bg-primary-50 dark:bg-primary-900/20" />
        <StatCard icon={<CheckCircle2 className="text-green-500" />} label="Healthy" value={stats?.stats.healthyCrops ?? 0} bg="bg-green-50 dark:bg-green-900/20" />
        <StatCard icon={<AlertTriangle className="text-yellow-500" />} label="Warning" value={stats?.stats.warningCrops ?? 0} bg="bg-yellow-50 dark:bg-yellow-900/20" />
        <StatCard icon={<XCircle className="text-red-500" />} label="Critical" value={stats?.stats.criticalCrops ?? 0} bg="bg-red-50 dark:bg-red-900/20" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" /> Crop Health Distribution
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Crop Stages */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Crops by Stage</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Crops Table */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Sprout size={18} className="text-primary-500" /> Recent Crops
        </h2>
        {stats?.recentCrops?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-3 pr-4 font-medium">Crop</th>
                  <th className="pb-3 pr-4 font-medium">Variety</th>
                  <th className="pb-3 pr-4 font-medium">Stage</th>
                  <th className="pb-3 font-medium">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {stats.recentCrops.map(crop => (
                  <tr key={crop._id}>
                    <td className="py-3 pr-4 font-medium text-gray-800 dark:text-gray-200">{crop.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{crop.variety || '—'}</td>
                    <td className="py-3 pr-4 capitalize text-gray-500">{crop.currentStage}</td>
                    <td className="py-3">
                      <span className={`badge-${crop.healthStatus}`}>{crop.healthStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-6 text-center">No crops added yet. Go to My Crops to add your first crop.</p>
        )}
      </div>

      {/* Unread Alerts */}
      {stats?.stats.unreadAlerts > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800">
          <Bell className="text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            You have <strong>{stats.stats.unreadAlerts}</strong> unread alert{stats.stats.unreadAlerts > 1 ? 's' : ''}. Check the Alerts section.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`card p-5 flex items-center gap-4`}>
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
