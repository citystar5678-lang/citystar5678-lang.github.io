
import React, { useState, useRef, useEffect } from 'react';
import { analyzePCB, searchReference } from '../services/gemini';
import { InspectionResult, Defect } from '../types';
import { 
  Camera, 
  Upload, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  ShieldAlert,
  ExternalLink,
  PlayCircle,
  X,
  Zap
} from 'lucide-react';

interface Props {
  onResult: (result: InspectionResult) => void;
}

const DEMO_IMAGES = [
  {
    id: 'clean',
    name: 'OSHW MCU Board (Pass)',
    url: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=800&auto=format&fit=crop',
    description: 'Reference design for an Open Source microcontroller. Testing for standard solder wetting.'
  },
  {
    id: 'complex',
    name: 'Industrial I/O Module',
    url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop',
    description: 'High-density component layout. Searching for misalignment and thermal stress markers.'
  },
  {
    id: 'solder',
    name: 'SMD Component Array',
    url: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=800&auto=format&fit=crop',
    description: 'Close-up validation of 0603 and 0402 packages for bridging defects.'
  }
];

const InspectionPanel: React.FC<Props> = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [refInfo, setRefInfo] = useState<{ text: string, sources: any[] } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const processImage = async (base64: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRefInfo(null);

    try {
      const analysis = await analyzePCB(base64);
      setResult(analysis);
      onResult(analysis);
      // Auto-scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. The image might be too large or invalid.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied. Please check permissions.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      stopCamera();
      processImage(dataUrl);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => processImage(reader.result as string);
  };

  const handleDemoSelect = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use an image object to avoid CORS fetch issues
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        processImage(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => {
        setError('Failed to load demo image from remote source.');
        setLoading(false);
      };
    } catch (err) {
      setError('An error occurred while initializing the demo.');
      setLoading(false);
    }
  };

  const handleSearchRef = async (query: string) => {
    setSearching(true);
    try {
      const info = await searchReference(query);
      setRefInfo(info);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter">AI-VISION READY</span>
            <span className="text-slate-500 text-[10px] font-mono">NODE_01 // ACTIVE</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Visual Inspector</h2>
          <p className="text-slate-400 mt-1">Identify component defects using OSHW manufacturer photo datasets.</p>
        </div>
        <div className="flex space-x-3">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || showCamera}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Upload Batch</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <button
            onClick={startCamera}
            disabled={loading || showCamera}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50"
          >
            <Camera size={18} />
            <span className="hidden sm:inline">Live Analysis</span>
            <span className="sm:hidden">Live</span>
          </button>
        </div>
      </header>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <button onClick={stopCamera} className="bg-slate-800/80 p-2 rounded-full hover:bg-slate-700"><X /></button>
            </div>
            <div className="bg-slate-950 aspect-video relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-blue-500/30 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-lg"></div>
              </div>
            </div>
            <div className="p-8 flex justify-center">
              <button 
                onClick={captureFrame}
                className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 hover:bg-blue-50 transition-all scale-100 active:scale-95"
              >
                <Zap size={20} fill="currentColor" />
                <span>CAPTURE UNIT DATA</span>
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Demo Section */}
      {!result && !loading && !showCamera && (
        <section className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2 mb-6">
            <PlayCircle className="text-blue-400" size={20} />
            <h3 className="font-bold text-slate-200">Load OSHW Samples</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_IMAGES.map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleDemoSelect(demo.url)}
                className="group relative flex flex-col items-start text-left bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-blue-500/50 hover:bg-slate-800/50 transition-all"
              >
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-800">
                  <img src={demo.url} alt={demo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Manufacturer Profile</span>
                <h4 className="font-bold text-slate-100 mb-2">{demo.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{demo.description}</p>
                <div className="absolute top-6 right-6 px-3 py-1 bg-blue-600 rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg">
                  ANALYZE SAMPLE
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={24} className="text-blue-300 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white">Synthesizing Geometry...</h3>
          <p className="text-slate-500 mt-2 font-mono text-xs uppercase tracking-widest">Running Inference Engine v4.2</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-start space-x-4 text-red-200">
          <AlertCircle className="mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Inspection Error</h4>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div ref={resultsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Main Visualizer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <img src={result.image} alt="Inspection Source" className="w-full h-auto object-contain max-h-[600px]" />
              
              {/* Overlay Bounding Boxes Simulation */}
              {result.defects.map((defect, i) => (
                <div 
                  key={i}
                  className={`absolute border-2 ${
                    defect.severity === 'Critical' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  } transition-all duration-300 flex items-start justify-start`}
                  style={{
                    left: `${defect.location.x}%`,
                    top: `${defect.location.y}%`,
                    width: `${defect.location.width}%`,
                    height: `${defect.location.height}%`,
                  }}
                >
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                    defect.severity === 'Critical' ? 'bg-red-500' : 'bg-amber-500'
                  } text-white -mt-5 -ml-0.5 whitespace-nowrap shadow-lg`}>
                    {defect.component}: {defect.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldAlert size={120} />
              </div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-blue-400" size={20} />
                AI Conclusion
              </h4>
              <p className="text-slate-300 leading-relaxed text-lg relative z-10">{result.summary}</p>
            </div>
          </div>

          {/* Sidebar Metrics */}
          <div className="space-y-6">
            <div className={`p-8 rounded-3xl border transition-all ${
              result.status === 'Pass' 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-red-950/20 border-red-500/30 shadow-lg shadow-red-900/10'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-400 font-medium tracking-widest uppercase text-[10px]">Quality Gate Status</span>
                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider ${
                  result.status === 'Pass' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {result.status}
                </span>
              </div>
              <div className="text-6xl font-black mb-2 tracking-tighter">
                {result.defects.length} <span className="text-lg text-slate-500 font-medium tracking-normal">ANOMALIES</span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-4 uppercase">Batch ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
                <h4 className="font-bold flex items-center gap-2">
                  <ShieldAlert className="text-amber-500" size={18} />
                  Defect Catalog
                </h4>
                <span className="text-[10px] font-mono text-slate-600">IPC-A-610G STD</span>
              </div>
              <div className="divide-y divide-slate-800 max-h-[350px] overflow-y-auto">
                {result.defects.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 italic text-sm">
                    Unit conforms to quality standards.
                  </div>
                ) : (
                  result.defects.map((defect, i) => (
                    <div key={i} className="p-6 hover:bg-slate-800/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{defect.component}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                          defect.severity === 'Critical' ? 'bg-red-900/30 text-red-400' : 'bg-amber-900/30 text-amber-400'
                        }`}>
                          {defect.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4 leading-snug">{defect.description}</p>
                      <button 
                        onClick={() => handleSearchRef(defect.type + " " + defect.component)}
                        className="flex items-center space-x-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Search size={14} />
                        <span className="uppercase tracking-wider">Reference Standards</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reference Grounding Panel */}
            {(searching || refInfo) && (
              <div className="bg-blue-950/20 border border-blue-500/30 rounded-3xl p-6 animate-in zoom-in-95 duration-300 shadow-2xl shadow-blue-900/20">
                <h5 className="text-[10px] font-bold text-blue-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                  {searching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                  Grounding Database
                </h5>
                {searching ? (
                  <p className="text-sm text-slate-500 italic">Querying industrial IPC benchmarks...</p>
                ) : refInfo && (
                  <>
                    <div className="text-sm text-slate-300 leading-relaxed mb-6 font-medium">
                      {refInfo.text}
                    </div>
                    {refInfo.sources.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Verification Links:</p>
                        {refInfo.sources.map((chunk, idx) => (
                          <a 
                            key={idx}
                            href={chunk.googleSearch?.uri}
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-between p-3 bg-slate-950 rounded-xl hover:bg-blue-900/20 border border-slate-800 hover:border-blue-500/50 transition-all group"
                          >
                            <span className="text-xs truncate max-w-[180px] text-slate-400 group-hover:text-blue-200">{chunk.googleSearch?.title || 'Reference Link'}</span>
                            <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-400 flex-shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionPanel;
