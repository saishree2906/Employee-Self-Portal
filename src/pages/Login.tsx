import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSignIn = () => {
    setStatus('loading');
    setTimeout(() => {
      login('mock-token-phase1', 'Employee', 'Saishree', 'TW-1042');
      setStatus('success');
      setTimeout(() => navigate('/portal/profile'), 1500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">

      {/* Success Toast */}
      {status === 'success' && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          style={{ animation: 'toastIn 0.35s ease-out forwards' }}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3.5 rounded-2xl shadow-2xl border border-green-100 min-w-[260px]">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Sign in successful!</p>
              <p className="text-xs text-gray-500 mt-0.5">Redirecting to your portal...</p>
            </div>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 transition-all duration-300"
        style={{
          transform: status === 'success' ? 'scale(0.96)' : 'scale(1)',
          opacity: status === 'success' ? 0.6 : 1,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">Tendworks</p>
            <p className="text-xs text-gray-500">Employee Self-Service</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">
          Use your work email to access the portal
        </p>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Work Email
            </label>
            <input
              type="email"
              defaultValue="saishree@tendworks.com"
              disabled={status !== 'idle'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Password
            </label>
            <input
              type="password"
              defaultValue="mock-password"
              disabled={status !== 'idle'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSignIn}
            disabled={status !== 'idle'}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'loading' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="w-4 h-4" />
                Success!
              </>
            )}
            {status === 'idle' && 'Sign In'}
          </button>
        </div>
      </div>

      {/* Toast animation */}
      <style>{`
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}