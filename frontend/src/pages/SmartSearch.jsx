export default function SmartSearch() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Intelligent Natural Language & Semantic Search</h2>
      <p className="text-slate-400">Perform multi-vector semantic searches across script dialogue, entities, scenes, and emotion tags.</p>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mt-8">
        <input 
          type="text" 
          placeholder="Ask or search e.g., 'Scenes involving friendship and conflict'..."
          className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-lg mb-4"
        />
        <div className="flex gap-2">
          <span className="text-emerald-400 text-sm font-bold mr-2 mt-1">Suggested:</span>
          <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300 border border-slate-600 cursor-pointer hover:bg-slate-600">"negative scenes involving Neo and Morpheus"</span>
          <span className="px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300 border border-slate-600 cursor-pointer hover:bg-slate-600">"police investigation and crime"</span>
        </div>
      </div>
    </div>
  );
}