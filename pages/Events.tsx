import React, { useState } from 'react';
import { MapPin, Clock, Plus, X, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storageService';
import { Event, EventType } from '../types';

export const Events: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(storage.getEvents().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newEvent: Event = {
          id: '',
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          location: formData.get('location') as string,
          date: formData.get('date') as string,
          type: formData.get('type') as EventType,
          attendeeIds: [] // Initialize with empty list
      };
      
      storage.saveEvent(newEvent);
      setEvents(storage.getEvents().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events Schedule</h1>
          <p className="text-slate-500">Manage church services and meetings</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map(event => (
            <div key={event.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 
                            ${event.type === EventType.SERVICE ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                            {event.type}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                    </div>
                    <div className="text-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                        <span className="block text-xs font-bold text-slate-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="block text-xl font-bold text-slate-900">{new Date(event.date).getDate()}</span>
                    </div>
                </div>
                
                <p className="text-slate-600 mb-6 flex-grow">{event.description}</p>
                
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4">
                        <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="flex items-center">
                            <MapPin size={16} className="mr-1" />
                            {event.location}
                        </div>
                    </div>
                    
                    {/* Link to Attendance if event has passed or is today */}
                    {new Date(event.date) <= new Date() && (
                         <div className="mt-2">
                             <button 
                                onClick={() => navigate('/attendance')} 
                                className="w-full text-sm flex justify-center items-center py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                             >
                                 <Users size={16} className="mr-2" />
                                 View Attendance
                                 <ArrowRight size={16} className="ml-1" />
                             </button>
                         </div>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Add New Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                 <input required name="title" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <select name="type" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                          {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                      <input required name="date" type="datetime-local" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                 <input required name="location" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required name="description" rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
