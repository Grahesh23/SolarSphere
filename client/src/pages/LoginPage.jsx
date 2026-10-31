import { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, UserRound, Building2, Phone } from 'lucide-react';
import { useAuth } from '@/data/AuthContext';
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
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
        <div className="relative my-5 h-[28vh] min-h-[220px] lg:my-0 lg:h-[clamp(280px,42vh,500px)]">
          <SolarHero />
        </div>
        <div className="relative flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-based access control · Secure session management</span>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="inline-flex rounded-full bg-slate-200 p-1">
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
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold text-navy-900">Sign in to your portal</h2>
                <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your role-specific dashboard.</p>
              </div>

              <form onSubmit={submitLogin} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-9" required />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input pl-9 pr-9" required />
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

                {success && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />{success}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center h-11">
                  {loading ? 'Signing in...' : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold text-navy-900">Create client account</h2>
                <p className="text-sm text-slate-500 mt-1">Clients can register themselves. Employee accounts are managed separately.</p>
              </div>

              <form onSubmit={submitRegister} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} className="input pl-9" placeholder="Your name" required />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="input pl-9" placeholder="you@example.com" required />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPass ? 'text' : 'password'} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="input pl-9 pr-9" placeholder="Minimum 6 characters" minLength="6" required />
                    <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className="input pl-9" placeholder="+91 98xxxxxx" />
                  </div>
                </div>

                <div>
                  <label className="label">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={registerForm.companyName} onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })} className="input pl-9" placeholder="Solar rooftop / residential" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />{success}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center h-11">
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
