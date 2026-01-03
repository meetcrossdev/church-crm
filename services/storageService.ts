
import { supabase } from './supabase';
import { Member, Family, Event, Donation, User, ChurchSettings, Announcement, UserRole } from '../types';

export const storage = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error || !profile) return null;
        
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
        name,
        email,
        role: UserRole.ADMIN,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
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
    if (error) throw error;
    return (data || []) as Member[];
  },

  async saveMember(member: Member): Promise<Member> {
    const payload = { ...member };
    if (!payload.id) delete (payload as any).id;
    
    const { data, error } = await supabase
      .from('members')
      .upsert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Member;
  },

  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
  },

  // Families
  async getFamilies(): Promise<Family[]> {
    const { data, error } = await supabase.from('families').select('*');
    if (error) throw error;
    return (data || []) as Family[];
  },

  async saveFamily(family: Family): Promise<Family> {
    const payload = { ...family };
    if (!payload.id) delete (payload as any).id;

    const { data, error } = await supabase
      .from('families')
      .upsert(payload)
      .select()
      .single();
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
    const payload = { ...event };
    if (!payload.id) delete (payload as any).id;

    const { data, error } = await supabase
      .from('events')
      .upsert(payload)
      .select()
      .single();
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
    const { data, error } = await supabase
      .from('donations')
      .insert({ ...donation, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return data as Donation;
  },

  // Users/Profiles
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return (data || []) as User[];
  },

  async saveUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...user, id: user.id || undefined })
      .select()
      .single();
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
    const payload = { ...announcement };
    if (!payload.id) delete (payload as any).id;

    const { data, error } = await supabase
      .from('announcements')
      .upsert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Announcement;
  },

  /**
   * Deletes an announcement by its ID.
   */
  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  },

  // Settings
  async getSettings(): Promise<ChurchSettings> {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
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
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
    if (error) throw error;
  }
};

