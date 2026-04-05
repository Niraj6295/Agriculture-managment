import { useState } from 'react';
import { ScanSearch, ImagePlus, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function DiseasePage() {
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({ symptoms: '', cropName: '', cropId: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    api.get('/crops').then(r => setCrops(r.data.crops)).catch(() => {});
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDetect = async (e) => {
    e.preventDefault();
    if (!form.symptoms.trim()) return toast.error('Describe the symptoms first');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/ai/disease-detect', {
        symptoms: form.symptoms,
        cropName: form.cropName,
        cropId: form.cropId || undefined,
      });
      setResult(data.analysis);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Detection failed. Check your Groq API key.');
    } finally { setLoading(false); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const confidenceColor = (c) => c === 'high' ? 'text-red-600' : c === 'medium' ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disease Detection</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Describe symptoms or upload a crop photo for AI analysis</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleDetect} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="label">Upload Crop Photo (optional)</label>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-400 transition-colors bg-gray-50 dark:bg-gray-800/50">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImagePlus size={28} />
                  <span className="text-sm">Click to upload crop image</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Crop Type</label>
              <input className="input" placeholder="e.g. Tomato, Wheat, Rice" value={form.cropName} onChange={set('cropName')} />
            </div>
            <div>
              <label className="label">Link to My Crop (optional)</label>
              <select className="input" value={form.cropId} onChange={set('cropId')}>
                <option value="">— Select Crop —</option>
                {crops.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Describe Symptoms *</label>
            <textarea
              className="input resize-none" rows={5} required
              placeholder="Describe what you observe in detail. e.g.:&#10;- Yellow spots on leaves&#10;- Dark brown patches on stem&#10;- Wilting despite watering&#10;- White powdery coating on leaves"
              value={form.symptoms}
              onChange={set('symptoms')}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing with AI…</> : <><ScanSearch size={18} /> Detect Disease</>}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
            <ScanSearch size={20} className="text-primary-500" /> AI Analysis Result
          </h2>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-gray-500">Detected Disease</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{result.disease || 'Could not determine'}</p>
            </div>
            {result.confidence && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Confidence</p>
                <p className={`text-lg font-bold capitalize ${confidenceColor(result.confidence)}`}>{result.confidence}</p>
              </div>
            )}
          </div>

          {result.immediateAction && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2 mb-1">
                <AlertTriangle size={16} /> Immediate Action Required
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">{result.immediateAction}</p>
            </div>
          )}

          {result.treatment && (
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">💊 Treatment Recommendation</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.treatment}</p>
            </div>
          )}

          {result.prevention && (
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" /> Prevention
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.prevention}</p>
            </div>
          )}

          {result.raw && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{result.raw}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
