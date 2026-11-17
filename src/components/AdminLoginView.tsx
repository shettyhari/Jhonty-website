import { FormEvent, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  UserCheck,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AdminLoginViewProps {
  theme: 'light' | 'dark';
  isBusy: boolean;
  onToggleTheme: () => void;
  onLogin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onBackToStore: () => void;
}

export function AdminLoginView({
  theme,
  isBusy,
  onToggleTheme,
  onLogin,
  onBackToStore,
}: AdminLoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Enter your staff username and password.');
      return;
    }
    const res = await onLogin(username.trim(), password);
    if (!res.ok) {
      setError(res.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#080808] text-neutral-950 dark:text-neutral-50 transition-colors">
      {/* Dedicated Operations Portal Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0b0b0b]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo compact variant={theme} />
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#d98200] dark:text-[#faa619] pl-3 border-l border-neutral-200 dark:border-neutral-800">
              Operations &amp; Staff Portal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleTheme}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="inline-flex items-center gap-1.5 px-3 h-9 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:border-[#faa619] text-neutral-800 dark:text-neutral-100 text-xs font-semibold rounded-md transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#faa619]" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 px-3 h-9 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-500 text-neutral-800 dark:text-neutral-100 text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>
          </div>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-5">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-md bg-neutral-950 dark:bg-[#faa619] text-[#faa619] dark:text-neutral-950 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d98200] dark:text-[#faa619]">
                  Restricted Access
                </div>
                <h1 className="text-xl font-bold text-neutral-950 dark:text-white">
                  Admin &amp; Team Sign In
                </h1>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Sign in with your Jhonty Hub Admin or Store Team credentials to manage inventory,
              catalog pricing, order dispatch, and store-wise permissions.
            </p>

            {error && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-md text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                >
                  Staff Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or madhapur_team"
                  className="w-full h-11 px-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 placeholder:text-neutral-400 focus:bg-white dark:focus:bg-neutral-950 focus:border-[#faa619] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-3.5 pr-10 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm text-neutral-950 dark:text-neutral-100 placeholder:text-neutral-400 focus:bg-white dark:focus:bg-neutral-950 focus:border-[#faa619] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="w-full h-11 bg-[#faa619] hover:bg-[#e6950c] text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-md transition-colors disabled:opacity-50"
              >
                {isBusy ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>

          {/* Quick-Fill Demo Credentials */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-[#d98200] dark:text-[#faa619]" />
              <span>Default Staff Accounts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  setError(null);
                }}
                className="p-2.5 text-left rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-[#faa619] transition-colors"
              >
                <div className="font-bold text-neutral-950 dark:text-white flex items-center justify-between">
                  <span>Master Admin</span>
                  <span className="text-[10px] font-mono uppercase text-[#d98200] dark:text-[#faa619]">
                    All Stores
                  </span>
                </div>
                <div className="font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                  admin / admin123
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('madhapur_team');
                  setPassword('team123');
                  setError(null);
                }}
                className="p-2.5 text-left rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-[#faa619] transition-colors"
              >
                <div className="font-bold text-neutral-950 dark:text-white flex items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    Team Lead
                  </span>
                  <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">
                    Hitech City
                  </span>
                </div>
                <div className="font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                  madhapur_team / team123
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
