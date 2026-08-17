export default function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className="text-emerald-500" size={20} />}
      </div>
      <div>
        <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
        <div className="text-emerald-400 text-sm font-medium">{subtitle}</div>
      </div>
    </div>
  );
}