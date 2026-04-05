import { useEffect, useState } from 'react';
import { Plus, Trash2, X, FlaskConical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const empty = { ph: '', moisture: '', nitrogen: '', phosphorus: '', potassium: '', organicMatter: '', temperature: '', notes: '', crop: '' };

export default function SoilPage() {
  const [records, setRecords] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);

  const load = () =>
    Promise.all([
      api.get('/soil').then(r => setRecords(r.data.records)),
      api.get('/crops').then(r => setCrops(r.data.crops)),
    ]).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/soil', form);
      toast.success('Soil data recorded');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await api.delete(`/soil/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const handleAnalyze = async (soilId, cropName) => {
    setAnalyzing(soilId);
    try {
      const { data } = await api.post('/ai/soil-analysis', { soilDataId: soilId, cropName });
      const r = data.recommendation;
      toast.success('AI analysis complete!');
      alert(`AI Soil Analysis:\n\n${r.summary || JSON.stringify(r, null, 2)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed');
    } finally { setAnalyzing(null); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const chartData = [...records].reverse().slice(-10).map(r => ({
    date: new Date(r.recordedAt).toLocaleDateString(),
    ph: r.ph, moisture: r.moisture, nitrogen: r.nitrogen,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Soil Data</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and analyze soil health over time</p>
        </div>
        <button onClick={() => { setForm(empty); setModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Record Soil Data
        </button>
      </div>

      {/* Chart */}
      {records.length > 1 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Soil Trends (Last 10 Readings)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="ph" stroke="#22c55e" dot={false} name="pH" />
              <Line type="monotone" dataKey="moisture" stroke="#3b82f6" dot={false} name="Moisture%" />
              <Line type="monotone" dataKey="nitrogen" stroke="#f59e0b" dot={false} name="Nitrogen" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : records.length === 0 ? (
        <div className="card p-12 text-center">
          <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No soil data yet. Record your first reading.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  {['Date', 'Crop', 'pH', 'Moisture%', 'N', 'P', 'K', 'Org.Matter%', 'Temp°C', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {records.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{new Date(r.recordedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.crop?.name || '—'}</td>
                    <td className="px-4 py-3"><PHBadge value={r.ph} /></td>
                    <td className="px-4 py-3">{r.moisture ?? '—'}</td>
                    <td className="px-4 py-3">{r.nitrogen ?? '—'}</td>
                    <td className="px-4 py-3">{r.phosphorus ?? '—'}</td>
                    <td className="px-4 py-3">{r.potassium ?? '—'}</td>
                    <td className="px-4 py-3">{r.organicMatter ?? '—'}</td>
                    <td className="px-4 py-3">{r.temperature ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAnalyze(r._id, r.crop?.name)}
                          disabled={analyzing === r._id}
                          className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-lg hover:bg-primary-200 transition-colors disabled:opacity-50"
                        >
                          {analyzing === r._id ? '…' : 'AI'}
                        </button>
                        <button onClick={() => handleDelete(r._id)} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded-lg hover:bg-red-200 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Record Soil Data</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="label">Link to Crop</label>
                <select className="input" value={form.crop} onChange={set('crop')}>
                  <option value="">— Select Crop (optional) —</option>
                  {crops.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['ph', 'pH (0-14)', '0', '14', '0.1'], ['moisture', 'Moisture %', '0', '100', '0.1'], ['nitrogen', 'Nitrogen (mg/kg)', '0', '', '0.1'],
                  ['phosphorus', 'Phosphorus (mg/kg)', '0', '', '0.1'], ['potassium', 'Potassium (mg/kg)', '0', '', '0.1'],
                  ['organicMatter', 'Organic Matter %', '0', '100', '0.1'], ['temperature', 'Soil Temp (°C)', '', '', '0.1']
                ].map(([k, label, min, max, step]) => (
                  <div key={k}>
                    <label className="label">{label}</label>
                    <input type="number" step={step} min={min || undefined} max={max || undefined} className="input" value={form[k]} onChange={set(k)} />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="label">Notes</label>
                  <textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PHBadge({ value }) {
  if (!value) return <span>—</span>;
  const color = value < 5.5 ? 'text-red-500' : value > 7.5 ? 'text-blue-500' : 'text-green-600';
  return <span className={`font-medium ${color}`}>{value}</span>;
}
