export enum UserRole {
  ADMIN = 'Admin',
  PASTOR = 'Pastor',
  TREASURER = 'Treasurer',
  STAFF = 'Staff'
}

export enum MemberStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  VISITOR = 'Visitor'
}

export enum EventType {
  SERVICE = 'Service',
  MEETING = 'Meeting',
  PROGRAM = 'Program'
}

export enum FundType {
  TITHE = 'Tithe',
  OFFERING = 'Offering',
  BUILDING = 'Building Fund',
  MISSIONS = 'Missions'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string; // For mock auth
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female';
  status: MemberStatus;
  birthDate: string;
  address: string;
  familyId?: string;
  photoUrl?: string;
  baptismDate?: string;
  notes?: string;
}

export interface Family {
  id: string;
  familyName: string;
  headOfFamilyId?: string; // Links to a Member
  address: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: EventType;
  attendanceCount?: number;
  attendeeIds?: string[]; // List of member IDs present
}

export interface Donation {
  id: string;
  memberId?: string; // Optional (anonymous)
  amount: number;
  date: string;
  fund: FundType;
  method: 'Cash' | 'Cheque' | 'Transfer';
  notes?: string;
}

export interface ChurchSettings {
  name: string;
  address: string;
  currency: string;
  email: string;
  phone: string;
  logoUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  target: 'All' | 'Individual';
  targetMemberId?: string;
  author: string;
  sentViaEmail?: boolean;
}