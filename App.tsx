
import { useState, useEffect } from 'react';
// Split imports between core react-router and web-specific react-router-dom
import { Routes, Route, Navigate } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Families } from './pages/Families';
import { Giving } from './pages/Giving';
import { Events } from './pages/Events';
import { Attendance } from './pages/Attendance';
import { Settings } from './pages/Settings';
import { Announcements } from './pages/Announcements';
import { Login } from './pages/Login';
import { storage } from './services/storageService';
import { User } from './types';
import { supabase } from './services/supabase';
import { AlertTriangle } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase is actually configured
    // Fixed: Cast import.meta to any to resolve TypeScript 'Property env does not exist on type ImportMeta' error
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
    const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setConfigError("Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
      setLoading(false);
      return;
    }

    // Check initial session
    const checkUser = async () => {
      try {
        const currentUser = await storage.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const currentUser = await storage.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (configError) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-red-100">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Configuration Error</h1>
          <p className="text-slate-600 mb-6">{configError}</p>
          <div className="text-sm bg-slate-50 p-4 rounded-lg text-left text-slate-500 font-mono overflow-auto">
            1. Go to Vercel Project Settings<br/>
            2. Environment Variables<br/>
            3. Add VITE_SUPABASE_URL<br/>
            4. Add VITE_SUPABASE_ANON_KEY<br/>
            5. Re-deploy the project
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
     return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Connecting to Meetcross Cloud...</p>
        </div>
     );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={() => setUser(null)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/families" element={<Families />} />
          <Route path="/giving" element={<Giving />} />
          <Route path="/events" element={<Events />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
