import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Smile, 
  Sparkles, 
  Award, 
  FileText, 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Layers, 
  Loader2,
  AlertCircle,
  Users,
  Tag,
  Clock,
  MapPin,
  Building2,
  Music,
  Paperclip
} from 'lucide-react';

export default function ContentInsights() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scriptId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [scriptData, setScriptData] = useState(null);

  useEffect(() => {
    const fetchScriptDetails = async () => {
      setIsLoading(true);
      setErrorMessage('');
      const targetId = scriptId || '1022603';

      try {
        const response = await fetch(`http://127.0.0.1:5000/api/insights/${targetId}`);
        
        if (response.ok) {
          const data = await response.json();
          setScriptData(data);
        } else {
          setErrorMessage('Could not retrieve metadata for this script from the database.');
          throw new Error("Trigger fallback");
        }
      } catch (error) {
        console.error("Failed to connect to Flask backend. Using fallback data:", error);
        setScriptData({
          id: "Fallback_ID_123",
          title: "500 Days of Summer (Fallback)",
          source: "Corpus Database",
          words: "24,293",
          scenes: 11,
          speakers: 4,
          genre: "Drama",
          subgenres: ["Entertainment", "Comedy", "Romance"],
          tone: { label: "Positive", score: "+0.636" },
          emotion: { label: "Joy", confidence: "98%" },
          aiSummary: "The narrative opens in Sequence 1, introducing the protagonist. As their lives become intertwined, the protagonist navigates the highs and complexities of connection...",
          genreContext: "Character-driven storytelling focusing on interpersonal relationships.",
          deepAnalysis: {
              narrative_arc: "The script follows a standard nonlinear structure.",
              thematic_execution: "Themes of fate and expectations are executed through heavy dialogue."
          },
          topics: [
            { theme: "Romance & Modern Dating", score: 95 },
            { theme: "Interpersonal Conflict", score: 88 },
            { theme: "Pop Culture", score: 82 }
          ],
          keywords: [
            { word: "dialog", count: "+4315" },
            { word: "heading", count: "+1321" },
            { word: "speaker", count: "+1154" }
          ],
          namedEntities: [
            { name: "Tom", relevance: 98 },
            { name: "Summer", relevance: 95 }
          ],
          locations: [], organizations: [], worksSongs: [], otherEntities: [], speakerMetrics: [], timeline: [], memorableQuotes: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScriptDetails();
  }, [scriptId]);

  const handleExportCSV = () => {
    if (!scriptData) return;
    const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
    const headers = ['Script ID', 'Title', 'Genre', 'Words', 'Dominant Emotion', 'Sentiment', 'Summary'];
    const row = [
      escapeCsv(scriptData.id || scriptId), escapeCsv(scriptData.title), escapeCsv(scriptData.genre),
      escapeCsv(scriptData.words), escapeCsv(scriptData.emotion?.label || 'Unknown'),
      escapeCsv(scriptData.tone?.label || 'Neutral'), escapeCsv(scriptData.aiSummary || 'N/A')
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + row.join(',');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${scriptData.title.replace(/\s+/g, '_')}_Metadata.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => window.print();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-emerald-500 space-y-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="text-white font-bold text-lg">Extracting Deep Narrative Insights...</p>
      </div>
    );
  }

  // --- WIRED: DYNAMIC METADATA SCORING ENGINE ---
  let entityScore = '0%';
  let topicScore = '0%';
  let sentimentScore = '0%';
  let segmentationScore = '0%';
  let overallScore = '0%';

  if (scriptData) {
    // 1. Entities: Richness of characters, locations, and orgs
    const totalEntities = (scriptData.namedEntities?.length || 0) + 
                          (scriptData.locations?.length || 0) + 
                          (scriptData.organizations?.length || 0) + 
                          (scriptData.otherEntities?.length || 0);
    const eScore = totalEntities > 0 ? Math.min(100, 65 + (totalEntities * 2)) : 35;
    entityScore = `${eScore}%`;

    // 2. Topics: Richness of themes and keywords
    const totalTopics = (scriptData.topics?.length || 0) + (scriptData.keywords?.length || 0);
    const tScore = totalTopics > 0 ? Math.min(100, 60 + Math.round(totalTopics * 2.5)) : 35;
    topicScore = `${tScore}%`;

    // 3. Sentiment: Confidence and presence of specific emotional states
    let sScore = 40;
    if (scriptData.emotion?.label && scriptData.emotion.label !== 'Unknown') sScore += 40;
    if (scriptData.tone?.label && scriptData.tone.label !== 'Neutral') sScore += 20;
    else if (scriptData.tone?.label === 'Neutral') sScore += 15;
    sentimentScore = `${sScore}%`;

    // 4. Segmentation: Presence of timeline/VTT or extracted speaker breakdown
    const segScore = (scriptData.timeline && scriptData.timeline.length > 0) ? 100 : (scriptData.speakerMetrics?.length > 0 ? 85 : 40);
    segmentationScore = `${segScore}%`;

    // Overall Average
    const oScore = Math.round((eScore + tScore + sScore + segScore) / 4);
    overallScore = `${oScore}%`;
  }
  // ----------------------------------------------

  const renderEntityGrid = (data, title, desc, icon, badgeColor, badgeText) => {
    const items = data || [];
    return (
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl mb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-slate-400">{icon}</div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title} ({items.length})</h3>
            <p className="text-slate-500 text-[10px]">{desc}</p>
          </div>
        </div>
        
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, i) => {
              const name = typeof item === 'string' ? item : (item.name || 'Unknown');
              const relevance = typeof item === 'string' ? Math.max(1, 90 - (i*2)) : (item.relevance || 80);
              return (
                <div key={i} className="bg-[#0f172a] border border-slate-800/80 p-4 rounded-xl flex flex-col gap-3 hover:border-slate-600 transition-all shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                      {badgeText}
                    </span>
                    <span className="text-emerald-400 text-[11px] font-bold font-mono">+{relevance}</span>
                  </div>
                  <span className="text-slate-200 text-sm font-bold truncate" title={name}>{name}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-slate-500 text-sm py-4 text-center border-2 border-dashed border-slate-800/50 rounded-xl">
            No {title.toLowerCase()} were detected in this script.
          </div>
        )}
      </div>
    )
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between bg-[#0B1120] border border-slate-800 rounded-xl p-4 shadow-lg flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-4 text-sm">
          <button onClick={() => navigate('/search')} className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} /> Search Results
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">Active Script ID: <strong className="text-white font-mono">{scriptData?.id || scriptId || 'Loading...'}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700">
            <RefreshCw size={14} /> Refresh Analysis
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-[#0B1120] text-sm font-medium rounded-lg transition-all">
            <FileText size={14} /> PDF Report
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3 text-amber-300 text-sm print:hidden">
          <AlertCircle size={20} className="text-amber-400 shrink-0" />
          <span>{errorMessage} Using layout fallback view.</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
            {scriptData?.genre ? scriptData.genre.toUpperCase() : 'ANALYST VIEW'}
          </span>
          {scriptData?.subgenres?.map((sub, i) => (
            <span key={i} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs">{sub}</span>
          ))}
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <CheckCircle2 size={12} /> Analysis Complete
          </span>
        </div>
        
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{scriptData?.title || 'Untitled Script'}</h1>
            <p className="text-slate-400 text-sm">
              Source: {scriptData?.source || 'Corpus Database'} • Words: {scriptData?.words || 'N/A'} • Scenes: {scriptData?.scenes || 0} • Speakers: {scriptData?.speakers || 0}
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Story Tone</p>
              <p className="text-emerald-400 flex items-center justify-end gap-1 font-bold">
                <Smile size={16} /> {scriptData?.tone?.label || 'Positive'} <span className="text-emerald-500/50 text-xs ml-1">({scriptData?.tone?.score || '+0.636'})</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Dominant Emotion</p>
              <p className="text-orange-400 flex items-center justify-end gap-1 font-bold">
                <Smile size={16} /> {scriptData?.emotion?.label || 'Joy'} <span className="text-orange-500/50 text-xs ml-1">{scriptData?.emotion?.confidence || '98%'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Navigation */}
        <div className="flex items-center gap-6 mt-8 border-b border-slate-800 pb-2 overflow-x-auto print:hidden">
          {[
            { id: 'overview', label: 'Story Overview' },
            { id: 'themes', label: `Story Themes (${(scriptData?.topics?.length || 0) + (scriptData?.keywords?.length || 0)})` },
            { id: 'people', label: `People & Characters (${(scriptData?.namedEntities?.length || 0) + (scriptData?.locations?.length || 0) + (scriptData?.organizations?.length || 0)})` },
            { id: 'analysis', label: 'Story Analysis' },
            { id: 'timeline', label: `Story Timeline (${scriptData?.timeline?.length || 0})` },
            { id: 'quotes', label: `Memorable Moments (${scriptData?.memorableQuotes?.length || 0})` },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 font-bold transition-colors whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONDITIONAL RENDERING: STORY OVERVIEW TAB */}
      {(activeTab === 'overview' || window.matchMedia('print').matches) && (
        <div className="space-y-6 animate-fade-in print:block">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold flex items-center gap-2"><Sparkles className="text-emerald-400" size={18} /> AI STORY SUMMARY</h3>
                <span className="text-emerald-500/70 text-xs font-bold tracking-wider">Grounded Narrative Arc</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm mb-4">{scriptData?.aiSummary || 'No summary available.'}</p>
              <p className="text-slate-400 text-xs"><span className="font-bold text-slate-300">Genre Context:</span> {scriptData?.genreContext || 'Standard narrative format.'}</p>
            </div>

            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold flex items-center gap-2"><Award className="text-emerald-400" size={18} /> METADATA SCORE</h3>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded border border-emerald-500/30">Production Grade</span>
              </div>
              <div className="flex items-center gap-6 flex-1">
                <div className="relative w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-white">{overallScore.replace('%', '')}<span className="text-sm text-slate-500">%</span></span>
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Entities', val: entityScore },
                    { label: 'Topics', val: topicScore },
                    { label: 'Sentiment', val: sentimentScore },
                    { label: 'Segmentation', val: segmentationScore },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-[10px] mb-1"><span className="text-slate-400">{stat.label}</span><span className="text-white font-bold">{stat.val}</span></div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: stat.val }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Story Genre</p>
              <h3 className="text-2xl font-bold text-emerald-400 mb-3">{scriptData?.genre || 'Drama'}</h3>
              <div className="flex flex-wrap gap-2">
                {scriptData?.subgenres?.map((sub, i) => (
                  <span key={i} className="bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1 rounded-md text-xs">{sub}</span>
                ))}
              </div>
            </div>
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Story Tone</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold mb-3">
                <Smile size={16} /> {scriptData?.tone?.label || 'Positive'} ({scriptData?.tone?.score || '+0.636'})
              </div>
            </div>
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Dominant Emotion</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold mb-3">
                <Smile size={16} /> {scriptData?.emotion?.label || 'Joy'} {scriptData?.emotion?.confidence || '98%'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-500 font-bold flex items-center gap-2 text-[10px] uppercase tracking-wider">
                  <Layers className="text-emerald-400" size={14} /> Key Topics
                </h3>
                <button onClick={() => setActiveTab('themes')} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-bold print:hidden">
                  View Themes
                </button>
              </div>
              <div className="space-y-3 flex-1">
                {scriptData?.topics?.slice(0, 3).map((topic, i) => {
                  const themeName = typeof topic === 'string' ? topic : (topic.theme || 'Unknown Theme');
                  const score = typeof topic === 'string' ? (95 - (i * 4)) : (topic.score || 80);
                  
                  return (
                  <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl flex justify-between items-center">
                    <h4 className="text-emerald-400 text-sm font-bold truncate pr-2">{themeName}</h4>
                    <span className="text-emerald-500/70 text-xs font-bold">{score}%</span>
                  </div>
                )})}
              </div>
            </div>

            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-500 font-bold flex items-center gap-2 text-[10px] uppercase tracking-wider">
                  <Tag className="text-cyan-400" size={14} /> Keywords
                </h3>
                <button onClick={() => setActiveTab('themes')} className="text-cyan-500 hover:text-cyan-400 text-[10px] font-bold cursor-pointer print:hidden">
                  View Keywords
                </button>
              </div>
              <div className="flex flex-wrap gap-2 content-start">
                {(scriptData?.keywords?.length > 0 ? scriptData.keywords : [{ word: 'Awaiting Script Data', count: '---' }]).slice(0,6).map((kw, i) => {
                  const word = typeof kw === 'string' ? kw : (kw.word || 'Unknown');
                  const count = typeof kw === 'string' ? '' : (kw.count || '');
                  return (
                  <div key={i} className="bg-slate-900/40 border border-slate-800/50 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:border-cyan-500/30 transition-colors cursor-default">
                    <span className="text-slate-300 text-xs">{word}</span>
                    <span className="text-cyan-500/70 text-[10px] font-bold">{count}</span>
                  </div>
                )})}
              </div>
            </div>

            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-500 font-bold flex items-center gap-2 text-[10px] uppercase tracking-wider">
                  <Users className="text-indigo-400" size={14} /> People
                </h3>
                <button onClick={() => setActiveTab('people')} className="text-indigo-500 hover:text-indigo-400 text-[10px] font-bold print:hidden">
                  View All
                </button>
              </div>
              <div className="flex flex-wrap gap-2 content-start">
                {scriptData?.namedEntities?.slice(0, 6).map((entity, i) => {
                  const name = typeof entity === 'string' ? entity : (entity.name || 'Unknown');
                  const relevance = typeof entity === 'string' ? (90 - (i*3)) : (entity.relevance || 80);
                  return (
                  <div key={i} className="bg-indigo-900/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:border-indigo-500/40 transition-colors">
                    <Users size={10} className="text-indigo-500/50" />
                    <span className="text-indigo-300 text-xs font-bold">{name}</span>
                    <span className="text-indigo-500/50 text-[10px]">{relevance}%</span>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL RENDERING: STORY THEMES & KEYWORDS TAB */}
      {(activeTab === 'themes' && !window.matchMedia('print').matches) && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                NARRATIVE TOPICS ({scriptData?.topics?.length || 0})
              </h3>
              <p className="text-slate-500 text-xs">Thematic topics backed by screenplay evidence</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scriptData?.topics?.length > 0 ? scriptData.topics.map((topic, i) => {
                const themeName = typeof topic === 'string' ? topic : (topic.theme || 'Unknown Theme');
                const score = typeof topic === 'string' ? (95 - (i * 4)) : (topic.score || 85);
                return (
                  <div key={i} className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/30 transition-colors">
                    <span className="text-slate-200 text-sm font-bold">{themeName}</span>
                    <span className="text-emerald-400 text-xs font-bold font-mono bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                      {score}% Salience
                    </span>
                  </div>
                )
              }) : <p className="text-slate-500 text-sm">No themes extracted for this script.</p>}
            </div>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                EXTRACTED KEYWORDS ({scriptData?.keywords?.length || 0})
              </h3>
              <p className="text-slate-500 text-xs">Searchable keyphrases and frequencies</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {scriptData?.keywords?.length > 0 ? scriptData.keywords.map((kw, i) => {
                const word = typeof kw === 'string' ? kw : (kw.word || 'Unknown');
                const count = typeof kw === 'string' ? '' : (kw.count || '');
                const importance = Math.max(40, 98 - (i * 2)); 
                return (
                  <div key={i} className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl hover:border-cyan-500/30 transition-colors flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-200 text-sm font-bold truncate" title={word}>{word}</span>
                      <span className="text-emerald-400 text-xs font-bold font-mono shrink-0">{count}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Importance: <strong className="text-cyan-400">{importance}%</strong></span>
                    </div>
                  </div>
                )
              }) : <p className="text-slate-500 text-sm col-span-full">No keywords extracted for this script.</p>}
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL RENDERING: PEOPLE & CHARACTERS TAB */}
      {(activeTab === 'people' && !window.matchMedia('print').matches) && (
        <div className="space-y-6 animate-fade-in">
          
          {scriptData?.speakerMetrics && scriptData.speakerMetrics.length > 0 ? (
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl mb-6 overflow-x-auto">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  CHARACTERS & SPEAKERS ({scriptData.speakerMetrics.length})
                </h3>
                <p className="text-slate-500 text-xs">Dialogue turns and speech metrics</p>
              </div>
              <table className="w-full text-left text-xs min-w-150">
                <thead className="text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800/80">
                  <tr>
                    <th className="pb-3 px-2">Character / Speaker</th>
                    <th className="pb-3 px-2">Dialogue Lines</th>
                    <th className="pb-3 px-2">Word Count</th>
                    <th className="pb-3 px-2 text-center">Dominant Sentiment</th>
                    <th className="pb-3 px-2 text-center">Dominant Emotion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {scriptData.speakerMetrics.map((sm, i) => (
                    <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-2 font-bold uppercase text-white">{sm.speaker}</td>
                      <td className="py-3 px-2 font-mono">{sm.dialogue_lines}</td>
                      <td className="py-3 px-2 font-mono">{sm.word_count}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-800 px-2 py-1 rounded text-[10px]">
                          <Smile size={12} className="text-slate-400"/> {sm.sentiment}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-800 px-2 py-1 rounded text-[10px]">
                          <Smile size={12} className="text-slate-400"/> {sm.emotion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl mb-6">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  CHARACTERS & SPEAKERS (0)
                </h3>
                <p className="text-slate-500 text-xs">Dialogue turns and speech metrics</p>
              </div>
              <div className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800/50 rounded-xl">
                 Detailed speaker metrics and dialogue counts are only available for newly AI-analyzed scripts. <br/>
                 <span className="text-xs text-slate-600 mt-2 block">Please re-upload this script via the "Upload & Analyze" tool to extract these insights.</span>
              </div>
            </div>
          )}

          {renderEntityGrid(
            scriptData?.namedEntities, 
            "PEOPLE & CHARACTERS", 
            "Identified characters and referenced persons",
            <Users className="text-blue-400" size={18} />,
            "bg-blue-500/10 text-blue-400 border border-blue-500/20",
            "Person"
          )}

          {renderEntityGrid(
            scriptData?.locations, 
            "LOCATIONS & SETTINGS", 
            "Geographic places, cities, and facilities",
            <MapPin className="text-emerald-400" size={18} />,
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            "Location"
          )}

          {renderEntityGrid(
            scriptData?.organizations, 
            "ORGANIZATIONS & GROUPS", 
            "Companies, agencies, institutions, and bands",
            <Building2 className="text-amber-500" size={18} />,
            "bg-amber-700/20 text-amber-500 border border-amber-700/30",
            "Organization"
          )}

          {renderEntityGrid(
            scriptData?.worksSongs, 
            "WORKS & SONGS", 
            "Referenced songs, films, books, and artistic works",
            <Music className="text-purple-400" size={18} />,
            "bg-purple-500/10 text-purple-400 border border-purple-500/20",
            "Work / Song"
          )}

          {renderEntityGrid(
            scriptData?.otherEntities, 
            "OTHER ENTITIES", 
            "Dates, products, and temporal entities",
            <Paperclip className="text-cyan-400" size={18} />,
            "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
            "Event"
          )}
        </div>
      )}

      {/* CONDITIONAL RENDERING: STORY ANALYSIS TAB */}
      {(activeTab === 'analysis' && !window.matchMedia('print').matches) && (
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Award className="text-emerald-400" size={24} /> Deep Story Analysis</h3>
          <div className="space-y-4">
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-colors">
              <h4 className="text-emerald-400 font-bold mb-2">Narrative Arc & Pacing</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {scriptData?.deepAnalysis?.narrative_arc || 'Deep analysis is only available for newly AI-processed scripts.'}
              </p>
            </div>
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-colors">
              <h4 className="text-emerald-400 font-bold mb-2">Thematic Execution</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {scriptData?.deepAnalysis?.thematic_execution || 'Deep analysis is only available for newly AI-processed scripts.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL RENDERING: STORY TIMELINE TAB */}
      {(activeTab === 'timeline' && !window.matchMedia('print').matches) && (
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-8">
             <Clock className="text-emerald-400" size={24} />
             <h3 className="text-xl font-bold text-white">
               {scriptData?.timeline && scriptData.timeline.length > 0 ? "Original .VTT Subtitle Timeline" : "Scene-by-Scene Timeline"}
             </h3>
          </div>

          <div className="relative border-l-2 border-slate-700 ml-4 space-y-8">
            {scriptData?.timeline && scriptData.timeline.length > 0 ? (
              scriptData.timeline.slice(0, 100).map((segment, i) => (
                <div key={i} className="pl-6 relative">
                  <div className="w-4 h-4 bg-[#0B1120] border-2 border-cyan-400 rounded-full absolute -left-2.25 top-0.5"></div>
                  <h4 className="text-cyan-400 font-bold text-sm font-mono bg-cyan-500/10 inline-block px-2 py-0.5 rounded border border-cyan-500/20 shadow-sm mb-2">
                    {segment.start} ➔ {segment.end}
                  </h4>
                  <p className="text-slate-300 text-sm">{segment.text}</p>
                </div>
              ))
            ) : (
              <>
                <div className="pl-6 relative">
                  <div className="w-4 h-4 bg-[#0B1120] border-2 border-emerald-400 rounded-full absolute -left-2.25 top-0.5"></div>
                  <h4 className="text-white font-bold text-sm">Act I: The Setup</h4>
                  <p className="text-slate-400 text-sm mt-1">Introduction of main characters and the primary conflict based on the {scriptData?.genre || 'story'} setting.</p>
                </div>
                <div className="pl-6 relative">
                  <div className="w-4 h-4 bg-[#0B1120] border-2 border-emerald-400 rounded-full absolute -left-2.25 top-0.5"></div>
                  <h4 className="text-white font-bold text-sm">Act II: Confrontation</h4>
                  <p className="text-slate-400 text-sm mt-1">Rising action driven by internal struggles and external obstacles.</p>
                </div>
                <div className="pl-6 relative">
                  <div className="w-4 h-4 bg-[#0B1120] border-2 border-emerald-400 rounded-full absolute -left-2.25 top-0.5"></div>
                  <h4 className="text-white font-bold text-sm">Act III: Resolution</h4>
                  <p className="text-slate-400 text-sm mt-1">Climax and resolution, settling into a {scriptData?.tone?.label || 'Neutral'} ending state.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONDITIONAL RENDERING: MEMORABLE QUOTES TAB */}
      {(activeTab === 'quotes' && !window.matchMedia('print').matches) && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                MEMORABLE MOMENTS ({scriptData?.memorableQuotes?.length || 0})
              </h3>
              <p className="text-slate-500 text-xs">Key dialogue lines and their narrative significance</p>
            </div>
            
            {scriptData?.memorableQuotes && scriptData.memorableQuotes.length > 0 ? (
              <div className="space-y-4">
                {scriptData.memorableQuotes.map((quote, i) => (
                  <div key={i} className="bg-[#0f172a] border border-slate-800 p-6 rounded-xl flex flex-col gap-4 hover:border-emerald-500/30 transition-colors shadow-sm">
                    <p className="text-slate-200 text-[15px] italic font-serif leading-relaxed">
                      "{quote.quote_text || quote.quote}"
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-slate-800/80 pt-4">
                      <span className="text-emerald-400 text-xs font-bold font-mono bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 shrink-0 w-fit">
                        Speaker: {quote.speaker || "Unknown"}
                      </span>
                      <span className="text-slate-400 text-xs sm:text-right">
                        {quote.reason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800/50 rounded-xl">
                 Memorable quotes are only available for newly AI-analyzed scripts. <br/>
                 <span className="text-xs text-slate-600 mt-2 block">Please re-upload this script via the "Upload & Analyze" tool to extract these insights.</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}