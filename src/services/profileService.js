import { supabase } from '../lib/supabase';

export const profileService = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Try to fetch the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // If we got data, return it
    if (data) return data;

    // Profile doesn't exist — create it
    // Use .maybeSingle() to avoid 406 errors
    console.warn('Profile not found, creating one...');
    const newProfile = {
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name || 'New',
      last_name: user.user_metadata?.last_name || 'User',
      role: 'customer',
      points: 0
    };
    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .maybeSingle();

    if (createError) {
      console.error('Failed to create profile:', createError);
      // Return a minimal profile object so the app doesn't crash
      return {
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || 'User',
        last_name: user.user_metadata?.last_name || '',
        role: 'customer',
        points: 0
      };
    }
    return created;
  },


  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Simple validation for Indian Pincode
    if (updates.pincode && !/^[1-9][0-9]{5}$/.test(updates.pincode)) {
      throw new Error('Invalid Indian Pincode. Please enter a valid 6-digit number.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(file) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  },
};
