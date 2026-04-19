// Frontend/src/pages/SignUpPage.tsx
// ✅ After signup → goes to LOGIN page with success banner
// ✅ Strong validations: name, email, password strength, confirm password
// ✅ i18n support

import { useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const API_URL = 'http://localhost:5000/api';

interface SignUpPageProps {
  onSignUpSuccess: () => void;   // ← App.tsx now sends to 'login' page
  onNavigate:      (page: string) => void;
}

interface FormErrors {
  name: string; email: string; password: string; confirm: string; role: string;
}

export default function SignUpPage({ onSignUpSuccess, onNavigate }: SignUpPageProps) {
  const { t } = useTranslation();
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '', role: 'farmer' });
  const [errors,   setErrors]   = useState<FormErrors>({ name: '', email: '', password: '', confirm: '', role: '' });
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showConf, setShowConf] = useState(false);

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8)             score++;
    if (/[A-Z]/.test(pwd))           score++;
    if (/[0-9]/.test(pwd))           score++;
    if (/[^A-Za-z0-9]/.test(pwd))   score++;
    const levels = [
      { label: 'Too short',  color: 'bg-red-500'    },
      { label: 'Weak',       color: 'bg-red-400'    },
      { label: 'Fair',       color: 'bg-yellow-500' },
      { label: 'Good',       color: 'bg-blue-500'   },
      { label: 'Strong',     color: 'bg-green-500'  },
    ];
    return { score, ...levels[Math.min(score, 4)] };
  };

  const validateField = (name: string, value: string, currentForm = form): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (value.trim().length > 50) return 'Name must be less than 50 characters.';
        if (!/^[a-zA-Z\u0D80-\u0DFF\s]+$/.test(value.trim())) return 'Name should only contain letters and spaces.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        if (value.length > 50) return 'Password must be less than 50 characters.';
        return '';
      case 'confirm':
        if (!value) return 'Please confirm your password.';
        if (value !== currentForm.password) return 'Passwords do not match.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value, newForm),
      // Re-validate confirm when password changes
      ...(name === 'password' ? { confirm: validateField('confirm', newForm.confirm, newForm) } : {})
    }));
    setApiError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {
      name:    validateField('name',    form.name),
      email:   validateField('email',   form.email),
      password: validateField('password', form.password),
      confirm: validateField('confirm', form.confirm),
      role:    '',
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // ✅ Do NOT store token — user must log in manually
      // This enforces the login page flow
      onSignUpSuccess();   // → App.tsx navigates to 'login'
    } catch (err: any) {
      setApiError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-green-200 rounded-full opacity-30 blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-emerald-200 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white">
        {/* Language switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🥥</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">CocoAI</h1>
          <p className="text-gray-500 mt-1 text-sm">Coconut Disease Detection System</p>
          <p className="text-gray-600 mt-2 font-medium">{t.signup.title}</p>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t.signup.fullName} <span className="text-red-500">*</span>
            </label>
            <input type="text" name="name" value={form.name}
              onChange={handleChange} onBlur={handleBlur}
              className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white'
              }`}
              placeholder={t.signup.namePlaceholder} />
            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t.signup.email} <span className="text-red-500">*</span>
            </label>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} onBlur={handleBlur}
              className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white'
              }`}
              placeholder={t.signup.emailPlaceholder} />
            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t.signup.password} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} name="password" value={form.password}
                onChange={handleChange} onBlur={handleBlur}
                className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none transition ${
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white'
                }`}
                placeholder={t.signup.passwordPlaceholder} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password strength bar */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwdStrength.score ? pwdStrength.color : 'bg-gray-200'}`}></div>
                  ))}
                </div>
                <p className={`text-xs ${pwdStrength.score >= 3 ? 'text-green-600' : pwdStrength.score >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                  Password strength: {pwdStrength.label}
                </p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type={showConf ? 'text' : 'password'} name="confirm" value={form.confirm}
                onChange={handleChange} onBlur={handleBlur}
                className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none transition ${
                  errors.confirm ? 'border-red-400 bg-red-50' : form.confirm && !errors.confirm ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white'
                }`}
                placeholder="Re-enter your password" />
              <button type="button" onClick={() => setShowConf(!showConf)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {form.confirm && !errors.confirm && (
                <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {errors.confirm && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.confirm}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.signup.role}</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition">
              <option value="farmer">{t.signup.farmer}</option>
              <option value="officer">{t.signup.officer}</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>{t.signup.submitting}</>
            ) : t.signup.submit}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t.signup.haveAccount}{' '}
          <button onClick={() => onNavigate('login')}
            className="text-green-600 font-bold hover:text-green-700 hover:underline transition">{t.signup.signIn}</button>
        </p>
      </div>
    </div>
  );
}