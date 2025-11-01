import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit, 
  Lock,
  Upload,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
  Scale
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner@2.0.3';

interface ProfilePageProps {
  onClose: () => void;
}

/* --- Avatar System Start ---
   Law-themed avatars: 5 male + 5 female
   Each avatar represents legal professionals with justice themes
   Store selected avatar in user profile via localStorage/database
--- Avatar System End --- */
const LAW_AVATARS = {
  male: [
    { id: 'm1', name: 'Judge Marcus', emoji: '👨‍⚖️', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'm2', name: 'Attorney James', emoji: '🧑‍💼', gradient: 'from-purple-500 to-indigo-500' },
    { id: 'm3', name: 'Advocate David', emoji: '👔', gradient: 'from-teal-500 to-green-500' },
    { id: 'm4', name: 'Counselor Michael', emoji: '🎓', gradient: 'from-orange-500 to-red-500' },
    { id: 'm5', name: 'Barrister John', emoji: '⚖️', gradient: 'from-pink-500 to-rose-500' },
  ],
  female: [
    { id: 'f1', name: 'Judge Sarah', emoji: '👩‍⚖️', gradient: 'from-purple-500 to-pink-500' },
    { id: 'f2', name: 'Attorney Emma', emoji: '👩‍💼', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'f3', name: 'Advocate Lisa', emoji: '💼', gradient: 'from-green-500 to-teal-500' },
    { id: 'f4', name: 'Counselor Maria', emoji: '📚', gradient: 'from-red-500 to-orange-500' },
    { id: 'f5', name: 'Barrister Anna', emoji: '⚖️', gradient: 'from-indigo-500 to-purple-500' },
  ],
};

export function ProfilePage({ onClose }: ProfilePageProps) {
  const { user, updateUserProfile, updatePassword } = useAuth();
  const { language } = useSettings();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSection, setEditSection] = useState<'avatar' | 'password' | null>(null);
  
  // Form states
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const translations = {
    en: {
      profile: 'Profile',
      editProfile: 'Edit Profile',
      back: 'Back',
      save: 'Save Changes',
      fullName: 'Full Name',
      email: 'Email Address',
      dateOfBirth: 'Date of Birth',
      accountType: 'Account Type',
      standard: 'Standard',
      chooseAvatar: 'Choose Your Avatar',
      uploadPhoto: 'Upload Photo',
      male: 'Male Avatars',
      female: 'Female Avatars',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      sendResetLink: 'Send Password Reset Link',
      passwordUpdated: 'Password updated successfully!',
      passwordError: 'Current password is incorrect',
      passwordMismatch: 'Passwords do not match',
      resetLinkSent: 'Password reset link has been sent to your registered email.',
      profileUpdated: 'Profile updated successfully!',
      greeting: 'Welcome back',
      ready: 'Ready to continue your case?',
      notSet: 'Not set',
    },
    hi: {
      profile: 'प्रोफ़ाइल',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      back: 'वापस',
      save: 'परिवर्तन सहेजें',
      fullName: 'पूरा नाम',
      email: 'ईमेल पता',
      dateOfBirth: 'जन्म तिथि',
      accountType: 'खाता प्रकार',
      standard: 'मानक',
      chooseAvatar: 'अपना अवतार चुनें',
      uploadPhoto: 'फ़ोटो अपलोड करें',
      male: 'पुरुष अवतार',
      female: 'महिला अवतार',
      changePassword: 'पासवर्ड बदलें',
      currentPassword: 'वर्तमान पासवर्ड',
      newPassword: 'नया पासवर्ड',
      confirmPassword: 'नया पासवर्ड पुष्टि करें',
      sendResetLink: 'पासवर्ड रीसेट लिंक भेजें',
      passwordUpdated: 'पासवर्ड सफलतापूर्वक अपडेट किया गया!',
      passwordError: 'वर्तमान पासवर्ड गलत है',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते',
      resetLinkSent: 'आपके पंजीकृत ईमेल पर पासवर्ड रीसेट लिंक भेज दिया गया है।',
      profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!',
      greeting: 'वापसी पर स्वागत है',
      ready: 'अपना मामला जारी रखने के लिए तैयार हैं?',
      notSet: 'निर्धारित नहीं',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getAvatarDisplay = (avatarId: string) => {
    const allAvatars = [...LAW_AVATARS.male, ...LAW_AVATARS.female];
    const avatar = allAvatars.find(a => a.id === avatarId);
    return avatar || { emoji: user?.name?.charAt(0).toUpperCase() || 'U', gradient: 'from-purple-500 to-pink-500' };
  };

  const currentAvatar = getAvatarDisplay(user?.avatar || '');

  const handleSaveProfile = async () => {
    const success = await updateUserProfile({
      avatar: selectedAvatar,
      dateOfBirth: dateOfBirth,
    });
    
    if (success) {
      toast.success(t.profileUpdated);
      setIsEditMode(false);
      setEditSection(null);
    } else {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t.passwordMismatch);
      return;
    }

    const success = await updatePassword(currentPassword, newPassword);
    
    if (success) {
      toast.success(t.passwordUpdated);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditMode(false);
      setEditSection(null);
    } else {
      toast.error(t.passwordError);
    }
  };

  const handleSendResetLink = () => {
    /* --- n8n Email Reset Integration Here ---
       Send password reset email via n8n webhook
       Example:
       fetch('https://your-n8n-instance.com/webhook/password-reset', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           email: user?.email,
           resetToken: generateToken(),
           timestamp: new Date().toISOString()
         })
       })
       .then(response => response.json())
       .then(data => {
         toast.success('Reset link sent successfully');
       })
       .catch(error => {
         toast.error('Failed to send reset link');
       });
    --- */
    toast.success(t.resetLinkSent);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Background Gradient - Law Theme: Purple → Black → Crimson Red */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-red-950" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Profile Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/80 via-purple-900/30 to-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-purple-500/20"
        style={{
          boxShadow: '0 0 80px rgba(168, 85, 247, 0.15), inset 0 0 80px rgba(139, 92, 246, 0.05)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-500/10 via-red-500/10 to-purple-500/10 border-b border-white/10 backdrop-blur-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEditMode ? (
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setEditSection(null);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-white flex items-center gap-2">
                  {isEditMode ? t.editProfile : t.profile}
                </h2>
                {!isEditMode && (
                  <p className="text-white/50 text-sm mt-0.5">
                    <Scale className="w-3 h-3 inline mr-1" />
                    {t.greeting}, {user?.name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {!isEditMode ? (
            <>
              {/* AI Greeting */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <p className="text-cyan-400/80 text-sm sm:text-base">
                  ⚖️ {t.ready}
                </p>
              </motion.div>

              {/* Avatar Display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center mb-8"
              >
                <div 
                  className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentAvatar.gradient} flex items-center justify-center shadow-2xl shadow-purple-500/30 border-4 border-white/10 relative group`}
                  style={{
                    boxShadow: '0 0 60px rgba(168, 85, 247, 0.3)',
                  }}
                >
                  <span className="text-6xl">{currentAvatar.emoji}</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>

              {/* User Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
                  style={{
                    boxShadow: 'inset 0 0 40px rgba(139, 92, 246, 0.05)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/50 text-sm mb-1">{t.fullName}</p>
                      <p className="text-white truncate">{user?.name}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
                  style={{
                    boxShadow: 'inset 0 0 40px rgba(139, 92, 246, 0.05)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/50 text-sm mb-1">{t.email}</p>
                      <p className="text-white truncate">{user?.email}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
                  style={{
                    boxShadow: 'inset 0 0 40px rgba(139, 92, 246, 0.05)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/50 text-sm mb-1">{t.dateOfBirth}</p>
                      <p className="text-white">{user?.dateOfBirth || t.notSet}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
                  style={{
                    boxShadow: 'inset 0 0 40px rgba(139, 92, 246, 0.05)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/50 text-sm mb-1">{t.accountType}</p>
                      <p className="text-white">{user?.accountType || t.standard}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setEditSection('avatar');
                    setSelectedAvatar(user?.avatar || '');
                    setDateOfBirth(user?.dateOfBirth || '');
                  }}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white rounded-2xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  {t.editProfile}
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setEditSection('password');
                  }}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-2xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  {t.changePassword}
                </button>
              </motion.div>
            </>
          ) : (
            <>
              {/* Edit Avatar Section */}
              {editSection === 'avatar' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Avatar Selection */}
                  <div>
                    <h3 className="text-white mb-4 flex items-center gap-2">
                      {t.chooseAvatar}
                    </h3>
                    
                    {/* Male Avatars */}
                    <div className="mb-6">
                      <p className="text-white/70 text-sm mb-3">{t.male}</p>
                      <div className="grid grid-cols-5 gap-3">
                        {LAW_AVATARS.male.map((avatar) => (
                          <motion.button
                            key={avatar.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedAvatar(avatar.id)}
                            className={`relative aspect-square rounded-2xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-4xl transition-all ${
                              selectedAvatar === avatar.id
                                ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/50'
                                : 'hover:ring-2 hover:ring-white/30'
                            }`}
                          >
                            {avatar.emoji}
                            {selectedAvatar === avatar.id && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-black" />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Female Avatars */}
                    <div className="mb-6">
                      <p className="text-white/70 text-sm mb-3">{t.female}</p>
                      <div className="grid grid-cols-5 gap-3">
                        {LAW_AVATARS.female.map((avatar) => (
                          <motion.button
                            key={avatar.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedAvatar(avatar.id)}
                            className={`relative aspect-square rounded-2xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-4xl transition-all ${
                              selectedAvatar === avatar.id
                                ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/50'
                                : 'hover:ring-2 hover:ring-white/30'
                            }`}
                          >
                            {avatar.emoji}
                            {selectedAvatar === avatar.id && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-black" />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Upload Option */}
                    <div className="p-6 border-2 border-dashed border-white/20 rounded-2xl hover:border-white/40 transition-all cursor-pointer">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white/50" />
                        </div>
                        <div>
                          <p className="text-white/70">{t.uploadPhoto}</p>
                          <p className="text-white/40 text-sm mt-1">(Coming Soon)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth Input */}
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">{t.dateOfBirth}</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white rounded-2xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {t.save}
                  </button>
                </motion.div>
              )}

              {/* Edit Password Section */}
              {editSection === 'password' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-white mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      {t.changePassword}
                    </h3>

                    {/* Current Password */}
                    <div className="mb-4">
                      <label className="text-white/70 text-sm mb-2 block">{t.currentPassword}</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="mb-4">
                      <label className="text-white/70 text-sm mb-2 block">{t.newPassword}</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                      <label className="text-white/70 text-sm mb-2 block">{t.confirmPassword}</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Update Password Button */}
                    <button
                      onClick={handlePasswordChange}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {t.save}
                    </button>
                  </div>

                  {/* Email Reset Option */}
                  <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-2xl">
                    <h4 className="text-white mb-2">Reset via Email</h4>
                    <p className="text-white/60 text-sm mb-4">
                      Get a password reset link sent to {user?.email}
                    </p>
                    <button
                      onClick={handleSendResetLink}
                      className="w-full py-3 px-6 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      {t.sendResetLink}
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Optional: Last Login Activity */}
        {!isEditMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="border-t border-white/10 p-6 text-center"
          >
            <p className="text-white/40 text-sm">
              📜 Last activity: October 29, 2025
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
