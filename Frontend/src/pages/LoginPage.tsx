// Frontend/src/pages/LoginPage.tsx
// ✅ Shows "Account created successfully!" banner after signup
// ✅ More validations (email format, empty fields)
// ✅ i18n support

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const API_URL = 'http://localhost:5000/api';

interface LoginPageProps {
  onLoginSuccess:         () => void;
  onNavigate:             (page: string) => void;
  signupSuccess?:         boolean;
  onClearSignupSuccess?:  () => void;
}

export default function LoginPage({
  onLoginSuccess, onNavigate, signupSuccess = false, onClearSignupSuccess
}: LoginPageProps) {
  const { t } = useTranslation();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({ email: '', password: '' });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Auto-dismiss signup success banner after 5s
  useEffect(() => {
    if (signupSuccess && onClearSignupSuccess) {
      const timer = setTimeout(onClearSignupSuccess, 5000);
      return () => clearTimeout(timer);
    }
  }, [signupSuccess]);

  const validateField = (name: string, value: string) => {
    if (name === 'email') {
      if (!value.trim())           return 'Email is required.';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address.';
    }
    if (name === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 6) return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    setApiError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields before submitting
    const emailErr = validateField('email',    form.email);
    const pwdErr   = validateField('password', form.password);
    setErrors({ email: emailErr, password: pwdErr });
    if (emailErr || pwdErr) return;

    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      onLoginSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-30 blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-emerald-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-100 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white">
        {/* Language switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🥥</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
            CocoAI
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Coconut Disease Detection System</p>
          <p className="text-gray-600 mt-2 font-medium">{t.login.title}</p>
        </div>

        {/* ✅ Signup success banner */}
        {signupSuccess && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-3 mb-5 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-semibold text-sm">Account created successfully! 🎉</p>
              <p className="text-green-700 text-xs mt-0.5">Please sign in with your new credentials.</p>
            </div>
          </div>
        )}

        {/* API error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.login.email} <span className="text-red-500">*</span>
            </label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} onBlur={handleBlur}
              className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition ${
                errors.email
                  ? 'border-red-400 bg-red-50 focus:border-red-500'
                  : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white'
              }`}
              placeholder={t.login.emailPlaceholder}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.login.password} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'} name="password" value={form.password}
                onChange={handleChange} onBlur={handleBlur}
                className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none transition ${
                  errors.password
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-gray-50 focus:border-green-500 focus:bg-white'
                }`}
                placeholder={t.login.passwordPlaceholder}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.password}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>{t.login.submitting}</>
            ) : t.login.submit}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t.login.noAccount}{' '}
          <button onClick={() => onNavigate('signup')}
            className="text-green-600 font-bold hover:text-green-700 hover:underline transition">
            {t.login.signUp}
          </button>
        </p>
      </div>
    </div>
  );
}