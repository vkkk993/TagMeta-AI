import { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight } from 'lucide-react';

export default function Transcripts() {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the data from your Flask API when the component mounts
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/transcripts')
      .then(res => res.json())
      .then(data => {
        setTranscripts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching scripts:", err);
        setLoading(false);
      });
  }, []);

  // Helper function to dynamically color code the sentiment badges
  const getSentimentBadge = (sentiment) => {
    const s = sentiment?.toString().toLowerCase() || '';
    if (s.includes('positive')) return 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50';
    if (s.includes('negative')) return 'bg-rose-900/30 text-rose-400 border-rose-500/50';
    return 'bg-slate-700/50 text-slate-300 border-slate-600';
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 h-[calc(100vh-8rem)] flex flex-col overflow-hidden shadow-xl">
      
      {/* Table Header & Controls */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white">Corpus Database</h2>
          <p className="text-slate-400 text-sm mt-1">Manage and inspect processed movie scripts.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search scripts..." 
              className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-200 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Scrollable Data Table */}
      <div className="flex-1 overflow-auto bg-slate-900/20">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-950/50 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Title / Year</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Genres</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Sentiment</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Scenes</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase">Speakers</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  Loading corpus data from API...
                </td>
              </tr>
            ) : (
              // Slicing to 50 items so the browser doesn't lag rendering 2,900 rows at once
              transcripts.slice(0, 50).map((script, idx) => (
                <tr key={idx} className="hover:bg-slate-800/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-200 text-base">
                      {script.file_name?.replace('.txt', '').replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">{script.year || 'Unknown Year'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400">{script.genres || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getSentimentBadge(script.primary_sentiment_tone)}`}>
                      {script.primary_sentiment_tone || 'Neutral'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {script.total_scenes_detected || 0}
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {script.unique_speakers_count || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold rounded-lg transition-all text-xs border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-lg shadow-emerald-900/20">
                      Inspect
                      <ChevronRight size={14} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}