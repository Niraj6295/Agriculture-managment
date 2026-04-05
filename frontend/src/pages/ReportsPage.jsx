import { useState } from 'react';
import { FileBarChart2, Download, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/summary');
      setReport(data.report);
    } catch { toast.error('Failed to generate report'); }
    finally { setLoading(false); }
  };

  const downloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `farm-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Generate a comprehensive farm summary report</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateReport} disabled={loading} className="btn-primary flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Generating…' : 'Generate Report'}
          </button>
          {report && (
            <button onClick={downloadJSON} className="btn-secondary flex items-center gap-2">
              <Download size={16} /> Download JSON
            </button>
          )}
        </div>
      </div>

      {!report ? (
        <div className="card p-12 text-center">
          <FileBarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Click "Generate Report" to create your farm summary.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Overview */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">📊 Farm Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                ['Total Crops', report.overview.totalCrops, 'text-primary-600'],
                ['Healthy', report.overview.healthyCrops, 'text-green-600'],
                ['Warning', report.overview.warningCrops, 'text-yellow-600'],
                ['Critical', report.overview.criticalCrops, 'text-red-600'],
              ].map(([label, val, color]) => (
                <div key={label} className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className={`text-3xl font-bold ${color}`}>{val}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">Generated: {new Date(report.generatedAt).toLocaleString()} · Farmer: {report.farmer}</p>
          </div>

          {/* Crops */}
          {report.crops?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">🌾 All Crops</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      {['Name', 'Variety', 'Stage', 'Health', 'Size (acres)', 'Planted'].map(h => (
                        <th key={h} className="pb-3 pr-4 font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {report.crops.map(c => (
                      <tr key={c._id}>
                        <td className="py-2.5 pr-4 font-medium text-gray-800 dark:text-gray-200">{c.name}</td>
                        <td className="py-2.5 pr-4 text-gray-500">{c.variety || '—'}</td>
                        <td className="py-2.5 pr-4 capitalize text-gray-500">{c.currentStage}</td>
                        <td className="py-2.5 pr-4"><span className={`badge-${c.healthStatus}`}>{c.healthStatus}</span></td>
                        <td className="py-2.5 pr-4 text-gray-500">{c.fieldSize || '—'}</td>
                        <td className="py-2.5 text-gray-500">{c.plantingDate ? c.plantingDate.slice(0, 10) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Alerts */}
          {report.recentAlerts?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">🔔 Recent Alerts ({report.recentAlerts.length})</h2>
              <div className="space-y-2">
                {report.recentAlerts.map(a => (
                  <div key={a._id} className="flex items-center gap-3 text-sm py-1.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-500' : a.severity === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{a.title}</span>
                    <span className="text-gray-400 ml-auto text-xs">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">🤖 AI Usage</h2>
            <p className="text-gray-500 text-sm">Total AI interactions recorded: <strong className="text-gray-800 dark:text-gray-200">{report.aiInteractions}</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}
