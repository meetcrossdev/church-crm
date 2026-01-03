
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

/* 
 * MAIN APPLICATION COMPONENT
 * Handles global authentication state and routing.
 */

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const initializationOccurred = useRef(false);

  useEffect(() => {
    /* Step 1: Validate Environment Configuration */
    const checkConfig = () => {
      const viteEnv = (import.meta as any).env;
      const url = process.env?.VITE_SUPABASE_URL || viteEnv?.VITE_SUPABASE_URL;
      const key = process.env?.VITE_SUPABASE_ANON_KEY || viteEnv?.VITE_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setConfigError('Missing Supabase credentials in environment variables.');
        return false;
      }
      return true;
    };

    if (!checkConfig()) {
      setLoading(false);
      return;
    }

    /* Step 2: Initialize Session */
    const performInitialAuth = async () => {
      if (initializationOccurred.current) return;
      initializationOccurred.current = true;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await storage.getCurrentUser();
          if (profile) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.error('Auth initialization failure:', err);
      } finally {
        setLoading(false);
      }
    };

    performInitialAuth();

    /* Step 3: Listen for Auth State Changes */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await storage.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    /* Step 4: Safety Timeout */
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  /* Error State Rendering */
  if (configError) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-red-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-red-100">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Setup Required</h1>
          <p className="text-slate-600 mb-6">{configError}</p>
        </div>
      </div>
    );
  }

  /* Loading State Rendering */
  if (loading) {
     return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Connecting to Meetcross Cloud...</p>
        </div>
     );
  }

  /* Login State Rendering */
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  /* Authenticated App Rendering */
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
