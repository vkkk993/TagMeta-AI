import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Folder, 
  Users, 
   
  Search, 
  UploadCloud, 
  LineChart, 
  RefreshCw, 
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();

  // Dynamic States for real database metrics
  const [stats, setStats] = useState({
    totalTranscripts: 0,
    analyzed: 0,
    sourceFiles: 0,
    entities: 0,
    inProgress: 0,
    pendingQueue: 0,
    failed: 0
  });
  
  const [genreData, setGenreData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [recentScripts, setRecentScripts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

 useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          // Map backend stats
          setStats({
            totalTranscripts: data.totalTranscripts || 0,
            analyzed: data.analyzed || 0,
            sourceFiles: data.sourceFiles || 0,
            entities: data.entities || 0,
            inProgress: data.inProgress || 0,
            pendingQueue: data.pendingQueue || 0,
            failed: data.failed || 0
          });
          // Map chart and table data
          if (data.genreData) setGenreData(data.genreData);
          if (data.emotionData) setEmotionData(data.emotionData);
          if (data.recentScripts) setRecentScripts(data.recentScripts);
        }
      } catch (err) {
        console.warn("Backend not reachable:", err);
      }
    };

    fetchDashboardStats();
  }, [refreshTrigger]); 

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Transcript Intelligence</h1>
          <p className="text-slate-400 text-sm">Understand, explore, search, and analyze your transcripts with AI-powered metadata extraction.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0B1120] text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <UploadCloud size={16} /> Upload & Analyze
          </button>
          <button 
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700"
          >
            <Search size={16} /> Search Transcripts
          </button>
          <button 
            onClick={() => navigate('/insights')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700"
          >
            <LineChart size={16} /> Insights
          </button>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            title="Refresh Stats"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Transcripts <Info size={12} className="text-slate-500" />
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><FileText size={18} /></div>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-1">{stats.totalTranscripts.toLocaleString()}</h2>
          <p className="text-slate-500 text-xs">Transcripts available in the platform.</p>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Analyzed <Info size={12} className="text-slate-500" />
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckCircle2 size={18} /></div>
          </div>
          <h2 className="text-3xl font-extrabold text-emerald-400 mb-1">{stats.analyzed.toLocaleString()}</h2>
          <p className="text-slate-500 text-xs">Transcripts successfully analyzed.</p>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Source Files <Info size={12} className="text-slate-500" />
            </span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Folder size={18} /></div>
          </div>
          <h2 className="text-3xl font-extrabold text-cyan-400 mb-1">{stats.sourceFiles.toLocaleString()}</h2>
          <p className="text-slate-500 text-xs">Transcript files available in the dataset.</p>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              People & Entities <Info size={12} className="text-slate-500" />
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Users size={18} /></div>
          </div>
          <h2 className="text-3xl font-extrabold text-purple-400 mb-1">{stats.entities.toLocaleString()}</h2>
          <p className="text-slate-500 text-xs">Named people, places, organizations found.</p>
        </div>
      </div>

      {/* Middle Grid: Genre Bar Chart & Popular Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Stories by Genre */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-bold text-white">Stories by Genre</h3>
              <button onClick={() => navigate('/search')} className="text-xs text-emerald-400 hover:underline">
                Browse in Search
              </button>
            </div>
            <p className="text-slate-500 text-xs mb-4">Real category classification counts across analyzed transcripts</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="genre" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Topics (Leaving Static Array format to keep UI intact, can be wired later) */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-bold text-white">Popular Topics</h3>
            <button onClick={() => navigate('/search')} className="text-xs text-emerald-400 hover:underline">
              All Topics
            </button>
          </div>
          <p className="text-slate-500 text-xs mb-4">Most frequent thematic elements extracted from screenplays</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { rank: '#1', title: 'Drama & Interpersonal Conflict', count: 2826 },
              { rank: '#2', title: 'Action, Survival & Conflict', count: 2557 },
              { rank: '#3', title: 'Family Dynasty, Power & Loy...', count: 2332 },
              { rank: '#4', title: 'Romance, Love & Nostalgia', count: 2023 },
              { rank: '#5', title: 'Entertainment, Music & Nigh...', count: 1581 },
              { rank: '#6', title: 'Crime, Law & Investigation', count: 982 },
              { rank: '#7', title: 'Technology, Systems & Cybern...', count: 823 },
              { rank: '#8', title: 'Psychological Tension & Identity', count: 744 },
            ].map(topic => (
              <div key={topic.rank} className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-medium truncate pr-2">
                  <strong className="text-emerald-400 mr-1.5">{topic.rank}</strong> {topic.title}
                </span>
                <span className="bg-[#0B1120] border border-slate-700 text-slate-400 px-2 py-0.5 rounded text-[11px] font-mono">
                  {topic.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Story Tone & Common Emotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Story Tone */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-bold text-white">Story Tone</h3>
              <span className="text-xs text-slate-500 font-mono">Total: {stats.analyzed.toLocaleString()}</span>
            </div>
            <p className="text-slate-500 text-xs mb-6">Overall sentiment polarity calculated across analyzed scripts</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Positive
                  </span>
                  <span className="text-slate-300">1,351 (47%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '47%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Neutral
                  </span>
                  <span className="text-slate-300">771 (27%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '27%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> Negative
                  </span>
                  <span className="text-slate-300">769 (27%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: '27%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Emotions Donut Chart */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-bold text-white">Common Emotions</h3>
            <button onClick={() => navigate('/insights')} className="text-xs text-emerald-400 hover:underline">
              Details
            </button>
          </div>
          <p className="text-slate-500 text-xs mb-4">Distribution of dominant emotions across analyzed stories</p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-44 h-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={emotionData} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={2}>
                    {emotionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1 w-full">
              {emotionData.map(item => (
                <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="flex items-center gap-2 text-slate-300 font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="text-slate-400 font-mono">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recently Analyzed Table */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white">Recently Analyzed</h3>
            <p className="text-slate-500 text-xs">Latest processed screenplays from the database</p>
          </div>
          <button 
            onClick={() => navigate('/search')}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors"
          >
            View All in Search <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 uppercase tracking-wider font-bold">
                <th className="pb-3 px-3">Title</th>
                <th className="pb-3 px-3">Genre</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Word Count</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentScripts.map((script) => (
                <tr key={script.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-slate-200">{script.title}</td>
                  <td className="py-3.5 px-3">
                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                      {script.genre}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-md font-bold tracking-wider text-[10px] ${
                      script.status === 'COMPLETED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {script.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{script.words}</td>
                  <td className="py-3.5 px-3 text-right">
                    <button 
                      onClick={() => navigate(`/insights?id=${script.id}`)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-[#0B1120] text-slate-300 font-bold rounded-lg transition-all border border-slate-700 text-xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: What would you like to do? */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">What would you like to do?</h3>
          <p className="text-slate-500 text-xs">Quick navigation to key platform workflows</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => navigate('/upload')}
            className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-xl cursor-pointer transition-all group"
          >
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud size={20} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Upload & Analyze New Script</h4>
            <p className="text-slate-500 text-xs">Ingest and process a .txt, .vtt, or .pdf screenplay file.</p>
          </div>

          <div 
            onClick={() => navigate('/search')}
            className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-xl cursor-pointer transition-all group"
          >
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <Search size={20} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Search Transcripts</h4>
            <p className="text-slate-500 text-xs">Search dialogues, scenes, and characters across the corpus.</p>
          </div>

          <div 
            onClick={() => navigate('/insights')}
            className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-xl cursor-pointer transition-all group"
          >
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
              <LineChart size={20} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Content Insights</h4>
            <p className="text-slate-500 text-xs">Deep narrative breakdown, topics, entities, and memorable moments.</p>
          </div>
        </div>
      </div>

    </div>
  );
}