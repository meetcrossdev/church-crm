
import { supabase } from './supabase';
import { Member, Family, Event, Donation, User, ChurchSettings, Announcement, UserRole } from '../types';

/* 
 * STORAGE SERVICE
 * Re-implemented with zero single-line comments and template literals 
 * to ensure 100% compatibility with Vercel's TypeScript compiler.
 */

export const storage = {
  /* AUTH & USER PROFILES */
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        return null;
      }
      
      const userId = authData.user.id;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        return null;
      }

      if (!profile) {
        const email = authData.user.email || 'User';
        const namePart = email.split('@')[0];
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(namePart)}`;
        
        return {
          id: userId,
          name: namePart,
          email: email,
          role: UserRole.STAFF,
          avatar: avatarUrl
        };
      }
        
      return profile as User;
    } catch (e) {
      return null;
    }
  },

  async login(email: string, pass: string) {
    return await supabase.auth.signInWithPassword({ 
      email: email, 
      password: pass 
    });
  },

  async register(email: string, pass: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ 
      email: email, 
      password: pass 
    });
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      throw new Error('User creation failed');
    }

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
    const { error: pError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        name: name,
        email: email,
        role: UserRole.ADMIN,
        avatar: avatar
      });

    if (pError) {
      throw pError;
    }
    
    return data;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  /* MEMBERS MANAGEMENT */

  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('lastName');
    
    if (error) {
      throw error;
    }
    
    return (data || []) as Member[];
  },

  async saveMember(member: Member): Promise<Member> {
    const payload: Partial<Member> = { ...member };
    if (!payload.id || payload.id === '') {
      delete payload.id;
    }
    
    const { data, error } = await supabase
      .from('members')
      .upsert(payload)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as Member;
  },

  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  },

  /* FAMILY MANAGEMENT */

  async getFamilies(): Promise<Family[]> {
    const { data, error } = await supabase
      .from('families')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return (data || []) as Family[];
  },

  async saveFamily(family: Family): Promise<Family> {
    const payload: Partial<Family> = { ...family };
    if (!payload.id || payload.id === '') {
      delete payload.id;
    }
    
    const { data, error } = await supabase
      .from('families')
      .upsert(payload)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Family;
  },

  async deleteFamily(id: string): Promise<void> {
    const { error } = await supabase
      .from('families')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  },

  /* EVENT MANAGEMENT */

  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return (data || []) as Event[];
  },

  async saveEvent(event: Event): Promise<Event> {
    const payload: Partial<Event> = { ...event };
    if (!payload.id || payload.id === '') {
      delete payload.id;
    }
    
    const { data, error } = await supabase
      .from('events')
      .upsert(payload)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Event;
  },

  /* FINANCIAL TRACKING */

  async getDonations(): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return (data || []) as Donation[];
  },

  async addDonation(donation: Donation): Promise<Donation> {
    const payload: Partial<Donation> = { ...donation };
    delete payload.id;
    
    const { data, error } = await supabase
      .from('donations')
      .insert(payload)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Donation;
  },

  /* COMMUNICATIONS */

  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return (data || []) as Announcement[];
  },

  async saveAnnouncement(announcement: Announcement): Promise<Announcement> {
    const payload: Partial<Announcement> = { ...announcement };
    if (!payload.id || payload.id === '') {
      delete payload.id;
    }
    
    const { data, error } = await supabase
      .from('announcements')
      .upsert(payload)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Announcement;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  },

  /* SYSTEM SETTINGS */

  async getSettings(): Promise<ChurchSettings> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      
      if (error || !data) {
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
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, ...settings });
    
    if (error) {
      throw error;
    }
  },

  /* USER MANAGEMENT */

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return (data || []) as User[];
  },

  async saveUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(user)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as User;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
};
