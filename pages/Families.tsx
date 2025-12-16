import React, { useState } from 'react';
import { Plus, Users, MapPin, Edit2, Trash2, X, Search } from 'lucide-react';
import { storage } from '../services/storageService';
import { Family, Member } from '../types';

export const Families: React.FC = () => {
  const [families, setFamilies] = useState<Family[]>(storage.getFamilies());
  const [members, setMembers] = useState<Member[]>(storage.getMembers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getHeadName = (id?: string) => {
    if(!id) return 'Unknown';
    const m = members.find(m => m.id === id);
    return m ? `${m.firstName} ${m.lastName}` : 'Unknown';
  };

  const getFamilyMembers = (familyId: string) => {
      return members.filter(m => m.familyId === familyId);
  };

  const handleDelete = (id: string) => {
      if(confirm('Are you sure? This will unlink all members from this family.')) {
          storage.deleteFamily(id);
          setFamilies(storage.getFamilies());
          setMembers(storage.getMembers()); // Refresh members to show unlinked status if needed elsewhere
      }
  };

  const openModal = (family?: Family) => {
      setEditingFamily(family || null);
      setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newFamily: Family = {
          id: editingFamily?.id || '',
          familyName: formData.get('familyName') as string,
          address: formData.get('address') as string,
          headOfFamilyId: formData.get('headOfFamilyId') as string
      };

      const savedFamily = storage.saveFamily(newFamily);

      // Handle Member assignments
      const selectedMemberIds = Array.from(formData.getAll('members') as string[]);
      
      // Update members: 
      // 1. Clear familyId for members previously in this family but not selected now (only if editing)
      // 2. Set familyId for selected members
      // Note: In a real app, this logic might be more complex or handled by backend.
      // For this mock, we'll just update the selected members.
      
      // Simple approach: Get all members, if their ID is in selectedMemberIds, set familyId. 
      // If we are editing, we should ideally unset those removed. 
      // For simplicity in this mock: We loop all members. If they are in the selected list, set familyId.
      // If they were in this family but not selected, unset familyId.
      
      const allMembers = storage.getMembers();
      allMembers.forEach(m => {
          if (selectedMemberIds.includes(m.id)) {
              m.familyId = savedFamily.id;
              storage.saveMember(m);
          } else if (m.familyId === savedFamily.id) {
              m.familyId = undefined;
              storage.saveMember(m);
          }
      });

      setFamilies(storage.getFamilies());
      setMembers(storage.getMembers());
      setIsModalOpen(false);
      setEditingFamily(null);
  };

  const filteredFamilies = families.filter(f => 
    f.familyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getHeadName(f.headOfFamilyId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Families</h1>
          <p className="text-slate-500">Manage family units and households</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Family
        </button>
      </div>

      <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search families..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFamilies.map(family => (
              <div key={family.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-colors">
                  <div className="p-6 border-b border-slate-50">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{family.familyName}</h3>
                          <div className="flex gap-1">
                              <button onClick={() => openModal(family)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(family.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                      </div>
                      <p className="text-sm text-slate-500 flex items-center mb-1">
                          <Users size={14} className="mr-1" />
                          Head: <span className="font-medium text-slate-700 ml-1">{getHeadName(family.headOfFamilyId)}</span>
                      </p>
                      <p className="text-sm text-slate-500 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {family.address}
                      </p>
                  </div>
                  <div className="px-6 py-4 bg-slate-50">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Family Members</p>
                      <div className="flex flex-wrap gap-2">
                          {getFamilyMembers(family.id).map(m => (
                              <span key={m.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700">
                                  {m.firstName}
                              </span>
                          ))}
                          {getFamilyMembers(family.id).length === 0 && <span className="text-xs text-slate-400 italic">No members assigned</span>}
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">{editingFamily ? 'Edit Family' : 'Add New Family'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Family Name</label>
                  <input required name="familyName" defaultValue={editingFamily?.familyName} placeholder="e.g. Smith Family" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Head of Family</label>
                  <select name="headOfFamilyId" defaultValue={editingFamily?.headOfFamilyId} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">Select Head...</option>
                      {members.map(m => (
                          <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                  </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea required name="address" defaultValue={editingFamily?.address} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign Members</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2 space-y-2">
                      {members.map(m => (
                          <label key={m.id} className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                name="members" 
                                value={m.id} 
                                defaultChecked={m.familyId === editingFamily?.id}
                                className="rounded text-indigo-600 focus:ring-indigo-500" 
                              />
                              <span className="text-sm text-slate-700">{m.firstName} {m.lastName}</span>
                          </label>
                      ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Check members to add to this family.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Family</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};