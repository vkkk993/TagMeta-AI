import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import UploadParse from './pages/UploadParse';
import SearchTranscripts from './pages/SearchTranscripts'; 
import ContentInsights from './pages/ContentInsights';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-[#0f172a] overflow-hidden font-sans">
        {/* Left Navigation */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          
          {/* Page Routing */}
          <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadParse />} />
              { <Route path="/search" element={<SearchTranscripts />} /> }
              {<Route path="/insights" element={<ContentInsights />} /> }
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}