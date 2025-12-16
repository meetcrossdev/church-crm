import { Member, Family, Event, Donation, MemberStatus, EventType, FundType, UserRole, User, ChurchSettings, Announcement } from '../types';

const STORAGE_KEYS = {
  MEMBERS: 'churchcrm_members',
  FAMILIES: 'churchcrm_families',
  EVENTS: 'churchcrm_events',
  DONATIONS: 'churchcrm_donations',
  USERS: 'churchcrm_users',
  CURRENT_USER: 'churchcrm_current_user',
  SETTINGS: 'churchcrm_settings',
  ANNOUNCEMENTS: 'churchcrm_announcements'
};

// Seed Data
const SEED_MEMBERS: Member[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '555-0101', gender: 'Male', status: MemberStatus.ACTIVE, birthDate: '1980-05-15', address: '123 Maple St', photoUrl: 'https://picsum.photos/200/200?random=1', baptismDate: '2010-04-01', familyId: 'f1' },
  { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '555-0102', gender: 'Female', status: MemberStatus.ACTIVE, birthDate: '1982-08-20', address: '123 Maple St', photoUrl: 'https://picsum.photos/200/200?random=2', familyId: 'f1' },
  { id: '3', firstName: 'Michael', lastName: 'Smith', email: 'mike@example.com', phone: '555-0103', gender: 'Male', status: MemberStatus.VISITOR, birthDate: '1990-12-10', address: '456 Oak Ave', photoUrl: 'https://picsum.photos/200/200?random=3' },
  { id: '4', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com', phone: '555-0104', gender: 'Female', status: MemberStatus.INACTIVE, birthDate: '1985-03-22', address: '789 Pine Ln', photoUrl: 'https://picsum.photos/200/200?random=4' },
];

const SEED_FAMILIES: Family[] = [
    { id: 'f1', familyName: 'Doe Family', headOfFamilyId: '1', address: '123 Maple St' }
];

const SEED_EVENTS: Event[] = [
  { id: '1', title: 'Sunday Service', description: 'Weekly worship service', date: new Date().toISOString(), location: 'Main Sanctuary', type: EventType.SERVICE, attendanceCount: 2, attendeeIds: ['1', '2'] },
  { id: '2', title: 'Youth Meeting', description: 'Friday night youth gathering', date: new Date(Date.now() + 86400000 * 2).toISOString(), location: 'Youth Hall', type: EventType.MEETING },
  { id: '3', title: 'Midweek Bible Study', description: 'Study of the book of Romans', date: new Date(Date.now() - 86400000 * 7).toISOString(), location: 'Conference Room', type: EventType.MEETING, attendanceCount: 1, attendeeIds: ['1'] },
];

const SEED_DONATIONS: Donation[] = [
  { id: '1', memberId: '1', amount: 500, date: '2023-10-01', fund: FundType.TITHE, method: 'Transfer' },
  { id: '2', memberId: '2', amount: 200, date: '2023-10-05', fund: FundType.OFFERING, method: 'Cash' },
  { id: '3', memberId: '1', amount: 500, date: '2023-11-01', fund: FundType.TITHE, method: 'Transfer' },
  { id: '4', memberId: '3', amount: 50, date: '2023-11-02', fund: FundType.MISSIONS, method: 'Cash' },
];

const SEED_USERS: User[] = [
    {
        id: 'admin-1',
        name: 'Super Admin',
        email: 'meetcrossdev@gmail.com',
        role: UserRole.ADMIN,
        avatar: 'https://picsum.photos/100/100?random=admin',
        password: 'MeetcrossAi@@17' 
    }
];

const DEFAULT_SETTINGS: ChurchSettings = {
    name: 'Grace Community Church',
    address: '123 Faith Avenue, Cityville',
    currency: 'USD',
    email: 'contact@gracecommunity.com',
    phone: '(555) 123-4567'
};

class StorageService {
  private get<T>(key: string, seed: T[]): T[] {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data);
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // User / Auth
  getCurrentUser(): User | null {
    const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  }

  getUsers(): User[] {
      return this.get(STORAGE_KEYS.USERS, SEED_USERS);
  }

  saveUser(user: User): User {
      const users = this.getUsers();
      const index = users.findIndex(u => u.id === user.id);
      
      if (index >= 0) {
          // Keep existing password if not provided in update
          if (!user.password && users[index].password) {
              user.password = users[index].password;
          }
          users[index] = user;
      } else {
          user.id = Math.random().toString(36).substr(2, 9);
          if (!user.avatar) user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
          users.push(user);
      }
      this.set(STORAGE_KEYS.USERS, users);
      return user;
  }

  deleteUser(id: string) {
      const users = this.getUsers().filter(u => u.id !== id);
      this.set(STORAGE_KEYS.USERS, users);
  }

  login(email: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        // Don't store password in session
        const { password, ...safeUser } = user;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
        return safeUser as User;
    }
    return null;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Settings
  getSettings(): ChurchSettings {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if(!data) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
          return DEFAULT_SETTINGS;
      }
      return JSON.parse(data);
  }

  saveSettings(settings: ChurchSettings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Members
  getMembers(): Member[] { return this.get(STORAGE_KEYS.MEMBERS, SEED_MEMBERS); }
  saveMember(member: Member): Member {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      member.id = Math.random().toString(36).substr(2, 9);
      members.push(member);
    }
    this.set(STORAGE_KEYS.MEMBERS, members);
    return member;
  }
  deleteMember(id: string) {
    const members = this.getMembers().filter(m => m.id !== id);
    this.set(STORAGE_KEYS.MEMBERS, members);
  }

  // Families
  getFamilies(): Family[] { return this.get(STORAGE_KEYS.FAMILIES, SEED_FAMILIES); }
  saveFamily(family: Family): Family {
      const families = this.getFamilies();
      const index = families.findIndex(f => f.id === family.id);
      if(index >= 0) {
          families[index] = family;
      } else {
          family.id = Math.random().toString(36).substr(2, 9);
          families.push(family);
      }
      this.set(STORAGE_KEYS.FAMILIES, families);
      return family;
  }
  deleteFamily(id: string) {
      const families = this.getFamilies().filter(f => f.id !== id);
      this.set(STORAGE_KEYS.FAMILIES, families);
      
      // Remove family link from members
      const members = this.getMembers();
      let changed = false;
      const updatedMembers = members.map(m => {
          if(m.familyId === id) {
              changed = true;
              return { ...m, familyId: undefined };
          }
          return m;
      });
      if(changed) this.set(STORAGE_KEYS.MEMBERS, updatedMembers);
  }

  // Events
  getEvents(): Event[] { return this.get(STORAGE_KEYS.EVENTS, SEED_EVENTS); }
  saveEvent(event: Event): Event {
    const events = this.getEvents();
    if (!event.id) {
        event.id = Math.random().toString(36).substr(2, 9);
        events.push(event);
    } else {
        const idx = events.findIndex(e => e.id === event.id);
        if(idx >= 0) events[idx] = event;
    }
    this.set(STORAGE_KEYS.EVENTS, events);
    return event;
  }
  deleteEvent(id: string) {
      const events = this.getEvents().filter(e => e.id !== id);
      this.set(STORAGE_KEYS.EVENTS, events);
  }

  // Donations
  getDonations(): Donation[] { return this.get(STORAGE_KEYS.DONATIONS, SEED_DONATIONS); }
  addDonation(donation: Donation): Donation {
    const donations = this.getDonations();
    donation.id = Math.random().toString(36).substr(2, 9);
    donations.push(donation);
    this.set(STORAGE_KEYS.DONATIONS, donations);
    return donation;
  }

  // Announcements
  getAnnouncements(): Announcement[] { return this.get(STORAGE_KEYS.ANNOUNCEMENTS, []); }
  saveAnnouncement(announcement: Announcement): Announcement {
      const list = this.getAnnouncements();
      announcement.id = Math.random().toString(36).substr(2, 9);
      announcement.date = new Date().toISOString();
      list.push(announcement);
      this.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
      return announcement;
  }
  deleteAnnouncement(id: string) {
      const list = this.getAnnouncements().filter(a => a.id !== id);
      this.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }
}

export const storage = new StorageService();