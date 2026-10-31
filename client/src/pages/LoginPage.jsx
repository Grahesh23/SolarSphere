import { useState } from 'react';
import { Sun, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '@/data/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.ok) setError(res.error || 'Login failed.');
      setLoading(false);
    }, 400);
  };

  const quickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('solarsphere123');
    setError('');
  };

  const roleColors = {
    Admin: 'bg-navy-50 text-navy-700 border-navy-200',
    Sales: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Surveyor: 'bg-grape-50 text-grape-700 border-grape-200',
    Warehouse: 'bg-amber-50 text-amber-700 border-amber-200',
    Technician: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Service: 'bg-rose-50 text-rose-700 border-rose-200',
    Finance: 'bg-navy-50 text-navy-700 border-navy-200',
    Customer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
      {/* Left brand panel */}
      <div className="lg:w-1/2 bg-navy-950 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #10b981 0%, transparent 40%), radial-gradient(circle at 80% 70%, #7e22ce 0%, transparent 40%)' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-xl">S</span>
            </div>
            <div>
              <div className="font-display font-bold text-2xl tracking-tight">SolarSphere</div>
              <div className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Solar Operations Platform</div>
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold leading-tight mb-4">
            Manage the complete<br />solar project lifecycle.
          </h1>
          <p className="text-slate-300 text-base max-w-md leading-relaxed">
            One connected platform for sales, survey, warehouse, installation, service, finance, and customer experience — with intelligent roof analysis and predictive insights.
          </p>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-based access control · Secure session management</span>
        </div>
      </div>

      {/* Right login panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-navy-900">Sign in to your portal</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your role-specific dashboard.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@solarsphere.demo" className="input pl-9" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="solarsphere123" className="input pl-9 pr-9" required />
                <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" /> Remember me
              </label>
              <button type="button" className="text-emerald-600 hover:underline font-medium">Forgot password?</button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center h-11">
              {loading ? 'Signing in...' : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Demo Accounts · Click to fill</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.email} onClick={() => quickFill(a.email)} type="button"
                  className={`text-left rounded-lg border px-3 py-2 text-xs transition hover:shadow-sm ${roleColors[a.role]}`}>
                  <div className="font-semibold">{a.role}</div>
                  <div className="opacity-70 truncate">{a.email}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Sun className="w-3.5 h-3.5" />
              <span>Password for all demo accounts: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-navy-700">solarsphere123</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
