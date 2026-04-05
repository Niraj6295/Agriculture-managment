import { useEffect, useState } from 'react';
import { Users, Sprout, MessageSquare, Search } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ExpertPage() {
  const [farmers, setFarmers] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [advice, setAdvice] = useState({ cropId: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/crops'),
    ]).then(([cropsRes]) => {
      const crops = cropsRes.data.crops;
      setAllCrops(crops);
      // Group by farmer
      const farmerMap = {};
      crops.forEach(c => {
        if (!c.farmer) return;
        const fid = c.farmer._id;
        if (!farmerMap[fid]) farmerMap[fid] = { ...c.farmer, crops: [] };
        farmerMap[fid].crops.push(c);
      });
      setFarmers(Object.values(farmerMap));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sendAdvice = async (e) => {
    e.preventDefault();
    if (!advice.message.trim() || !advice.cropId) return toast.error('Select a crop and enter a message');
    setSending(true);
    try {
      // Create an alert on behalf of the farmer for the selected crop
      const crop = allCrops.find(c => c._id === advice.cropId);
      if (!crop) throw new Error('Crop not found');
      await api.post('/alerts', {
        // Note: This posts to the currently logged-in user's alerts.
        // In a full multi-expert system, the backend would accept a targetUser param.
        type: 'system',
        severity: 'low',
        title: `Expert Advice for ${crop.name}`,
        message: advice.message,
        crop: advice.cropId,
      });
      toast.success('Advice sent as alert!');
      setAdvice({ cropId: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  const filtered = farmers.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCrops = allCrops.filter(c => c.healthStatus === 'critical');
  const warningCrops = allCrops.filter(c => c.healthStatus === 'warning');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expert Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor all farmers and provide expert guidance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{farmers.length}</p>
          <p className="text-xs text-gray-500 mt-1">Farmers</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{warningCrops.length}</p>
          <p className="text-xs text-gray-500 mt-1">Crops Needing Attention</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{criticalCrops.length}</p>
          <p className="text-xs text-gray-500 mt-1">Critical Crops</p>
        </div>
      </div>

      {/* Critical crops alert */}
      {criticalCrops.length > 0 && (
        <div className="card p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
          <p className="font-medium text-red-700 dark:text-red-400 mb-2">🚨 Critical Crops Requiring Immediate Attention</p>
          <div className="space-y-1">
            {criticalCrops.map(c => (
              <div key={c._id} className="text-sm text-red-600 dark:text-red-300">
                {c.name} ({c.variety || 'unknown variety'}) — Farmer: {c.farmer?.name || 'Unknown'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Advice */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-primary-500" /> Send Expert Advice
        </h2>
        <form onSubmit={sendAdvice} className="space-y-4">
          <div>
            <label className="label">Select Crop</label>
            <select className="input" value={advice.cropId} onChange={e => setAdvice(a => ({ ...a, cropId: e.target.value }))}>
              <option value="">— Choose a crop —</option>
              {allCrops.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.variety || '?'}) — {c.farmer?.name || 'Unknown farmer'} [{c.healthStatus}]
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Advice / Recommendation</label>
            <textarea
              className="input resize-none" rows={4} required
              placeholder="Enter detailed expert advice for this crop..."
              value={advice.message}
              onChange={e => setAdvice(a => ({ ...a, message: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2">
            <MessageSquare size={16} />{sending ? 'Sending…' : 'Send Advice'}
          </button>
        </form>
      </div>

      {/* Farmers list */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Users size={18} className="text-primary-500" /> All Farmers ({farmers.length})
          </h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 w-48 text-sm"
              placeholder="Search farmers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No farmers found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map(farmer => (
              <div key={farmer._id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                    {farmer.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{farmer.name}</p>
                    <p className="text-xs text-gray-400">{farmer.email} {farmer.phone ? `· ${farmer.phone}` : ''}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{farmer.crops.length} crop{farmer.crops.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {farmer.crops.map(crop => (
                    <div key={crop._id} className={`text-xs px-2.5 py-1 rounded-full font-medium
                      ${crop.healthStatus === 'healthy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        crop.healthStatus === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      🌱 {crop.name} · {crop.currentStage}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
