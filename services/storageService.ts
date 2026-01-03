
import { supabase } from './supabase';
import { Member, Family, Event, Donation, User, ChurchSettings, Announcement, UserRole } from '../types';

const logError = (context: string, error: any) => {
  console.error(`Supabase Error [${context}]:`, error);
};

export const storage = {
  // Auth & Profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return null;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        logError('getCurrentUser_profile', profileError);
        return null;
      }

      if (!profile) {
        return {
          id: user.id,
          name: user.email ? user.email.split('@')[0] : 'User',
          email: user.email || '',
          role: UserRole.STAFF,
          avatar: "https://ui-avatars.com/api/?name=" + (user.email || 'User') + "&background=random"
        };
      }
        
      return profile as User;
    } catch (e) {
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
        name: name,
        email: email,
        role: UserRole.ADMIN,
        avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=random"
      });

    if (profileError) throw profileError;
    return data;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  // Members
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase.from('members').select('*').order('lastName');
    if (error) { logError('getMembers', error); throw error; }
    return (data || []) as Member[];
  },

  async saveMember(member: Member): Promise<Member> {
    const payload: any = { ...member };
    if (!payload.id || payload.id.length < 5) {
      delete payload.id;
    }
    
    const { data, error } = await supabase
      .from('members')
      .upsert(payload)
      .select()
      .single();
      
    if (error) { logError('saveMember', error); throw error; }
    return data as Member;
  },

  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) { logError('deleteMember', error); throw error; }
  },

  // Families
  async getFamilies(): Promise<Family[]> {
    const { data, error } = await supabase.from('families').select('*');
    if (error) { logError('getFamilies', error); throw error; }
    return (data || []) as Family[];
  },

  async saveFamily(family: Family): Promise<Family> {
    const payload: any = { ...family };
    if (!payload.id || payload.id.length < 5) {
      delete payload.id;
    }
    const { data, error } = await supabase.from('families').upsert(payload).select().single();
    if (error) throw error;
    return data as Family;
  },

  async deleteFamily(id: string): Promise<void> {
    const { error } = await supabase.from('families').delete().eq('id', id);
    if (error) throw error;
  },

  // Events
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []) as Event[];
  },

  async saveEvent(event: Event): Promise<Event> {
    const payload: any = { ...event };
    if (!payload.id || payload.id.length < 5) {
      delete payload.id;
    }
    const { data, error } = await supabase.from('events').upsert(payload).select().single();
    if (error) throw error;
    return data as Event;
  },

  // Donations
  async getDonations(): Promise<Donation[]> {
    const { data, error } = await supabase.from('donations').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []) as Donation[];
  },

  async addDonation(donation: Donation): Promise<Donation> {
    const payload: any = { ...donation };
    delete payload.id;
    const { data, error } = await supabase.from('donations').insert(payload).select().single();
    if (error) throw error;
    return data as Donation;
  },

  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return (data || []) as User[];
  },

  async saveUser(user: User): Promise<User> {
    const { data, error } = await supabase.from('profiles').upsert(user).select().single();
    if (error) throw error;
    return data as User;
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []) as Announcement[];
  },

  async saveAnnouncement(announcement: Announcement): Promise<Announcement> {
    const payload: any = { ...announcement };
    if (!payload.id || payload.id.length < 5) {
      delete payload.id;
    }
    const { data, error } = await supabase.from('announcements').upsert(payload).select().single();
    if (error) throw error;
    return data as Announcement;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  },

  // Settings
  async getSettings(): Promise<ChurchSettings> {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (error || !data) {
        return { name: 'Meetcross CRM', address: '', currency: '$', email: '', phone: '' };
      }
      return data as ChurchSettings;
    } catch (e) {
      return { name: 'Meetcross CRM', address: '', currency: '$', email: '', phone: '' };
    }
  },

  async saveSettings(settings: ChurchSettings): Promise<void> {
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
    if (error) throw error;
  }
};
