import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = storage.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  if (loading) {
     return <div className="h-screen w-screen flex items-center justify-center bg-slate-50">Loading...</div>;
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
