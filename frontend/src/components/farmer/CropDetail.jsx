import { X, Sprout, Calendar, MapPin, FlaskConical, Bot, ImagePlus } from 'lucide-react';

const STAGE_PROGRESS = { seeding: 10, germination: 25, vegetative: 45, flowering: 65, ripening: 85, harvested: 100 };

export default function CropDetail({ crop, onClose, onEdit, onUploadImage, uploading }) {
  if (!crop) return null;

  const progress = STAGE_PROGRESS[crop.currentStage] || 0;
  const healthColor = { healthy: 'bg-green-500', warning: 'bg-yellow-500', critical: 'bg-red-500' };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Sprout size={22} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{crop.name}</h2>
              {crop.variety && <p className="text-sm text-gray-400">{crop.variety}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Health + Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Health Status</p>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${healthColor[crop.healthStatus]}`} />
                <span className="font-semibold capitalize text-gray-800 dark:text-gray-100">{crop.healthStatus}</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Field Size</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{crop.fieldSize ? `${crop.fieldSize} acres` : '—'}</p>
            </div>
          </div>

          {/* Growth Stage Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Growth Stage: <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{crop.currentStage}</span></span>
              <span>{progress}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              {['Seed', 'Germ.', 'Veg.', 'Flower', 'Ripe', 'Done'].map((s, i) => (
                <span key={s} className={`text-[10px] ${i < Math.round(progress / 20) ? 'text-primary-600 font-medium' : 'text-gray-300 dark:text-gray-600'}`}>{s}</span>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {crop.plantingDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} className="text-primary-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Planted</p>
                  <p className="font-medium">{new Date(crop.plantingDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {crop.expectedHarvestDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Expected Harvest</p>
                  <p className="font-medium">{new Date(crop.expectedHarvestDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {crop.fieldLocation?.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 col-span-2">
                <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Field Location</p>
                  <p className="font-medium">{crop.fieldLocation.address}</p>
                  {crop.fieldLocation.lat && (
                    <p className="text-xs text-gray-400">{crop.fieldLocation.lat.toFixed(4)}, {crop.fieldLocation.lng.toFixed(4)}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {crop.notes && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
              <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">Notes</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">{crop.notes}</p>
            </div>
          )}

          {/* Images */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <ImagePlus size={15} /> Crop Photos ({crop.images?.length || 0})
            </p>
            <div className="flex gap-2 flex-wrap">
              {crop.images?.map((img, i) => (
                <img key={i} src={img} alt={`crop-${i}`}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(img, '_blank')}
                />
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors gap-1">
                {uploading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <ImagePlus size={18} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Add</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files[0] && onUploadImage(crop._id, e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* AI Disease Analysis History */}
          {crop.aiDiseaseAnalysis?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Bot size={15} className="text-purple-500" /> AI Disease Analysis History
              </p>
              <div className="space-y-2">
                {[...crop.aiDiseaseAnalysis].reverse().map((a, i) => (
                  <div key={i} className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-purple-800 dark:text-purple-300 text-sm">{a.disease}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-500">{a.confidence}% confidence</span>
                        <span className="text-xs text-gray-400">{new Date(a.analyzedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {a.recommendation && (
                      <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">{a.recommendation}</p>
                    )}
                    {/* Confidence bar */}
                    <div className="mt-2 h-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${a.confidence}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button onClick={() => { onEdit(crop); onClose(); }} className="btn-secondary flex-1">Edit Crop</button>
          <button onClick={onClose} className="btn-primary flex-1">Close</button>
        </div>
      </div>
    </div>
  );
}
