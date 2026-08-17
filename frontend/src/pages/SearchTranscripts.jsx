import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Smile, CheckCircle2, ArrowRight, Sparkles, Users, Loader2 } from 'lucide-react';

export default function SearchTranscripts() {
  const navigate = useNavigate();
  
  // Dynamic State setup
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [genre, setGenre] = useState('All Categories');
  const [sentiment, setSentiment] = useState('All Sentiments');
  const [emotion, setEmotion] = useState('All Emotions');
  const [character, setCharacter] = useState('');

  // Auto-run an empty search when the page first loads
  useEffect(() => {
    const fetchInitial = async () => {
      setIsSearching(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/search?q=&genre=All%20Categories&sentiment=All%20Sentiments&emotion=All%20Emotions&character=&page=1&limit=10');
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setTotalFound(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setHasSearched(true);
        }
      } catch (error) {
        console.error("Initial load failed", error);
      } finally {
        setIsSearching(false);
      }
    };
    fetchInitial();
  }, []);

  // The Fetch function (Now accepts a page number)
  const fetchResults = async (pageNum) => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const queryStr = `q=${encodeURIComponent(searchQuery)}&genre=${encodeURIComponent(genre)}&sentiment=${encodeURIComponent(sentiment)}&emotion=${encodeURIComponent(emotion)}&character=${encodeURIComponent(character)}&page=${pageNum}&limit=10`;
      const response = await fetch(`http://127.0.0.1:5000/api/search?${queryStr}`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setTotalFound(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Search returned an error status:", response.status);
        setResults([]);
      }
    } catch (error) {
      console.error("Search connection failed. Ensure Flask backend is running.", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search on button click (resets to page 1)
  const handleSearch = () => {
    setCurrentPage(1);
    fetchResults(1);
  };

  // Trigger search on "Enter" key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Pagination Handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      fetchResults(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      fetchResults(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSuggestionClick = (query) => {
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setGenre('All Categories');
    setSentiment('All Sentiments');
    setEmotion('All Emotions');
    setCharacter('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 h-full flex flex-col">
      
      {/* Top Header & Search Input */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Search size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Search Transcripts</h2>
        </div>
        <div className="text-emerald-500/70 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} /> Total Results: {totalFound.toLocaleString()}
        </div>
      </div>
      <p className="text-slate-400 text-sm shrink-0">Search dialogues, scenes, characters, topics, keywords, and quotes across the entire corpus.</p>

      {/* Main Search Bar (ADDED shrink-0 to prevent collapsing) */}
      <div className="flex gap-4 mb-2 shrink-0 z-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by title, dialogue, character, topic, keyword, or quote..."
            className="w-full bg-[#0B1120] border border-slate-700 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500 transition-all shadow-lg"
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={isSearching}
          className="px-8 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-[#0B1120] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-2"
        >
          {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
        </button>
      </div>

      {/* Suggested Queries (ADDED shrink-0 and explicit padding to prevent clipping) */}
      <div className="flex flex-wrap items-center gap-3 text-sm py-4 mb-4 border-b border-slate-800/50 shrink-0">
        <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
          <Sparkles size={14}/> Suggested Queries:
        </span>
        {["Rick", "Casablanca", "wartime romance", "piano", "crime", "love", "French Morocco"].map(q => (
          <button 
            key={q} 
            onClick={() => handleSuggestionClick(q)}
            className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-1.5 rounded-full border border-slate-700 transition-colors shrink-0"
          >
            "{q}"
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-2 flex-1 items-start">
        
        {/* Left Sidebar: Advanced Filters */}
        <div className="w-full lg:w-64 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl shrink-0 lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h3 className="text-white font-bold flex items-center gap-2"><Filter size={18} className="text-emerald-400" /> Advanced Filters</h3>
            <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-300">Clear all</button>
          </div>

          <div className="space-y-6 text-sm">
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Category / Genre</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500">
                <option>All Categories</option>
                <option>Drama</option>
                <option>Comedy</option>
                <option>Action</option>
                <option>Sci-Fi</option>
                <option>Thriller</option>
                <option>Horror</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Sentiment Polarity</label>
              <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500">
                <option>All Sentiments</option>
                <option>Positive</option>
                <option>Neutral</option>
                <option>Negative</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Dominant Emotion</label>
              <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500">
                <option>All Emotions</option>
                <option>Joy</option>
                <option>Anger</option>
                <option>Sadness</option>
                <option>Fear</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Character / Speaker</label>
              <input type="text" value={character} onChange={(e) => setCharacter(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. RICK, ILSA, NEO" className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
        </div>

        {/* Right Area: Results Feed */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-slate-400">
              {hasSearched ? (
                <>Showing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong></>
              ) : (
                "Enter a search query to explore the corpus."
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sort by:</span>
              <select className="bg-transparent border-none text-emerald-400 font-bold focus:outline-none cursor-pointer">
                <option>Relevance Score</option>
                <option>Date Added</option>
              </select>
            </div>
          </div>

          {/* Empty State */}
          {hasSearched && !isSearching && results.length === 0 && (
            <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
              <Search className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-slate-400">We couldn't find any transcripts matching your criteria. Try adjusting your keywords or clearing filters.</p>
            </div>
          )}

          {/* Map through the live results */}
          {results.map((result, idx) => (
            <div key={idx} className="bg-[#0B1120] border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-emerald-500/50 transition-colors group">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                    <BookOpen size={20} className="text-emerald-400" /> {result.title}
                    <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded ml-2">{result.genre}</span>
                  </h3>
                  <p className="text-slate-500 text-xs">Source: {result.source} • {result.words} words</p>
                </div>
                
                {/* Match Confidence Score */}
                <div className="text-right flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-sm">Match Score</p>
                    <p className="text-slate-500 text-[10px]">{result.confidence}% Match Confidence</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-500/10">
                    <span className="text-emerald-400 font-bold">{result.confidence}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                {result.snippet}
              </p>

              <div className="flex justify-between items-end flex-wrap gap-4">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                  {result.matchedIn && (
                    <span className="bg-slate-800 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded-lg uppercase">
                      MATCHED IN: {result.matchedIn}
                    </span>
                  )}
                  {result.sentiment && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Smile size={14}/> {result.sentiment}
                    </span>
                  )}
                  {result.emotion && (
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Smile size={14}/> {result.emotion}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => navigate(`/insights?id=${result.id}`)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-sm group-hover:translate-x-1 transition-transform"
                >
                  View Detail <ArrowRight size={16} />
                </button>
              </div>

              {result.characters && result.characters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-end">
                  <p className="text-xs text-slate-500 flex gap-2">
                    <Users size={14}/> {result.characters.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-800/50">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isSearching}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-sm font-bold rounded-lg transition-colors border border-slate-700"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2 text-sm text-slate-500">
                Page <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white font-bold rounded border border-slate-700">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
              </div>

              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isSearching}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-sm font-bold rounded-lg transition-colors border border-slate-700"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}