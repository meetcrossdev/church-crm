
import { supabase } from './supabase';
import { Member, Family, Event, Donation, User, ChurchSettings, Announcement } from '../types';

export const storage = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error || !profile) return null;
      
    return profile as User;
  },

  async login(email: string, pass: string) {
    return await supabase.auth.signInWithPassword({ email, password: pass });
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
    const { data, error } = await supabase
      .from('members')
      .upsert({
        ...member,
        id: member.id || undefined 
      })
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
    const { data, error } = await supabase
      .from('families')
      .upsert({
        ...family,
        id: family.id || undefined
      })
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
    const { data, error } = await supabase
      .from('events')
      .upsert({
        ...event,
        id: event.id || undefined
      })
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
    const { data, error } = await supabase
      .from('announcements')
      .upsert({ ...announcement, id: announcement.id || undefined })
      .select()
      .single();
    if (error) throw error;
    return data as Announcement;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  },

  // Settings
  async getSettings(): Promise<ChurchSettings> {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) throw error;
    return data as ChurchSettings;
  },

  async saveSettings(settings: ChurchSettings): Promise<void> {
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
    if (error) throw error;
  }
};
