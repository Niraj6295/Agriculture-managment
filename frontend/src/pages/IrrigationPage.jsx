import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Droplets, Check } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const METHODS = ['drip', 'sprinkler', 'flood', 'furrow'];
const STATUS_COLORS = { scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', skipped: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
const empty = { crop: '', scheduledDate: '', duration: '', waterAmount: '', method: 'drip', notes: '' };

export default function IrrigationPage() {
  const [schedules, setSchedules] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([
      api.get('/irrigation').then(r => setSchedules(r.data.schedules)),
      api.get('/crops').then(r => setCrops(r.data.crops)),
    ]).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/irrigation', form);
      toast.success('Schedule created');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/irrigation/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try { await api.delete(`/irrigation/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const upcoming = schedules.filter(s => s.status === 'scheduled');
  const past = schedules.filter(s => s.status !== 'scheduled');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Irrigation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{upcoming.length} upcoming schedule{upcoming.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(empty); setModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[['Upcoming', upcoming.length, 'text-blue-500'], ['Completed', schedules.filter(s=>s.status==='completed').length, 'text-green-500'], ['Skipped', schedules.filter(s=>s.status==='skipped').length, 'text-gray-500']].map(([label, val, color]) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : schedules.length === 0 ? (
        <div className="card p-12 text-center">
          <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No irrigation schedules yet.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map(s => <ScheduleCard key={s._id} s={s} onStatus={handleStatus} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">History</h2>
              <div className="space-y-3">
                {past.map(s => <ScheduleCard key={s._id} s={s} onStatus={handleStatus} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">New Irrigation Schedule</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="label">Crop *</label>
                <select className="input" required value={form.crop} onChange={set('crop')}>
                  <option value="">— Select Crop —</option>
                  {crops.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date & Time *</label>
                  <input type="datetime-local" className="input" required value={form.scheduledDate} onChange={set('scheduledDate')} />
                </div>
                <div>
                  <label className="label">Duration (min)</label>
                  <input type="number" className="input" value={form.duration} onChange={set('duration')} />
                </div>
                <div>
                  <label className="label">Water Amount (L)</label>
                  <input type="number" className="input" value={form.waterAmount} onChange={set('waterAmount')} />
                </div>
                <div>
                  <label className="label">Method</label>
                  <select className="input" value={form.method} onChange={set('method')}>
                    {METHODS.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Notes</label>
                  <textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Schedule'}</button>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleCard({ s, onStatus, onDelete }) {
  const STATUS_COLORS = { scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', completed: 'bg-green-100 text-green-700', skipped: 'bg-gray-100 text-gray-600' };
  return (
    <div className="card p-4 flex items-center gap-4 flex-wrap">
      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Droplets size={20} className="text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 dark:text-gray-100">{s.crop?.name || 'Unknown Crop'}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date(s.scheduledDate).toLocaleString()} · {s.method} · {s.duration ? `${s.duration}min` : ''} {s.waterAmount ? `· ${s.waterAmount}L` : ''}
        </p>
      </div>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[s.status]}`}>{s.status}</span>
      {s.status === 'scheduled' && (
        <div className="flex gap-1.5">
          <button onClick={() => onStatus(s._id, 'completed')} className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 transition-colors" title="Mark done">
            <Check size={14} />
          </button>
          <button onClick={() => onStatus(s._id, 'skipped')} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors text-xs px-2">Skip</button>
        </div>
      )}
      <button onClick={() => onDelete(s._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
