import { useState, useRef } from 'react';
import { UploadCloud, FileText, Download, AlertCircle, Loader2, Sparkles, Tags, Users, MessageSquareQuote } from 'lucide-react';

export default function UploadParse() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [resultData, setResultData] = useState(null);
    const fileInputRef = useRef(null);

    const handleBoxClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const processFile = async (file) => {
        if (!file) return;

        const allowedExtensions = ['txt', 'vtt', 'pdf'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExt)) {
            setUploadStatus('error');
            setErrorMessage(`Invalid format: .${fileExt}. Only .TXT, .VTT, and .PDF transcript files are supported.`);
            setSelectedFile(null);
            setResultData(null);
            return;
        }

        setSelectedFile(file);
        setUploadStatus('uploading');
        setErrorMessage('');
        setResultData(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:5000/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setUploadStatus('error');
                setErrorMessage(data.error || 'Failed to process the uploaded file.');
            } else {
                setUploadStatus('success');
                setResultData(data);
            }
        } catch (err) {
            console.error('Upload Error:', err);
            setUploadStatus('error');
            setErrorMessage('Could not connect to backend server. Please verify Flask is running on port 5000.');
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const handleExportCSV = () => {
        if (!selectedFile || !resultData?.metadata) return;
        const meta = resultData.metadata;

        const headers = [
            'File Name',
            'Genre',
            'Subgenres',
            'Sentiment',
            'Emotion',
            'AI Summary',
            'Topics',
            'Named Entities',
            'Memorable Quotes'
        ];

        // Safely extract names from objects for the CSV export
        const formattedTopics = (meta.topics || []).map(t => typeof t === 'string' ? t : t.theme).join('; ');
        const formattedEntities = (meta.named_entities || []).map(e => typeof e === 'string' ? e : e.name).join('; ');

        const row = [
            `"${selectedFile.name}"`,
            `"${meta.genre || 'Unavailable'}"`,
            `"${(meta.subgenres || []).join('; ')}"`,
            `"${meta.sentiment || 'Unavailable'}"`,
            `"${meta.emotion || 'Unavailable'}"`,
            `"${(meta.ai_summary || '').replace(/"/g, '""')}"`,
            `"${formattedTopics}"`,
            `"${formattedEntities}"`,
            `"${(meta.memorable_quotes || []).map(q => `${q.speaker}: "${q.quote_text}"`).join(' | ').replace(/"/g, '""')}"`
        ];

        const csvContent = '\uFEFF' + [headers.join(','), row.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedFile.name.replace(/\.[^/.]+$/, '')}_full_metadata.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-white">Transcript & Screenplay Upload Station</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Upload plain text, WebVTT subtitle files, or PDF screenplays for automatic NLP ingestion and metadata extraction.
                </p>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.vtt,.pdf" />

            <div onClick={handleBoxClick} className={`border-2 border-dashed rounded-xl p-14 flex flex-col items-center justify-center transition-all cursor-pointer group ${uploadStatus === 'uploading' ? 'border-emerald-500 bg-slate-900/60 pointer-events-none' : 'border-emerald-500/40 bg-slate-900/40 hover:bg-slate-900/80 hover:border-emerald-500'}`}>
                {uploadStatus === 'uploading' ? (
                    <>
                        <Loader2 size={48} className="text-emerald-400 mb-4 animate-spin" />
                        <h3 className="text-lg font-bold text-white mb-1">AI Pipeline Executing...</h3>
                        <p className="text-slate-400 text-sm">Extracting story logic, entities, and precise quotes.</p>
                    </>
                ) : (
                    <>
                        <UploadCloud size={48} className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-bold text-white mb-1">Click to browse file</h3>
                        <p className="text-slate-400 text-sm">Supported formats: <span className="text-emerald-400 font-semibold">.TXT, .VTT, .PDF</span> (Max 25MB)</p>
                    </>
                )}
            </div>

            {uploadStatus === 'error' && (
                <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-sm">
                    <AlertCircle size={20} className="text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {uploadStatus === 'success' && resultData?.metadata && (
                <div className="space-y-6 animate-fade-in mt-8">
                    {/* Success Header & Export */}
                    <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-full">
                                <FileText className="text-emerald-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-emerald-400 font-bold text-lg">{selectedFile.name}</h3>
                                <p className="text-emerald-500/70 text-sm">Processing Complete • {(selectedFile.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
                            <Download size={16} /> Export Full Metadata (CSV)
                        </button>
                    </div>

                    {/* AI Narrative Summary */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                            <Sparkles className="text-blue-400" size={20} /> AI Story Summary
                        </h3>
                        <p className="text-slate-300 leading-relaxed">{resultData.metadata.ai_summary}</p>
                    </div>

                    {/* Grid for Tags & Entities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Tags className="text-purple-400" size={18} /> Classification & Topics
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="text-slate-500 block mb-1">Genre</span>
                                    <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">{resultData.metadata.genre}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-1">Topics</span>
                                    <div className="flex flex-wrap gap-2">
                                        {resultData.metadata.topics?.map((topic, i) => {
                                            const themeName = typeof topic === 'string' ? topic : topic.theme;
                                            return <span key={i} className="bg-slate-700 text-slate-300 px-2 py-1 rounded">{themeName}</span>
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Users className="text-orange-400" size={18} /> Named Entities
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {resultData.metadata.named_entities?.map((entity, i) => {
                                    const entityName = typeof entity === 'string' ? entity : entity.name;
                                    return (
                                        <span key={i} className="bg-orange-500/10 border border-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm">
                                            {entityName}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Exact Memorable Quotes */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                            <MessageSquareQuote className="text-emerald-400" size={20} /> Memorable Quotes
                        </h3>
                        <div className="space-y-4">
                            {resultData.metadata.memorable_quotes?.map((quote, i) => (
                                <div key={i} className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-emerald-500">
                                    <p className="text-slate-200 italic mb-2">"{quote.quote_text}"</p>
                                    <p className="text-emerald-500 font-bold text-sm">— {quote.speaker}</p>
                                    {quote.reason && <p className="text-slate-500 text-xs mt-1">Context: {quote.reason}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}