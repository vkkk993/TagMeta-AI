import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UploadCloud } from 'lucide-react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Execute global search when user presses Enter
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-20 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
      
      {/* Global Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search scripts, entities, dialogues, topics, quotes..."
            className="w-full bg-[#0B1120] border border-slate-700 text-slate-200 text-sm rounded-full pl-12 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-8">
        
        {/* Mode Indicator */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-emerald-400 text-xs font-semibold tracking-wide">LOCAL_MODE (Deterministic NLP)</span>
        </div>

        {/* Wired Upload Button */}
        <button 
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0B1120] text-sm font-bold rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
        >
          <UploadCloud size={18} />
          Upload & Analyze
        </button>
        
      </div>
    </header>
  );
}