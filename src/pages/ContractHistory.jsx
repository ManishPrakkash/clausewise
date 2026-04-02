import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  FileText, 
  Map as MapIcon, 
  Eye, 
  Download, 
  FileStack,
  History,
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import reportGenerator from '../utils/reportGenerator';

const ContractHistory = ({ setIsAuthenticated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('contracts');
  const [contractHistory, setContractHistory] = useState([]);
  const [landVerificationHistory, setLandVerificationHistory] = useState([]);

  useEffect(() => {
    localStorage.setItem('lastVisitedPage', 'history');

    const contracts = JSON.parse(localStorage.getItem('ocrHistory')) || [];
    const formattedContracts = contracts.map((item, index) => ({
      id: index + 1,
      title: item.name || 'Untitled Contract',
      dateScanned: new Date(item.timestamp || Date.now()).toLocaleDateString(),
      status: item.status || 'Verified',
      alerts: item.detailedSections?.reduce((acc, s) => acc + (s.alerts?.length || 0), 0) || 0,
      type: 'contract'
    }));
    setContractHistory(formattedContracts.reverse());

    const landResults = JSON.parse(localStorage.getItem('landVerificationResults')) || [];
    const formattedLandResults = landResults.map(result => ({
      id: result.id,
      title: result.documentName,
      dateScanned: result.uploadDate,
      status: result.status,
      alerts: result.discrepancies?.length || 0,
      type: 'land-verification',
      isLegal: result.isLegal,
      ownershipType: result.ownershipType
    }));
    setLandVerificationHistory(formattedLandResults);
  }, []);

  const getCurrentHistory = () => activeTab === 'contracts' ? contractHistory : landVerificationHistory;

  const filteredHistory = getCurrentHistory().filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === '' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-brand-background text-white selection:bg-white/10">
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 text-white/40 mb-4">
              <History className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Archives</span>
            </div>
            <h1 className="text-5xl font-serif mb-4">Intelligence History</h1>
            <p className="text-white/40 max-w-xl">
              Access the complete ledger of your processed documents and verification results.
            </p>
          </motion.div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="flex-1 spellbook-glass p-1 rounded-2xl flex">
              <button 
                onClick={() => setActiveTab('contracts')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'contracts' ? 'bg-white text-brand-background shadow-glow' : 'text-white/40 hover:text-white/60'}`}
              >
                Contracts ({contractHistory.length})
              </button>
              <button 
                onClick={() => setActiveTab('land-verification')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'land-verification' ? 'bg-white text-brand-background shadow-glow' : 'text-white/40 hover:text-white/60'}`}
              >
                Land Records ({landVerificationHistory.length})
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="relative group flex-1 lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
                <input 
                  type="text"
                  placeholder="Filter by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                />
              </div>
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl pl-10 pr-8 py-3 text-xs focus:outline-none focus:border-white/20 appearance-none text-white/60 uppercase font-bold tracking-widest"
                >
                  <option value="" className="bg-brand-background">All States</option>
                  <option value="Verified" className="bg-brand-background">Verified</option>
                  <option value="Processing" className="bg-brand-background">In-Progress</option>
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((doc, idx) => (
                  <motion.div
                    key={`${doc.type}-${doc.id}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="spellbook-glass p-4 rounded-[28px] group hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/30 transition-all">
                        {activeTab === 'contracts' ? <FileText className="w-6 h-6 text-white/40" /> : <MapIcon className="w-6 h-6 text-white/40" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-serif mb-1 truncate">{doc.title}</h3>
                        <div className="flex flex-wrap items-center gap-6 text-[10px] uppercase font-bold tracking-widest">
                          <span className="text-white/20">{doc.dateScanned}</span>
                          {doc.alerts > 0 ? (
                            <span className="text-red-400 flex items-center gap-2">
                              <ShieldAlert className="w-3 h-3" />
                              {doc.alerts} Risks
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-2">
                              <ShieldCheck className="w-3 h-3" />
                              Passed
                            </span>
                          )}
                          <span className="text-white/40">{doc.ownershipType || (activeTab === 'contracts' ? 'LEGAL DEED' : 'PROPERTY RECORD')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to={activeTab === 'contracts' ? `/analysis/${doc.id}` : `/verification-results/${doc.id}`}
                          className="spellbook-btn-secondary py-3 px-8 text-xs group/btn flex items-center gap-3"
                        >
                          Access Report
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="spellbook-glass p-20 rounded-[40px] text-center">
                <FileStack className="w-12 h-12 text-white/10 mx-auto mb-6" />
                <p className="text-white/20 italic">No historical records match your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] aura-glow opacity-5 pointer-events-none" />
    </div>
  );
};

export default ContractHistory;
