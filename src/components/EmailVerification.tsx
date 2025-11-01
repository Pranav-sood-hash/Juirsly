import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface EmailVerificationProps {
  onVerified: () => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const { resendVerificationEmail } = useAuth();

  useEffect(() => {
    // Supabase automatically handles email verification via the URL hash
    // We just need to check if the verification was successful
    const checkVerification = async () => {
      try {
        // Wait a moment for Supabase to process the verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check the hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Email verification failed. The link may have expired.');
          setCanResend(true);
          return;
        }

        if (type === 'signup') {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            onVerified();
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Invalid verification link.');
          setCanResend(true);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
        setCanResend(true);
      }
    };

    checkVerification();
  }, [onVerified]);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        toast.success(result.message || 'Verification email sent!');
      } else {
        toast.error(result.message || 'Failed to resend email. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <span className="text-2xl text-white">J</span>
            </div>
            <h1 className="text-4xl bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Jurisly
            </h1>
          </div>
          <p className="text-white/70">Email Verification</p>
        </div>

        {/* Verification Status */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="flex justify-center mb-6"
          >
            {status === 'verifying' && (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl text-white mb-3">
              {status === 'verifying' && 'Verifying Email'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h2>
            <p className="text-white/70 mb-6">{message}</p>

            {status === 'success' && (
              <p className="text-white/60 text-sm">
                Redirecting to login page...
              </p>
            )}

            {status === 'error' && canResend && (
              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/70 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Resend Verification Email
                    </>
                  )}
                </button>

                <button
                  onClick={onVerified}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
                >
                  Back to Login
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
