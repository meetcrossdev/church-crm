
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
  const isInitStarted = useRef(false);

  useEffect(() => {
    // 1. Config Check
    const getEnv = (key: string): string => {
      const env = (import.meta as any).env;
      return (process.env?.[key] || env?.[key]) || '';
    };

    const supabaseUrl = getEnv('VITE_SUPABASE_URL');
    const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      setConfigError("Missing Supabase configuration. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
      setLoading(false);
      return;
    }

    // 2. Auth Initialization Logic
    const initAuth = async () => {
      if (isInitStarted.current) return;
      isInitStarted.current = true;
      
      try {
        // Step A: Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session fetch error:", sessionError);
        }

        if (session?.user) {
          const profile = await storage.getCurrentUser();
          if (profile) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.error("Critical Auth Init Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 3. Listen for state changes (Login, Logout, Session Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase Event: ${event}`);
      
      if (session?.user) {
        const profile = await storage.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // 4. Safety Fallback: Never let the app hang forever
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
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
          <div className="text-[10px] bg-slate-50 p-3 rounded-lg text-left text-slate-400 font-mono break-all">
            Expected env keys:<br/>
            - VITE_SUPABASE_URL<br/>
            - VITE_SUPABASE_ANON_KEY
          </div>
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
