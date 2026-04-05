import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ImagePlus, X, Sprout, Eye } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import CropDetail from '../components/farmer/CropDetail';

const STAGES = ['seeding', 'germination', 'vegetative', 'flowering', 'ripening', 'harvested'];
const HEALTH = ['healthy', 'warning', 'critical'];
const empty = { name: '', variety: '', fieldSize: '', currentStage: 'seeding', healthStatus: 'healthy', plantingDate: '', expectedHarvestDate: '', notes: '' };

export default function CropsPage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [detailCrop, setDetailCrop] = useState(null);

  const load = () => api.get('/crops').then(r => setCrops(r.data.crops)).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (c) => {
    setEditing(c._id);
    setForm({
      name: c.name, variety: c.variety || '', fieldSize: c.fieldSize || '',
      currentStage: c.currentStage, healthStatus: c.healthStatus,
      plantingDate: c.plantingDate ? c.plantingDate.slice(0, 10) : '',
      expectedHarvestDate: c.expectedHarvestDate ? c.expectedHarvestDate.slice(0, 10) : '',
      notes: c.notes || '',
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/crops/${editing}`, form);
        toast.success('Crop updated');
      } else {
        await api.post('/crops', form);
        toast.success('Crop added');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this crop?')) return;
    try {
      await api.delete(`/crops/${id}`);
      toast.success('Crop deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleImageUpload = async (cropId, file) => {
    const fd = new FormData();
    fd.append('cropImage', file);
    setUploading(cropId);
    try {
      await api.post(`/crops/${cropId}/upload-image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Image uploaded');
      load();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Crops</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{crops.length} crop{crops.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Crop
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : crops.length === 0 ? (
        <div className="card p-12 text-center">
          <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No crops yet. Click "Add Crop" to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {crops.map(crop => (
            <div key={crop._id} className="card p-5 flex flex-col gap-3">
              {/* Images */}
              <div className="flex gap-2 flex-wrap">
                {crop.images?.slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt="crop" className="w-16 h-16 object-cover rounded-xl border border-gray-100 dark:border-gray-700" />
                ))}
                <label className="w-16 h-16 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                  {uploading === crop._id ? <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" /> : <ImagePlus size={18} className="text-gray-400" />}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleImageUpload(crop._id, e.target.files[0])} />
                </label>
              </div>

              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{crop.name}</h3>
                  <span className={`badge-${crop.healthStatus} flex-shrink-0`}>{crop.healthStatus}</span>
                </div>
                {crop.variety && <p className="text-xs text-gray-400 mt-0.5">{crop.variety}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div><span className="font-medium">Stage:</span> <span className="capitalize">{crop.currentStage}</span></div>
                <div><span className="font-medium">Size:</span> {crop.fieldSize ? `${crop.fieldSize} acres` : '—'}</div>
                {crop.plantingDate && <div><span className="font-medium">Planted:</span> {crop.plantingDate.slice(0, 10)}</div>}
                {crop.expectedHarvestDate && <div><span className="font-medium">Harvest:</span> {crop.expectedHarvestDate.slice(0, 10)}</div>}
              </div>

              {crop.aiDiseaseAnalysis?.length > 0 && (
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs">
                  <p className="font-medium text-red-700 dark:text-red-400">Latest AI Analysis</p>
                  <p className="text-red-600 dark:text-red-300 mt-0.5">{crop.aiDiseaseAnalysis.at(-1).disease}</p>
                </div>
              )}

              {crop.notes && <p className="text-xs text-gray-400 italic">{crop.notes}</p>}

              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50 dark:border-gray-700">
                <button onClick={() => setDetailCrop(crop)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm">
                  <Eye size={13} /> View
                </button>
                <button onClick={() => openEdit(crop)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(crop._id)} className="btn-danger flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">{editing ? 'Edit Crop' : 'Add New Crop'}</h2>
              <button onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Crop Name *</label>
                  <input className="input" required value={form.name} onChange={set('name')} placeholder="e.g. Wheat" />
                </div>
                <div>
                  <label className="label">Variety</label>
                  <input className="input" value={form.variety} onChange={set('variety')} placeholder="e.g. HD-2967" />
                </div>
                <div>
                  <label className="label">Field Size (acres)</label>
                  <input type="number" step="0.1" className="input" value={form.fieldSize} onChange={set('fieldSize')} />
                </div>
                <div>
                  <label className="label">Growth Stage</label>
                  <select className="input" value={form.currentStage} onChange={set('currentStage')}>
                    {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Health Status</label>
                  <select className="input" value={form.healthStatus} onChange={set('healthStatus')}>
                    {HEALTH.map(h => <option key={h} value={h} className="capitalize">{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Planting Date</label>
                  <input type="date" className="input" value={form.plantingDate} onChange={set('plantingDate')} />
                </div>
                <div className="col-span-2">
                  <label className="label">Expected Harvest</label>
                  <input type="date" className="input" value={form.expectedHarvestDate} onChange={set('expectedHarvestDate')} />
                </div>
                <div className="col-span-2">
                  <label className="label">Notes</label>
                  <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Any observations..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : editing ? 'Update Crop' : 'Add Crop'}
                </button>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Crop Detail Modal */}
      <CropDetail
        crop={detailCrop}
        onClose={() => setDetailCrop(null)}
        onEdit={openEdit}
        onUploadImage={async (id, file) => { await handleImageUpload(id, file); setDetailCrop(null); }}
        uploading={uploading !== null}
      />
    </div>
  );
}
