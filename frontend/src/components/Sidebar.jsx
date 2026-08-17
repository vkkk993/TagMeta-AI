import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, UploadCloud, LineChart, Sparkles } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Search Transcripts', path: '/search', icon: Search },
    { name: 'Upload & Analyze', path: '/upload', icon: UploadCloud },
    { name: 'Content Insights', path: '/insights', icon: LineChart },
  ];

  return (
    <div className="w-64 bg-[#0B1120] border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Sparkles className="text-[#0B1120]" size={20} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">TagMeta AI</h1>
            <p className="text-emerald-500/70 text-[10px] font-mono tracking-wider uppercase">Transcript Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer Versioning */}
      <div className="p-6 text-center border-t border-slate-800">
        <p className="text-slate-500 text-xs font-mono">TagMeta AI Platform<br/>v2.4 Production Edition</p>
      </div>
    </div>
  );
}