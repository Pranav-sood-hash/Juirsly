import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ResetPasswordProps {
  token: string;
  onSuccess: () => void;
}

export function ResetPassword({ token, onSuccess }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  useEffect(() => {
    // Verify token exists
    const resetTokens = localStorage.getItem('jurisly_reset_tokens');
    if (!resetTokens) {
      setTokenValid(false);
      return;
    }

    const tokens = JSON.parse(resetTokens);
    const tokenData = tokens[token];

    if (!tokenData) {
      setTokenValid(false);
      return;
    }

    // Check if token is not expired (24 hours)
    const tokenAge = Date.now() - tokenData.timestamp;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      setTokenValid(false);
      delete tokens[token];
      localStorage.setItem('jurisly_reset_tokens', JSON.stringify(tokens));
      return;
    }

    setTokenValid(true);
  }, [token]);

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength('weak');
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) setPasswordStrength('weak');
    else if (strength <= 2) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    calculatePasswordStrength(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      /* --- Reset Password API Call ---
         Makes request to backend to update password with token
         In production, connect to your backend:
         const response = await fetch('/api/auth/reset-password', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ token, newPassword })
         });
      --- */

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get token data for email
      const resetTokens = localStorage.getItem('jurisly_reset_tokens');
      if (!resetTokens) {
        toast.error('Invalid reset token');
        setIsLoading(false);
        return;
      }

      const tokens = JSON.parse(resetTokens);
      const tokenData = tokens[token];

      if (!tokenData) {
        toast.error('Invalid reset token');
        setIsLoading(false);
        return;
      }

      const email = tokenData.email;

      // Update password in localStorage (demo)
      const storedUsers = localStorage.getItem('jurisly_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const userIndex = users.findIndex((u: any) => u.email === email);

        if (userIndex !== -1) {
          users[userIndex].password = newPassword;
          localStorage.setItem('jurisly_users', JSON.stringify(users));
        }
      }

      // Remove used token
      delete tokens[token];
      localStorage.setItem('jurisly_reset_tokens', JSON.stringify(tokens));

      toast.success('Password reset successfully!');
      setIsSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h2 className="text-2xl text-white mb-3">Invalid Reset Link</h2>
            <p className="text-white/70 mb-6">
              This password reset link is invalid or has expired. Reset links are only valid for 24 hours.
            </p>

            <button
              onClick={onSuccess}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all hover:scale-[1.02] active:scale-95"
            >
              Request New Link
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {isSuccess ? (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl text-white mb-3">Password Changed Successfully!</h2>
              <p className="text-white/70 mb-6">
                Your password has been reset. You can now log in with your new password.
              </p>
              <p className="text-white/60 text-sm">
                Redirecting to login page...
              </p>
            </motion.div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <span className="text-2xl text-white">J</span>
                </div>
                <h1 className="text-4xl bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Jurisly
                </h1>
              </div>
              <p className="text-white/70">Reset Your Password</p>
            </div>

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/80 mb-2 text-sm">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {['weak', 'medium', 'strong'].map((level) => (
                          <div
                            key={level}
                            className={`flex-1 h-1 rounded-full transition-all ${
                              passwordStrength === 'weak'
                                ? 'bg-red-500'
                                : passwordStrength === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-white/60 mt-1 capitalize">
                        Password strength: {passwordStrength}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400 mt-2">Passwords do not match</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="text-xs text-green-400 mt-2">Passwords match</p>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <p className="text-xs text-white/70">
                    Password must be at least 8 characters long with a mix of uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 8}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
