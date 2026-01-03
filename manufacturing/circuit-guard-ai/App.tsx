
import React, { useState, useEffect } from 'react';
import { ViewMode, InspectionResult, Statistics } from './types';
import InspectionPanel from './components/InspectionPanel';
import Dashboard from './components/Dashboard';
import HistoryPanel from './components/HistoryPanel';
import { 
  Activity, 
  LayoutDashboard, 
  History as HistoryIcon, 
  Cpu, 
  AlertTriangle, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.INSPECTION);
  const [history, setHistory] = useState<InspectionResult[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const stats: Statistics = {
    totalInspected: history.length,
    passCount: history.filter(h => h.status === 'Pass').length,
    failCount: history.filter(h => h.status === 'Fail').length,
    defectTypes: history.reduce((acc, h) => {
      h.defects.forEach(d => {
        acc[d.type] = (acc[d.type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  };

  const handleNewResult = (result: InspectionResult) => {
    setHistory(prev => [result, ...prev]);
  };

  const NavItem = ({ icon: Icon, label, target }: { icon: any, label: string, target: ViewMode }) => (
    <button
      onClick={() => {
        setView(target);
        setSidebarOpen(false);
      }}
      className={`flex items-center space-x-3 w-full p-4 rounded-xl transition-all ${
        view === target 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'hover:bg-slate-800 text-slate-400'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900/50 border-r border-slate-800/50 p-6">
        <div className="flex items-center space-x-3 mb-12 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Cpu className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CircuitGuard</h1>
            <p className="text-xs text-slate-500 font-mono">VISION ANALYTICS v1.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={Activity} label="Live Inspection" target={ViewMode.INSPECTION} />
          <NavItem icon={LayoutDashboard} label="Defect Dashboard" target={ViewMode.DASHBOARD} />
          <NavItem icon={HistoryIcon} label="Inspection History" target={ViewMode.HISTORY} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">System Ready</span>
            </div>
            <span className="text-[10px] font-mono text-slate-600 uppercase">GPU Enc: ON</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-6 z-50 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Cpu className="text-blue-500" size={20} />
          <span className="font-bold">CircuitGuard</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400">
          <Menu size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto mt-16 md:mt-0 p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto h-full">
          {view === ViewMode.INSPECTION && <InspectionPanel onResult={handleNewResult} />}
          {view === ViewMode.DASHBOARD && <Dashboard stats={stats} />}
          {view === ViewMode.HISTORY && <HistoryPanel history={history} />}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] md:hidden">
          <div className="bg-slate-900 w-3/4 h-full p-6 animate-in slide-in-from-left duration-200">
            <div className="flex justify-between items-center mb-12">
              <span className="font-bold text-xl">Menu</span>
              <button onClick={() => setSidebarOpen(false)}><X /></button>
            </div>
            <nav className="space-y-4">
              <NavItem icon={Activity} label="Live Inspection" target={ViewMode.INSPECTION} />
              <NavItem icon={LayoutDashboard} label="Defect Dashboard" target={ViewMode.DASHBOARD} />
              <NavItem icon={HistoryIcon} label="Inspection History" target={ViewMode.HISTORY} />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
