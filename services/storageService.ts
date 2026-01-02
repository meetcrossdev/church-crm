
import { supabase } from './supabase';
import { Member, Family, Event, Donation, User, ChurchSettings, Announcement } from '../types';

class StorageService {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Fetch profile data from a 'profiles' table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return profile;
  }

  async login(email: string, pass: string) {
    return await supabase.auth.signInWithPassword({ email, password: pass });
  }

  async logout() {
    await supabase.auth.signOut();
  }

  // Members
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase.from('members').select('*').order('lastName');
    if (error) throw error;
    return data || [];
  }

  async saveMember(member: Member): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .upsert({
        ...member,
        id: member.id || undefined // Let Postgres generate ID if empty
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteMember(id: string) {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
  }

  // Families
  async getFamilies(): Promise<Family[]> {
    const { data, error } = await supabase.from('families').select('*');
    if (error) throw error;
    return data || [];
  }

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
    return data;
  }

  async deleteFamily(id: string) {
    const { error } = await supabase.from('families').delete().eq('id', id);
    if (error) throw error;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

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
    return data;
  }

  // Attendance logic
  async saveAttendance(eventId: string, memberIds: string[]) {
      await supabase.from('attendance').delete().eq('event_id', eventId);
      const inserts = memberIds.map(mId => ({ event_id: eventId, member_id: mId }));
      const { error } = await supabase.from('attendance').insert(inserts);
      if (error) throw error;
  }

  // Donations
  async getDonations(): Promise<Donation[]> {
    const { data, error } = await supabase.from('donations').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async addDonation(donation: Donation): Promise<Donation> {
    const { data, error } = await supabase
      .from('donations')
      .insert({ ...donation, id: undefined })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data || [];
  }

  async saveUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...user, id: user.id || undefined })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteUser(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async saveAnnouncement(announcement: Announcement): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .upsert({ ...announcement, id: announcement.id || undefined })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }

  // Settings
  async getSettings(): Promise<ChurchSettings> {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) throw error;
    return data;
  }

  async saveSettings(settings: ChurchSettings) {
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
    if (error) throw error;
  }
}

export const storage = new StorageService();
