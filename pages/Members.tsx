
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, Upload } from 'lucide-react';
import { storage } from '../services/storageService';
import { Member, MemberStatus } from '../types';

export const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);

  const loadMembersData = async () => {
    setLoading(true);
    try {
      const data = await storage.getMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembersData();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = 
        member.firstName.toLowerCase().includes(search.toLowerCase()) ||
        member.lastName.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await storage.deleteMember(id);
        await loadMembersData();
      } catch (error) {
        console.error("Failed to delete member", error);
        alert("Error deleting member.");
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPhotoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMember: Member = {
      id: editingMember?.id || '',
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      gender: formData.get('gender') as 'Male' | 'Female',
      status: formData.get('status') as MemberStatus,
      birthDate: formData.get('birthDate') as string,
      address: formData.get('address') as string,
      photoUrl: photoPreview || editingMember?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('firstName') as string)}&background=random`,
      baptismDate: (formData.get('baptismDate') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
      familyId: editingMember?.familyId
    };

    try {
      await storage.saveMember(newMember);
      await loadMembersData();
      setIsModalOpen(false);
      setEditingMember(null);
      setPhotoPreview(undefined);
    } catch (error) {
      console.error("Failed to save member", error);
      alert("Error saving member details.");
    }
  };

  const openModal = (member?: Member) => {
    setEditingMember(member || null);
    setPhotoPreview(member?.photoUrl);
    setIsModalOpen(true);
  };

  if (loading && members.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-slate-500">Manage your church directory</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Member
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-slate-400" />
          <select 
            className="border border-slate-200 rounded-lg px-4 py-2 focus:outline-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value={MemberStatus.ACTIVE}>{MemberStatus.ACTIVE}</option>
            <option value={MemberStatus.INACTIVE}>{MemberStatus.INACTIVE}</option>
            <option value={MemberStatus.VISITOR}>{MemberStatus.VISITOR}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Baptism</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.firstName)}&background=random`} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div className="ml-3">
                        <p className="font-medium text-slate-900">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-slate-500">{member.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{member.email}</p>
                    <p className="text-xs text-slate-500">{member.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                      ${member.status === MemberStatus.ACTIVE ? 'bg-green-100 text-green-700' : 
                        member.status === MemberStatus.VISITOR ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {member.baptismDate ? new Date(member.baptismDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal(member)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(member.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex justify-center mb-4">
                  <div className="relative">
                      <img 
                        src={photoPreview || "https://via.placeholder.com/100"} 
                        className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                        alt="Preview"
                      />
                      <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-sm">
                          <Upload size={14} />
                          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                      </label>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input required name="firstName" defaultValue={editingMember?.firstName} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input required name="lastName" defaultValue={editingMember?.lastName} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input required name="email" defaultValue={editingMember?.email} type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input required name="phone" defaultValue={editingMember?.phone} type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select name="gender" defaultValue={editingMember?.gender || 'Male'} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Birth Date</label>
                   <input required name="birthDate" defaultValue={editingMember?.birthDate} type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select name="status" defaultValue={editingMember?.status || MemberStatus.VISITOR} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500">
                    <option value={MemberStatus.ACTIVE}>{MemberStatus.ACTIVE}</option>
                    <option value={MemberStatus.INACTIVE}>{MemberStatus.INACTIVE}</option>
                    <option value={MemberStatus.VISITOR}>{MemberStatus.VISITOR}</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Baptism Date</label>
                   <input name="baptismDate" defaultValue={editingMember?.baptismDate} type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea required name="address" defaultValue={editingMember?.address} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

