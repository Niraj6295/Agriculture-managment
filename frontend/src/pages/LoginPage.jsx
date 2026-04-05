import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [devOtp, setDevOtp] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.requires2FA) {
        setUserId(result.userId);
        setDevOtp(result.devOtp);
        toast.success('OTP sent! Check your email.');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(userId, otp);
      toast.success('Verified! Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Agriculture</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI-powered Farm Monitoring</p>
        </div>

        <div className="card p-8">
          {!userId ? (
            <>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Sign In</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email" required className="input"
                    placeholder="farmer@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} required className="input pr-10"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPass(v => !v)}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              {/* Demo accounts */}
              <div className="mt-5 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium text-primary-700 dark:text-primary-400 mb-1">Demo Accounts</p>
                <p>Admin: admin@agri.com / admin123</p>
                <p>Farmer: farmer@agri.com / farmer123</p>
                <p>Expert: expert@agri.com / expert123</p>
              </div>
              <p className="text-center mt-4 text-sm text-gray-500">
                No account?{' '}
                <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Two-Factor Auth</h2>
              <p className="text-sm text-gray-500 mb-6">Enter the 6-digit OTP sent to your email.</p>
              {devOtp && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-xs text-yellow-700 dark:text-yellow-400">
                  DEV mode OTP: <strong>{devOtp}</strong>
                </div>
              )}
              <form onSubmit={handleOtp} className="space-y-4">
                <input
                  type="text" maxLength={6} required className="input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-3">
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
                <button type="button" className="btn-secondary w-full" onClick={() => setUserId(null)}>
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
