
import React, { useState, useEffect } from 'react';
import { Save, User as UserIcon, Building, Plus, Trash2, Edit2, X, Upload, AlertCircle } from 'lucide-react';
import { storage } from '../services/storageService';
import { ChurchSettings, User, UserRole } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Profile Logo State
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userAvatarPreview, setUserAvatarPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [s, u, curr] = await Promise.all([
          storage.getSettings(),
          storage.getUsers(),
          storage.getCurrentUser()
        ]);
        setSettings(s);
        setUsers(u);
        setCurrentUser(curr);
        setLogoPreview(s.logoUrl);
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setLogoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUserAvatarPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMsg('');
      const formData = new FormData(e.currentTarget);
      const newSettings: ChurchSettings = {
          name: formData.get('name') as string,
          address: formData.get('address') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          currency: formData.get('currency') as string,
          logoUrl: logoPreview || settings?.logoUrl
      };

      try {
        await storage.saveSettings(newSettings);
        setSettings(newSettings);
        setSuccessMsg('Settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err: any) {
        setErrorMsg('Failed to save settings: ' + err.message);
      }
  };

  const handleDeleteUser = async (id: string) => {
      if (id === currentUser?.id) {
          alert("You cannot delete yourself.");
          return;
      }
      if (confirm('Are you sure you want to delete this user?')) {
          try {
            await storage.deleteUser(id);
            const updated = await storage.getUsers();
            setUsers(updated);
          } catch (err: any) {
            alert('Error deleting user: ' + err.message);
          }
      }
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      const newUser: User = {
          id: editingUser?.id || '',
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          role: formData.get('role') as UserRole,
          password: formData.get('password') as string || undefined,
          avatar: userAvatarPreview || editingUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('name') as string)}&background=random`
      };

      try {
        await storage.saveUser(newUser);
        const updated = await storage.getUsers();
        setUsers(updated);
        setIsUserModalOpen(false);
        setEditingUser(null);
        setUserAvatarPreview(undefined);
      } catch (err: any) {
        alert('Error saving user: ' + err.message);
      }
  };

  const openUserModal = (user?: User) => {
      setEditingUser(user || null);
      setUserAvatarPreview(user?.avatar);
      setIsUserModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure your CRM and manage users</p>
      </div>

      <div className="flex space-x-4 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
              Church Profile
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
              User Management
          </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-100">
          <AlertCircle size={20} className="mr-2" />
          {errorMsg}
        </div>
      )}

      {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Building className="mr-2" size={20} />
                  Organization Details
              </h2>
              
              <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                      <div className="relative group">
                          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                              {logoPreview ? (
                                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                              ) : (
                                  <span className="text-xs text-slate-400 text-center px-1">Upload Logo</span>
                              )}
                          </div>
                          <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg">
                              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                              <Upload className="text-white opacity-0 group-hover:opacity-100" size={20} />
                          </label>
                      </div>
                      <div className="text-sm text-slate-500">
                          <p className="font-medium text-slate-700">Church Logo</p>
                          <p>Recommended size: 200x200px. PNG or JPG.</p>
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Church Name</label>
                      <input required name="name" defaultValue={settings?.name || ''} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                      <textarea required name="address" defaultValue={settings?.address || ''} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                          <input required name="email" defaultValue={settings?.email || ''} type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                          <input required name="phone" defaultValue={settings?.phone || ''} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                  </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol</label>
                      <input required name="currency" defaultValue={settings?.currency || '$'} type="text" className="w-full md:w-1/3 px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                      {successMsg && <span className="text-emerald-600 text-sm font-medium animate-fade-in">{successMsg}</span>}
                      <button type="submit" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ml-auto">
                          <Save size={18} className="mr-2" />
                          Save Changes
                      </button>
                  </div>
              </form>
          </div>
      )}

      {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                   <h2 className="text-lg font-bold text-slate-900 flex items-center">
                       <UserIcon className="mr-2" size={20} />
                       System Users
                   </h2>
                   <button 
                    onClick={() => openUserModal()}
                    className="flex items-center text-sm bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                   >
                       <Plus size={16} className="mr-2" /> Add User
                   </button>
               </div>
               <div className="overflow-x-auto">
                   <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 overflow-hidden mr-3">
                                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                        </div>
                                        <span className="text-slate-900 font-medium">{user.name}</span>
                                        {user.id === currentUser?.id && <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">You</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{user.role}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openUserModal(user)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                                            {user.id !== currentUser?.id && (
                                                <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                   </table>
               </div>
          </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="flex justify-center mb-4">
                  <div className="relative">
                      <img 
                        src={userAvatarPreview || editingUser?.avatar || "https://ui-avatars.com/api/?name=User&background=f1f5f9"} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                        alt="User Preview"
                      />
                      <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-sm">
                          <Upload size={14} />
                          <input type="file" className="hidden" accept="image/*" onChange={handleUserAvatarChange} />
                      </label>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required name="name" defaultValue={editingUser?.name} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input required name="email" defaultValue={editingUser?.email} type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select name="role" defaultValue={editingUser?.role || UserRole.STAFF} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                      {Object.values(UserRole).map(role => (
                          <option key={role} value={role}>{role}</option>
                      ))}
                  </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
