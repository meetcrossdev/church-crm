
import { supabase } from './supabase';
import { Member, Family, Event, Donation, User, ChurchSettings, Announcement, UserRole } from '../types';

const logError = (context: string, error: any) => {
  console.error(`Supabase Error Detailed [${context}]:`, {
    message: error?.message || 'No message',
    code: error?.code || 'No code',
    details: error?.details || 'No details',
    hint: error?.hint || 'No hint',
    fullError: error
  });
};

export const storage = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        logError('getCurrentUser_auth', authError);
        return null;
      }
      
      const user = authData?.user;
      if (!user) return null;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        logError('getCurrentUser_profile', error);
        return null;
      }

      if (!profile) {
          console.warn("User authenticated but no record found in 'profiles' table.");
          return {
              id: user.id,
              name: user.email?.split('@')[0] || 'User',
              email: user.email || '',
              role: UserRole.STAFF,
              avatar: `https://ui-avatars.com/api/?name=${user.email}&background=random`
          };
      }
        
      return profile as User;
    } catch (e) {
      console.error("Critical failure in getCurrentUser:", e);
      return null;
    }
  },

  async login(email: string, pass: string) {
    return await supabase.auth.signInWithPassword({ email, password: pass });
  },

  async register(email: string, pass: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Sign up failed");

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        name,
        email,
        role: UserRole.ADMIN,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      });

    if (profileError) {
      logError('register_profile', profileError);
      throw profileError;
    }

    return data;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  // Members
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase.from('members').select('*').order('lastName');
    if (error) {
      logError('getMembers', error);
      throw error;
    }
    return (data || []) as Member[];
  },

  async saveMember(member: Member): Promise<Member> {
    // Clean payload for Supabase
    const payload = { ...member };
    
    // UUIDs must be valid or absent. Empty strings will cause a database error.
    if (!payload.id || payload.id === '' || payload.id.length < 10) {
      delete (payload as any).id;
    }
    
    // Ensure all required fields match database names exactly
    console.log("Saving member payload:", payload);

    const { data, error } = await supabase
      .from('members')
      .upsert(payload)
      .select()
      .single();
      
    if (error) {
      logError('saveMember', error);
      throw error;
    }
    return data as Member;
  },

  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      logError('deleteMember', error);
      throw error;
    }
  },

  // Families
  async getFamilies(): Promise<Family[]> {
    const { data, error } = await supabase.from('families').select('*');
    if (error) {
      logError('getFamilies', error);
      throw error;
    }
    return (data || []) as Family[];
  },

  async saveFamily(family: Family): Promise<Family> {
    const payload = { ...family };
    if (!payload.id || payload.id === '') {
      delete (payload as any).id;
    }

    const { data, error } = await supabase
      .from('families')
      .upsert(payload)
      .select()
      .single();
    if (error) {
      logError('saveFamily', error);
      throw error;
    }
    return data as Family;
  },

  async deleteFamily(id: string): Promise<void> {
    const { error } = await supabase.from('families').delete().eq('id', id);
    if (error) {
      logError('deleteFamily', error);
      throw error;
    }
  },

  // Events
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (error) {
      logError('getEvents', error);
      throw error;
    }
    return (data || []) as Event[];
  },

  async saveEvent(event: Event): Promise<Event> {
    const payload = { ...event };
    if (!payload.id || payload.id === '') {
      delete (payload as any).id;
    }

    const { data, error } = await supabase
      .from('events')
      .upsert(payload)
      .select()
      .single();
    if (error) {
      logError('saveEvent', error);
      throw error;
    }
    return data as Event;
  },

  // Donations
  async getDonations(): Promise<Donation[]> {
    const { data, error } = await supabase.from('donations').select('*').order('date', { ascending: false });
    if (error) {
      logError('getDonations', error);
      throw error;
    }
    return (data || []) as Donation[];
  },

  async addDonation(donation: Donation): Promise<Donation> {
    const { data, error } = await supabase
      .from('donations')
      .insert({ ...donation, id: undefined })
      .select()
      .single();
    if (error) {
      logError('addDonation', error);
      throw error;
    }
    return data as Donation;
  },

  // Users/Profiles
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      logError('getUsers', error);
      throw error;
    }
    return (data || []) as User[];
  },

  async saveUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...user, id: user.id || undefined })
      .select()
      .single();
    if (error) {
      logError('saveUser', error);
      throw error;
    }
    return data as User;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      logError('deleteUser', error);
      throw error;
    }
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (error) {
      logError('getAnnouncements', error);
      throw error;
    }
    return (data || []) as Announcement[];
  },

  async saveAnnouncement(announcement: Announcement): Promise<Announcement> {
    const payload = { ...announcement };
    if (!payload.id || payload.id === '') {
      delete (payload as any).id;
    }

    const { data, error } = await supabase
      .from('announcements')
      .upsert(payload)
      .select()
      .single();
    if (error) {
      logError('saveAnnouncement', error);
      throw error;
    }
    return data as Announcement;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      logError('deleteAnnouncement', error);
      throw error;
    }
  },

  // Settings
  async getSettings(): Promise<ChurchSettings> {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (error) {
        logError('getSettings', error);
      }
      if (!data) {
        return {
          name: 'Meetcross CRM',
          address: '',
          currency: '$',
          email: '',
          phone: ''
        };
      }
      return data as ChurchSettings;
    } catch (e) {
      return {
        name: 'Meetcross CRM',
        address: '',
        currency: '$',
        email: '',
        phone: ''
      };
    }
  },

  async saveSettings(settings: ChurchSettings): Promise<void> {
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
    if (error) {
      logError('saveSettings', error);
      throw error;
    }
  }
};
