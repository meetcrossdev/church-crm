
import { useState, useEffect, useRef } from 'react';
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
  const isInitialized = useRef(false);

  useEffect(() => {
    // 1. Config Check
    const meta = import.meta as any;
    const supabaseUrl = meta.env?.VITE_SUPABASE_URL;
    const supabaseKey = meta.env?.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setConfigError("Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    // 2. Safety Fallback: Ensure loading screen eventually disappears
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization taking too long, forcing load finish.");
        setLoading(false);
      }
    }, 5000);

    // 3. Auth Listener & Initial Check
    const initAuth = async () => {
      if (isInitialized.current) return;
      
      try {
        // Get current session status immediately
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = await storage.getCurrentUser();
          setUser(profile);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
        isInitialized.current = true;
      }
    };

    initAuth();

    // Listen for state changes (Login, Logout, Session Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth Event: ${event}`);
      if (session) {
        const profile = await storage.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  if (configError) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-red-100">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Configuration Error</h1>
          <p className="text-slate-600 mb-6">{configError}</p>
        </div>
      </div>
    );
  }

  if (loading) {
     return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Connecting to Meetcross Cloud...</p>
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


