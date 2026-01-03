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
  const isInitialCheckDone = useRef(false);

  useEffect(() => {
    // 1. Config Check using process.env
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setConfigError("Missing Supabase configuration in environment variables.");
      setLoading(false);
      return;
    }

    // 2. Auth Initialization
    const initAuth = async () => {
      if (isInitialCheckDone.current) return;
      
      try {
        // Force a check of the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          const profile = await storage.getCurrentUser();
          setUser(profile);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
        isInitialCheckDone.current = true;
      }
    };

    initAuth();

    // 3. Listen for state changes (Login, Logout, Session Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase Auth Event: ${event}`);
      
      if (session) {
        const profile = await storage.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
      
      // Ensure loading is cleared regardless of event
      setLoading(false);
    });

    // Safety fallback: if we're still loading after 4 seconds, force it off
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

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
          <h1 className="text-xl font-bold text-slate-900 mb-2" id="config-error-title">Configuration Error</h1>
          <p className="text-slate-600 mb-6">{configError}</p>
          <div className="text-xs bg-slate-50 p-4 rounded-lg text-left text-slate-500 font-mono overflow-auto">
            Please verify that your environment variables are correctly named:<br/>
            - VITE_SUPABASE_URL<br/>
            - VITE_SUPABASE_ANON_KEY
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
     return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50" aria-live="polite">
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
