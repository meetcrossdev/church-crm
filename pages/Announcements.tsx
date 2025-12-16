import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Send, X, User as UserIcon, Users, Mail } from 'lucide-react';
import { storage } from '../services/storageService';
import { Announcement, Member } from '../types';

export const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(storage.getAnnouncements().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const [members] = useState<Member[]>(storage.getMembers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetType, setTargetType] = useState<'All' | 'Individual'>('All');
  const [sendEmail, setSendEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const currentUser = storage.getCurrentUser();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (sendEmail) {
        setIsSending(true);
        // Simulate API call to email service
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSending(false);
        alert("Announcements sent to recipients via Email!");
    }

    const newAnnouncement: Announcement = {
      id: '',
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      date: new Date().toISOString(),
      target: targetType,
      targetMemberId: targetType === 'Individual' ? formData.get('targetMemberId') as string : undefined,
      author: currentUser?.name || 'Admin',
      sentViaEmail: sendEmail
    };

    storage.saveAnnouncement(newAnnouncement);
    setAnnouncements(storage.getAnnouncements().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsModalOpen(false);
    setTargetType('All');
    setSendEmail(false);
  };

  const handleDelete = (id: string) => {
    if(confirm('Delete this announcement?')) {
        storage.deleteAnnouncement(id);
        setAnnouncements(storage.getAnnouncements().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const getRecipientName = (a: Announcement) => {
      if (a.target === 'All') return 'All Members';
      const m = members.find(m => m.id === a.targetMemberId);
      return m ? `${m.firstName} ${m.lastName}` : 'Unknown Member';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500">Send updates to your congregation</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
          {announcements.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Megaphone className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">No announcements yet</h3>
                  <p className="text-slate-500 mt-1">Create your first announcement to reach your members.</p>
              </div>
          )}

          {announcements.map((a) => (
              <div key={a.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${a.target === 'All' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {a.target === 'All' ? <Users size={20} /> : <UserIcon size={20} />}
                          </div>
                          <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-900">{a.title}</h3>
                                {a.sentViaEmail && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        <Mail size={12} className="mr-1" /> Emailed
                                    </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                  To: <span className="font-medium">{getRecipientName(a)}</span> • {new Date(a.date).toLocaleString()}
                              </p>
                          </div>
                      </div>
                      <button onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 size={18} />
                      </button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm whitespace-pre-wrap">
                      {a.message}
                  </div>
                  <div className="mt-3 flex items-center justify-end text-xs text-slate-400">
                      Sent by {a.author}
                  </div>
              </div>
          ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">New Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input required name="title" placeholder="e.g. Service Time Change" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Audience</label>
                  <div className="flex space-x-4 mb-3">
                      <label className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer transition-colors ${targetType === 'All' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
                          <input type="radio" className="hidden" name="target" value="All" checked={targetType === 'All'} onChange={() => setTargetType('All')} />
                          <Users size={16} className="mr-2" /> All Members
                      </label>
                      <label className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer transition-colors ${targetType === 'Individual' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>
                          <input type="radio" className="hidden" name="target" value="Individual" checked={targetType === 'Individual'} onChange={() => setTargetType('Individual')} />
                          <UserIcon size={16} className="mr-2" /> Individual
                      </label>
                  </div>
                  
                  {targetType === 'Individual' && (
                      <select required name="targetMemberId" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                          <option value="">Select Member...</option>
                          {members.map(m => (
                              <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</option>
                          ))}
                      </select>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea required name="message" rows={5} placeholder="Write your announcement here..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <input 
                    type="checkbox" 
                    id="sendEmail" 
                    checked={sendEmail} 
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sendEmail" className="text-sm text-slate-700 flex items-center">
                      <Mail size={16} className="mr-2 text-slate-500" />
                      Send copy via email to recipients
                  </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button 
                    type="submit" 
                    disabled={isSending}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSending ? (
                        <span>Sending...</span>
                    ) : (
                        <>
                            <Send size={16} className="mr-2" /> Publish
                        </>
                    )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};