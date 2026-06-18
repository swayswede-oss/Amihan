import { useState } from 'react';
import { Mail } from 'lucide-react';
import logo from 'figma:asset/d766fe78c0990450ebe81dfc9bafb7412cf8f61d.png';

type ForgotPasswordProps = {
  onSwitchToLogin: () => void;
};

export function ForgotPassword({ onSwitchToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="login-background min-h-screen flex items-center justify-center p-4">
      <div className="rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style={{ backgroundColor: '#e8eef5' }}>
        <div className="login-logo-header bg-black flex items-center justify-center">
          <img src={logo} alt="Amihan" className="login-logo-image" />
        </div>

        <div className="p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-gray-900 text-center mb-2">Forgot Password</h2>
            <p className="text-sm lg:text-base text-gray-600 text-center">
              {isSubmitted
                ? 'If an account exists for that email, a reset link has been sent.'
                : 'Enter your email and we will send you a link to reset your password.'}
            </p>
          </div>

          {isSubmitted ? (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Log In
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Send Reset Link
              </button>
            </form>
          )}

          {!isSubmitted && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Log In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
