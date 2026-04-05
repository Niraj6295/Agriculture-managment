import { AlertTriangle, X } from 'lucide-react';

// ── Loading Spinner ──────────────────────────────────────────
export function Spinner({ size = 8 }) {
  return (
    <div className="flex justify-center items-center py-20">
      <div className={`animate-spin w-${size} h-${size} border-4 border-primary-500 border-t-transparent rounded-full`} />
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card p-12 flex flex-col items-center text-center gap-3">
      {Icon && <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600" />}
      <p className="font-medium text-gray-600 dark:text-gray-400">{title}</p>
      {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── Confirm Modal ────────────────────────────────────────────
export function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
            <AlertTriangle size={20} className={danger ? 'text-red-500' : 'text-yellow-500'} />
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm} className={danger ? 'btn-danger flex-1' : 'btn-primary flex-1'}>Confirm</button>
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Page Header ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────
export function StatCard({ icon, label, value, bg, trend }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  );
}

// ── Form Field ───────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Modal Shell ──────────────────────────────────────────────
export function Modal({ open, title, onClose, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`card w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
