
import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Calendar, Users, Search, X, CheckSquare } from 'lucide-react';
import { storage } from '../services/storageService';
import { Event, Member, MemberStatus } from '../types';

export const Attendance: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [memberSearch, setMemberSearch] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [e, m] = await Promise.all([
          storage.getEvents(),
          storage.getMembers()
        ]);
        setEvents(e.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setMembers(m.sort((a,b) => a.lastName.localeCompare(b.lastName)));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Computed Values
  const getAttendanceCount = (event: Event) => {
      return event.attendeeIds ? event.attendeeIds.length : (event.attendanceCount || 0);
  };

  const filteredMembers = members.filter(m => {
      const matchesSearch = 
        m.firstName.toLowerCase().includes(memberSearch.toLowerCase()) || 
        m.lastName.toLowerCase().includes(memberSearch.toLowerCase());
      const matchesStatus = showActiveOnly ? m.status !== MemberStatus.INACTIVE : true;
      return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleOpenModal = (event?: Event) => {
      const initialEventId = event ? event.id : (events.length > 0 ? events[0].id : '');
      setSelectedEventId(initialEventId);
      
      const existingEvent = events.find(e => e.id === initialEventId);
      if (existingEvent && existingEvent.attendeeIds) {
          setSelectedMemberIds(new Set(existingEvent.attendeeIds));
      } else {
          setSelectedMemberIds(new Set());
      }
      
      setMemberSearch('');
      setIsModalOpen(true);
  };

  const handleEventSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newId = e.target.value;
      setSelectedEventId(newId);
      const ev = events.find(ev => ev.id === newId);
      if (ev && ev.attendeeIds) {
          setSelectedMemberIds(new Set(ev.attendeeIds));
      } else {
          setSelectedMemberIds(new Set());
      }
  };

  const toggleMember = (id: string) => {
      const newSet = new Set(selectedMemberIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedMemberIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedMemberIds.size === filteredMembers.length) {
          setSelectedMemberIds(new Set());
      } else {
          const newSet = new Set(selectedMemberIds);
          filteredMembers.forEach(m => newSet.add(m.id));
          setSelectedMemberIds(newSet);
      }
  };

  const handleSave = async () => {
      const eventIndex = events.findIndex(e => e.id === selectedEventId);
      if (eventIndex >= 0) {
          const updatedEvent = { ...events[eventIndex] };
          updatedEvent.attendeeIds = Array.from(selectedMemberIds);
          updatedEvent.attendanceCount = updatedEvent.attendeeIds.length;
          
          await storage.saveEvent(updatedEvent);
          const updated = await storage.getEvents();
          setEvents(updated.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          setIsModalOpen(false);
      }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500">Track member participation in events</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ClipboardCheck size={20} className="mr-2" />
          Mark Attendance
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Event Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Event Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Attendees</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center text-sm text-slate-900">
                         <Calendar size={16} className="mr-2 text-slate-400" />
                         {new Date(event.date).toLocaleDateString()}
                     </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                      {event.title}
                  </td>
                  <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                          {event.type}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
                          <Users size={14} className="mr-1.5" />
                          {getAttendanceCount(event)}
                      </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenModal(event)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                          View / Edit
                      </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No events found. Create an event to start tracking attendance.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Mark Attendance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Event</label>
                    <select 
                        value={selectedEventId} 
                        onChange={handleEventSelectionChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {events.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.title} - {new Date(e.date).toLocaleDateString()} {new Date(e.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </option>
                        ))}
                    </select>
                </div>

                <hr className="border-slate-100 mb-4" />

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search members..." 
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer select-none border border-slate-200 px-3 rounded-lg hover:bg-slate-50">
                        <input 
                            type="checkbox" 
                            checked={showActiveOnly} 
                            onChange={(e) => setShowActiveOnly(e.target.checked)}
                            className="rounded text-indigo-600" 
                        />
                        <span>Active Only</span>
                    </label>
                </div>

                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-500">
                        {selectedMemberIds.size} Selected
                    </span>
                    <button 
                        onClick={toggleSelectAll}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        {selectedMemberIds.size === filteredMembers.length ? 'Deselect All' : 'Select All Visible'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2 space-y-1">
                    {filteredMembers.map(m => (
                        <div 
                            key={m.id} 
                            onClick={() => toggleMember(m.id)}
                            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedMemberIds.has(m.id) ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-transparent hover:border-slate-200'}`}
                        >
                            <div className={`flex-shrink-0 mr-3 w-5 h-5 flex items-center justify-center border rounded ${selectedMemberIds.has(m.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                {selectedMemberIds.has(m.id) && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <img src={m.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover mr-3 border border-slate-100" />
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${selectedMemberIds.has(m.id) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {m.firstName} {m.lastName}
                                </p>
                                <p className="text-xs text-slate-500">{m.status}</p>
                            </div>
                        </div>
                    ))}
                    {filteredMembers.length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-500">No members found.</div>
                    )}
                </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                    Save Attendance
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
