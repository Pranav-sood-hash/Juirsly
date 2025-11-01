import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ForgotPasswordProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPassword({ onClose, onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      /* --- Forgot Password API Call ---
         Makes request to backend to send password reset email
         In production, connect to your backend:
         const response = await fetch('/api/auth/forgot-password', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email })
         });
      --- */
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user exists in localStorage (demo)
      const storedUsers = localStorage.getItem('jurisly_users');
      if (!storedUsers) {
        toast.error('No users found. Please sign up first.');
        setIsLoading(false);
        return;
      }

      const users = JSON.parse(storedUsers);
      const userExists = users.some((u: any) => u.email === email);

      if (!userExists) {
        // Don't reveal if email exists for security
        toast.error('If this email is registered, you will receive a reset link.');
        setIsSubmitted(true);
        return;
      }

      // In production, backend would send email with reset link
      // For demo, generate a mock token and store it
      const mockToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetTokens = localStorage.getItem('jurisly_reset_tokens') || '{}';
      const tokens = JSON.parse(resetTokens);
      tokens[mockToken] = { email, timestamp: Date.now() };
      localStorage.setItem('jurisly_reset_tokens', JSON.stringify(tokens));

      toast.success('Check your email for the password reset link');
      setIsSubmitted(true);
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackOrClose = () => {
    if (isSubmitted) {
      onBackToLogin();
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackOrClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        {isSubmitted ? (
          <div className="p-8">
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
              <h2 className="text-2xl text-white text-center mb-3">Check Your Email</h2>
              <p className="text-white/70 text-center mb-6">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-white/60 text-sm text-center mb-6">
                The link will expire in 24 hours. If you don't see the email, check your spam folder.
              </p>
            </motion.div>

            <button
              onClick={onBackToLogin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all hover:scale-[1.02] active:scale-95"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-2xl text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                Reset Password
              </h2>
              <button
                onClick={handleBackOrClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <p className="text-white/70 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/80 mb-2 text-sm">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/70 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={onBackToLogin}
                  className="text-orange-400 hover:text-orange-300 transition-colors text-sm inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
