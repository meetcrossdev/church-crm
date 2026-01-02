
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { storage } from '../services/storageService';
import { Member, Event, Donation, MemberStatus } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, e, d] = await Promise.all([
          storage.getMembers(),
          storage.getEvents(),
          storage.getDonations()
        ]);
        setMembers(m);
        setEvents(e);
        setDonations(d);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Metrics
  const metrics = useMemo(() => {
    if (loading) return null;

    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE).length;
    const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
    
    // Calculate Average Attendance from past events that have attendance recorded
    const pastEventsWithAttendance = events.filter(e => (e.attendanceCount !== undefined || (e.attendeeIds && e.attendeeIds.length > 0)) && new Date(e.date) <= new Date());
    const totalAttendance = pastEventsWithAttendance.reduce((sum, e) => {
        const count = e.attendeeIds ? e.attendeeIds.length : (e.attendanceCount || 0);
        return sum + count;
    }, 0);
    
    const avgAttendance = pastEventsWithAttendance.length > 0 
      ? Math.round(totalAttendance / pastEventsWithAttendance.length) 
      : 0;

    // Calculate current month giving
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyGiving = donations
      .filter(d => {
        const date = new Date(d.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, d) => sum + d.amount, 0);

    // Chart Data Preparation
    const givingData = (() => {
      const data: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for(let i = 5; i >= 0; i--) {
         const d = new Date();
         d.setMonth(d.getMonth() - i);
         const key = `${months[d.getMonth()]}`;
         data[key] = 0;
      }

      donations.forEach(d => {
        const date = new Date(d.date);
        const key = months[date.getMonth()];
        if (data[key] !== undefined) {
          data[key] += d.amount;
        }
      });

      return Object.keys(data).map(name => ({ name, amount: data[name] }));
    })();

    const memberGrowthData = [
      { name: 'Jan', count: Math.max(0, totalMembers - 5) },
      { name: 'Feb', count: Math.max(0, totalMembers - 4) },
      { name: 'Mar', count: Math.max(0, totalMembers - 3) },
      { name: 'Apr', count: Math.max(0, totalMembers - 2) },
      { name: 'May', count: Math.max(0, totalMembers - 1) },
      { name: 'Jun', count: totalMembers },
    ];

    return {
      totalMembers,
      activeMembers,
      upcomingEvents,
      avgAttendance,
      monthlyGiving,
      givingData,
      memberGrowthData
    };
  }, [loading, members, events, donations]);

  if (loading || !metrics) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back to Meetcross CRM overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Members" 
          value={metrics.totalMembers} 
          subValue={`${metrics.activeMembers} Active`}
          icon={Users} 
          color="blue" 
          onClick={() => navigate('/members')}
        />
        <StatsCard 
          title="Monthly Giving" 
          value={`$${metrics.monthlyGiving.toLocaleString()}`} 
          subValue="Current Month"
          icon={DollarSign} 
          color="emerald" 
          onClick={() => navigate('/giving')}
        />
        <StatsCard 
          title="Upcoming Events" 
          value={metrics.upcomingEvents} 
          subValue="Next 30 Days"
          icon={Calendar} 
          color="purple" 
          onClick={() => navigate('/events')}
        />
        <StatsCard 
          title="Avg. Attendance" 
          value={metrics.avgAttendance} 
          subValue="Past Events"
          icon={TrendingUp} 
          color="orange" 
          onClick={() => navigate('/attendance')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Giving Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Giving Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.givingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Growth Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Member Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.memberGrowthData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'purple' | 'orange';
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon: Icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:border-indigo-200' : ''}`}
    >
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{subValue}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};
