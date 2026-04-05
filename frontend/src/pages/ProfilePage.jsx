import { useState } from 'react';
import { User, Shield, Key, Camera, Lock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [toggling2fa, setToggling2fa] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage ? `${import.meta.env.VITE_UPLOAD_BASE_URL}${user.profileImage}` : null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (f) { setImageFile(f); setPreviewUrl(URL.createObjectURL(f)); }
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      if (imageFile) fd.append('profileImage', imageFile);
      const { data } = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleToggle2FA = async () => {
    setToggling2fa(true);
    try {
      const { data } = await api.put('/auth/toggle-2fa');
      updateUser({ ...user, twoFactorEnabled: data.twoFactorEnabled });
      toast.success(`Two-factor auth ${data.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle 2FA'); }
    finally { setToggling2fa(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
          <User size={18} className="text-primary-500" /> Personal Information
        </h2>
        <form onSubmit={handleProfile} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{user?.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{user?.name}</p>
              <p className="text-sm text-gray-400 capitalize">{user?.role} · {user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91..." />
            </div>
            <div className="col-span-2">
              <label className="label">Email (read-only)</label>
              <input className="input opacity-60" value={user?.email || ''} readOnly />
            </div>
            <div className="col-span-2">
              <label className="label">Role</label>
              <input className="input opacity-60 capitalize" value={user?.role || ''} readOnly />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Security */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
          <Shield size={18} className="text-primary-500" /> Security
        </h2>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">Two-Factor Authentication</p>
            <p className="text-sm text-gray-400 mt-0.5">Require OTP on every login</p>
          </div>
          <button
            onClick={handleToggle2FA}
            disabled={toggling2fa}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${user?.twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${user?.twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className="pt-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
          <Lock size={18} className="text-primary-500" /> Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" required
              value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" required
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" required
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat password" />
            </div>
          </div>
          <button type="submit" disabled={savingPw} className="btn-primary">
            {savingPw ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Activity Logs */}
      {user?.activityLogs?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Key size={18} className="text-primary-500" /> Recent Activity
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...user.activityLogs].reverse().slice(0, 20).map((log, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{log.action}</span>
                <span className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
