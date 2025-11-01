// Example: How to use the profiles table with Supabase Auth

import { supabase } from './lib/supabase';

// ============================================
// 1. SIGNUP (Profile created automatically)
// ============================================
async function signupUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: fullName, // Stored in auth.users metadata AND profiles table
      },
    },
  });

  if (error) {
    console.error('Signup error:', error.message);
    return { success: false, error: error.message };
  }

  // Profile is automatically created by the database trigger!
  console.log('User created:', data.user?.id);
  return { success: true, user: data.user };
}

// ============================================
// 2. FETCH USER PROFILE
// ============================================
async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }

  return data;
}

// ============================================
// 3. UPDATE USER PROFILE
// ============================================
async function updateUserProfile(userId: string, updates: {
  full_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  account_type?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, profile: data };
}

// ============================================
// 4. GET CURRENT USER WITH PROFILE
// ============================================
async function getCurrentUserWithProfile() {
  // Get current auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('Not authenticated');
    return null;
  }

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError.message);
    return null;
  }

  return {
    // Auth data (from auth.users)
    id: user.id,
    email: user.email,
    emailVerified: !!user.email_confirmed_at,
    
    // Profile data (from profiles table)
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    dateOfBirth: profile.date_of_birth,
    accountType: profile.account_type,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

// ============================================
// 5. UPLOAD AND UPDATE AVATAR
// ============================================
async function uploadAvatar(userId: string, file: File) {
  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Upload error:', uploadError.message);
    return { success: false, error: uploadError.message };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile with avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  if (updateError) {
    console.error('Profile update error:', updateError.message);
    return { success: false, error: updateError.message };
  }

  return { success: true, avatarUrl: publicUrl };
}

// ============================================
// WHY THIS APPROACH IS CORRECT
// ============================================
/*
1. SECURITY:
   - Supabase handles password hashing/salting automatically
   - You never see or store passwords
   - auth.users table is protected

2. SEPARATION OF CONCERNS:
   - auth.users = authentication data (managed by Supabase)
   - profiles = application data (managed by you)

3. DATA INTEGRITY:
   - Foreign key constraint ensures profiles match auth users
   - ON DELETE CASCADE cleans up profiles when users are deleted

4. ROW LEVEL SECURITY:
   - Users can only see/edit their own profiles
   - Enforced at database level, not just in code

5. AUTOMATIC PROFILE CREATION:
   - Database trigger creates profile on signup
   - No extra API calls needed
   - Consistent data
*/

export {
  signupUser,
  getUserProfile,
  updateUserProfile,
  getCurrentUserWithProfile,
  uploadAvatar,
};
