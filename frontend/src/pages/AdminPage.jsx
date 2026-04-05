import { useEffect, useState } from 'react';
import { Users, Sprout, Bot, ShieldCheck, Send, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcast, setBroadcast] = useState({ title: '', message: '', severity: 'low', targetRole: '' });
  const [sending, setSending] = useState(false);

  const load = () =>
    Promise.all([
      api.get('/admin/stats').then(r => setStats(r.data)),
      api.get('/admin/users').then(r => setUsers(r.data.users)),
    ]).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/toggle-status`);
      toast.success(data.message);
      load();
    } catch { toast.error('Failed'); }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post('/admin/broadcast-alert', broadcast);
      toast.success(`Alert sent to ${data.sent} users`);
      setBroadcast({ title: '', message: '', severity: 'low', targetRole: '' });
    } catch { toast.error('Failed to send broadcast'); }
    finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="text-primary-500" size={26} /> Admin Panel
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and user management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Total Users', stats?.stats.totalUsers, <Users size={20} className="text-blue-500" />, 'bg-blue-50 dark:bg-blue-900/20'],
          ['Farmers', stats?.stats.totalFarmers, <Users size={20} className="text-green-500" />, 'bg-green-50 dark:bg-green-900/20'],
          ['Total Crops', stats?.stats.totalCrops, <Sprout size={20} className="text-primary-500" />, 'bg-primary-50 dark:bg-primary-900/20'],
          ['AI Interactions', stats?.stats.aiLogs, <Bot size={20} className="text-purple-500" />, 'bg-purple-50 dark:bg-purple-900/20'],
        ].map(([label, val, icon, bg]) => (
          <div key={label} className="card p-5 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{val ?? 0}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Alert */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Send size={18} className="text-primary-500" /> Broadcast Alert
        </h2>
        <form onSubmit={sendBroadcast} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input className="input" required value={broadcast.title} onChange={e => setBroadcast(b => ({ ...b, title: e.target.value }))} placeholder="Alert title" />
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="input" value={broadcast.severity} onChange={e => setBroadcast(b => ({ ...b, severity: e.target.value }))}>
                {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Target Role</label>
              <select className="input" value={broadcast.targetRole} onChange={e => setBroadcast(b => ({ ...b, targetRole: e.target.value }))}>
                <option value="">All Users</option>
                <option value="farmer">Farmers Only</option>
                <option value="expert">Experts Only</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Message</label>
              <textarea className="input resize-none" rows={3} required value={broadcast.message} onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2">
            <Send size={15} /> {sending ? 'Sending…' : 'Send Alert'}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">All Users ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="pb-3 pr-4 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-800 dark:text-gray-200">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-3 pr-4"><span className="capitalize text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{u.role}</span></td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button onClick={() => toggleStatus(u._id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {u.isActive ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
