import { useState } from 'react';
import { Sun, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, UserRound, Building2, Phone } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '@/data/AuthContext';
import { SolarHero } from '@/components/solar3d/SolarHero';

export function LoginPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
  });

  const submitLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await login(email, password);

    if (!res.ok) {
      setError(res.error || 'Login failed.');
    }

    setLoading(false);
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await register(registerForm);
    if (!res.ok) {
      setError(res.error || 'Registration failed.');
    } else {
      setSuccess(res.message || 'Registration successful.');
      setTab('login');
      setEmail(registerForm.email);
      setPassword(registerForm.password);
      setRegisterForm({ name: '', email: '', password: '', phone: '', companyName: '' });
    }

    setLoading(false);
  };

  const quickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('solarsphere123');
    setError('');
    setSuccess('');
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 max-lg:flex-col max-lg:h-auto max-lg:min-h-screen max-lg:overflow-y-auto">
      <div className="relative flex w-full flex-col justify-between overflow-hidden bg-navy-950 px-5 py-6 text-white sm:px-7 lg:w-1/2 lg:px-10 lg:py-8 xl:px-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #10b981 0%, transparent 40%), radial-gradient(circle at 80% 70%, #7e22ce 0%, transparent 40%)' }} />

        <div className="relative z-10 flex w-full flex-col">
          <div className="flex items-center gap-3 mb-8 lg:mb-10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-display font-bold text-xl">S</span>
            </div>
            <div>
              <div className="font-display font-bold text-2xl tracking-tight">SolarSphere</div>
              <div className="text-[10px] text-emerald-400 font-medium tracking-[0.22em] uppercase">Solar Operations Platform</div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-[2.1rem] lg:text-[2.5rem] font-display font-bold leading-tight mb-3 max-w-xl">
            Manage the complete solar project lifecycle.
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-slate-300 lg:text-base">
            One connected platform for sales, survey, warehouse, installation, service, finance, and customer experience — with intelligent roof analysis and predictive insights.
          </p>
        </div>

        <div className="relative z-10 mt-4 h-[32vh] min-h-[260px] w-full overflow-hidden lg:mt-2 lg:h-[clamp(280px,42vh,500px)] xl:h-[clamp(320px,46vh,560px)]">
          <SolarHero />
        </div>

        <div className="relative z-10 mt-3 flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-based access control · Secure session management</span>
        </div>
      </div>

      <div className="relative z-10 flex w-full items-center justify-center overflow-hidden bg-slate-100 px-4 py-6 sm:px-6 lg:w-1/2 lg:px-8 xl:px-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-5 lg:mb-6">
            <div className="inline-flex rounded-full bg-slate-200 p-1 shadow-inner">
              <button type="button" onClick={() => setTab('login')} className={`px-4 py-2 text-sm font-medium rounded-full ${tab === 'login' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600'}`}>
                Sign in
              </button>
              <button type="button" onClick={() => setTab('register')} className={`px-4 py-2 text-sm font-medium rounded-full ${tab === 'register' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600'}`}>
                Create account
              </button>
            </div>
          </div>

          {tab === 'login' ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-navy-900">Sign in to your portal</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your credentials to access your role-specific dashboard.</p>
              </div>

              <form onSubmit={submitLogin} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@solarsphere.demo" className="input h-11 pl-9" required />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="solarsphere123" className="input h-11 pl-9 pr-9" required />
                    <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300" /> Remember me
                  </label>
                  <button type="button" className="font-medium text-emerald-600 hover:underline">Forgot password?</button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-600">
                    <ShieldCheck className="w-4 h-4 shrink-0" />{success}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary h-11 w-full justify-center">
                  {loading ? 'Signing in...' : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="mt-8">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Demo Accounts · Click to fill</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((a) => (
                    <button key={a.email} onClick={() => quickFill(a.email)} type="button"
                      className={`text-left rounded-lg border px-3 py-2 text-xs transition hover:shadow-sm ${roleColors[a.role]}`}>
                      <div className="font-semibold">{a.role}</div>
                      <div className="truncate opacity-70">{a.email}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Password for all demo accounts: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-navy-700">solarsphere123</code></span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-navy-900">Create client account</h2>
                <p className="mt-1 text-sm text-slate-500">Clients can register themselves. Employee accounts are managed separately.</p>
              </div>

              <form onSubmit={submitRegister} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} className="input h-11 pl-9" placeholder="Your name" required />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="input h-11 pl-9" placeholder="you@example.com" required />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPass ? 'text' : 'password'} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="input h-11 pl-9 pr-9" placeholder="Minimum 6 characters" minLength="6" required />
                    <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className="input h-11 pl-9" placeholder="+91 98xxxxxx" />
                  </div>
                </div>

                <div>
                  <label className="label">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={registerForm.companyName} onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })} className="input h-11 pl-9" placeholder="Solar rooftop / residential" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-600">
                    <ShieldCheck className="w-4 h-4 shrink-0" />{success}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary h-11 w-full justify-center">
                  {loading ? 'Creating account...' : <>Create account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
