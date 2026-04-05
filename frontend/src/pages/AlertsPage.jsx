import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, Zap } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SEVERITY_STYLE = { low: 'border-l-gray-300', medium: 'border-l-yellow-400', high: 'border-l-orange-500', critical: 'border-l-red-500' };
const TYPE_ICONS = { disease: '🦠', weather: '⛈️', irrigation: '💧', soil: '🪨', pest: '🐛', system: '⚙️' };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/alerts').then(r => setAlerts(r.data.alerts)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try { await api.put(`/alerts/${id}/read`); load(); }
    catch { toast.error('Failed'); }
  };

  const markAll = async () => {
    try { await api.put('/alerts/mark-all-read'); toast.success('All marked as read'); load(); }
    catch { toast.error('Failed'); }
  };

  const deleteAlert = async (id) => {
    try { await api.delete(`/alerts/${id}`); load(); }
    catch { toast.error('Failed'); }
  };

  const unread = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{unread} unread · {alerts.length} total</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={15} /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : alerts.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No alerts yet. You're all clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert._id} className={`card p-4 border-l-4 ${SEVERITY_STYLE[alert.severity]} flex gap-4 ${!alert.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
              <div className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICONS[alert.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      {alert.title}
                      {!alert.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{alert.message}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize
                    ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'}`}>
                    {alert.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleString()}</span>
                  <span className="text-xs text-gray-400 capitalize">· {alert.type}</span>
                  {!alert.isRead && (
                    <button onClick={() => markRead(alert._id)} className="text-xs text-blue-500 hover:underline">Mark read</button>
                  )}
                  <button onClick={() => deleteAlert(alert._id)} className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
