import { supabase } from './supabase';
import {
  Member,
  Family,
  Event,
  Donation,
  User,
  ChurchSettings,
  Announcement,
  UserRole,
} from '../types';

const DEFAULT_SETTINGS: ChurchSettings = {
  name: 'Meetcross CRM',
  address: '',
  currency: '$',
  email: '',
  phone: '',
};

const avatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

export const storage = {
  /* ================= AUTH ================= */

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile) {
      return {
        id: data.user.id,
        name: data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
        role: UserRole.STAFF,
        avatar: avatarUrl(data.user.email || 'User'),
      };
    }

    return profile as User;
  },

  async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async register(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) throw error;

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      email,
      role: UserRole.ADMIN,
      avatar: avatarUrl(name),
    });

    if (profileError) throw profileError;
    return data;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  /* ================= MEMBERS ================= */

  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('lastName');

    if (error) throw error;
    return data ?? [];
  },

  async saveMember(member: Member): Promise<Member> {
    const payload = { ...member };
    if (!payload.id) delete payload.id;

    const { data, error } = await supabase
      .from('members')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMember(id: string) {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
  },

  /* ================= FAMILIES ================= */

  async getFamilies(): Promise<Family[]> {
    const { data, error } = await supabase.from('families').select('*');
    if (error) throw error;
    return data ?? [];
  },

  async saveFamily(family: Family): Promise<Family> {
    const payload = { ...family };
    if (!payload.id) delete payload.id;

    const { data, error } = await supabase
      .from('families')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFamily(id: string) {
    const { error } = await supabase.from('families').delete().eq('id', id);
    if (error) throw error;
  },

  /* ================= EVENTS ================= */

  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async saveEvent(event: Event): Promise<Event> {
    const payload = { ...event };
    if (!payload.id) delete payload.id;

    const { data, error } = await supabase
      .from('events')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /* ================= DONATIONS ================= */

  async getDonations(): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async addDonation(donation: Donation): Promise<Donation> {
    const payload = { ...donation };
    delete payload.id;

    const { data, error } = await supabase
      .from('donations')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /* ================= USERS ================= */

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data ?? [];
  },

  async saveUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  /* ================= ANNOUNCEMENTS ================= */

  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async saveAnnouncement(a: Announcement): Promise<Announcement> {
    const payload = { ...a };
    if (!payload.id) delete payload.id;

    const { data, error } = await supabase
      .from('announcements')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  },

  /* ================= SETTINGS ================= */

  async getSettings(): Promise<ChurchSettings> {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    return data ?? DEFAULT_SETTINGS;
  },

  async saveSettings(settings: ChurchSettings) {
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, ...settings });

    if (error) throw error;
  },
};
