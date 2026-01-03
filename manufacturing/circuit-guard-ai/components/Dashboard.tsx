
import React from 'react';
import { Statistics } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { TrendingUp, Users, ShieldCheck, Activity } from 'lucide-react';

interface Props {
  stats: Statistics;
}

const Dashboard: React.FC<Props> = ({ stats }) => {
  const defectData = Object.entries(stats.defectTypes).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];

  const passRate = stats.totalInspected > 0 
    ? Math.round((stats.passCount / stats.totalInspected) * 100) 
    : 0;

  const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
      <div className={`p-3 rounded-2xl w-fit mb-6 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-4xl font-bold">{value}</h3>
        {sub && <span className="text-slate-500 font-medium">{sub}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <p className="text-slate-400 mt-2">Aggregate performance metrics across current production batch.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Activity} label="Total Throughput" value={stats.totalInspected} sub="Units" color="bg-blue-600" />
        <StatCard icon={ShieldCheck} label="Yield Rate" value={passRate} sub="%" color="bg-emerald-600" />
        <StatCard icon={TrendingUp} label="Failed Inspection" value={stats.failCount} sub="Units" color="bg-red-600" />
        <StatCard icon={Users} label="Defect Density" value={Object.keys(stats.defectTypes).length} sub="Types" color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-[450px]">
          <h4 className="text-xl font-bold mb-8">Defect Distribution</h4>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={defectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                cursor={{ fill: '#1e293b' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-[450px]">
          <h4 className="text-xl font-bold mb-8">Top Failure Vectors</h4>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={defectData}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="value"
              >
                {defectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {defectData.map((d, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-slate-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
