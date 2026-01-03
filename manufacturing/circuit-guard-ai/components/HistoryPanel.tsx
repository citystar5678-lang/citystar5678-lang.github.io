
import React from 'react';
import { InspectionResult } from '../types';
import { Calendar, Tag, Info, ChevronRight, FileText } from 'lucide-react';

interface Props {
  history: InspectionResult[];
}

const HistoryPanel: React.FC<Props> = ({ history }) => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white">Inspection History</h2>
        <p className="text-slate-400 mt-2">Historical audit log for all visual inspection sessions.</p>
      </header>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <FileText className="w-16 h-16 text-slate-700 mb-6" />
          <h3 className="text-xl font-semibold text-slate-400">No Records Found</h3>
          <p className="text-slate-600 mt-2">Start a new inspection to populate the audit trail.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center group hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 mr-6 flex-shrink-0">
                <img src={item.image} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <Calendar size={14} />
                    <span className="text-xs font-medium uppercase tracking-wider">Timestamp</span>
                  </div>
                  <p className="font-mono text-sm text-slate-200">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <Tag size={14} />
                    <span className="text-xs font-medium uppercase tracking-wider">Status</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${item.status === 'Pass' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="font-bold text-sm text-slate-200">{item.status}</span>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <Info size={14} />
                    <span className="text-xs font-medium uppercase tracking-wider">Summary</span>
                  </div>
                  <p className="text-sm text-slate-400 truncate max-w-xs">{item.summary}</p>
                </div>
              </div>

              <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="text-blue-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
