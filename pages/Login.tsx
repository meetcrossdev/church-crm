import React, { useState } from 'react';
import { Church, AlertCircle } from 'lucide-react';
import { storage } from '../services/storageService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await storage.login(email, password);
      
      if (response.error) {
        setError(response.error.message);
        setLoading(false);
        return;
      }

      if (response.data.user) {
        // Fetch the detailed profile from the 'profiles' table after successful auth
        const userProfile = await storage.getCurrentUser();
        if (userProfile) {
          onLogin(userProfile);
        } else {
          setError('Authentication successful, but profile record was not found.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Password reset functionality is being developed. Check back soon.");
      setShowForgot(false);
  };

  if (showForgot) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-slate-500 mb-6">Enter your email to receive reset instructions.</p>
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                        Send Reset Link
                    </button>
                    <button type="button" onClick={() => setShowForgot(false)} className="w-full text-slate-500 py-2 hover:text-slate-700">
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4">
            <Church size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Meetcross CRM</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your church cloud</p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-indigo-600 hover:text-indigo-800">Forgot Password?</button>
            </div>
            <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
