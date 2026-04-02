import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  FileText, 
  Clock, 
  CheckCircle, 
  ArrowUpRight,
  LayoutGrid,
  List,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';

const Dashboard = ({ setIsAuthenticated }) => {
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({
    totalContracts: 0,
    alertsFound: 0,
    pendingContracts: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem('lastVisitedPage', 'dashboard');
      const history = JSON.parse(localStorage.getItem('ocrHistory')) || [];
      const formattedContracts = history
        .map((item, index) => ({
          id: item.id || `${index + 1}`,
          title: item.name || 'Untitled Analysis',
          uploadDate: new Date(item.timestamp || Date.now()).toLocaleDateString(),
          status: item.status || 'Verified',
          thumbnail: item.thumbnail,
          alertsCount: item.detailedSections?.reduce((acc, s) => acc + (s.alerts?.length || 0), 0) || 0,
          summary: item.summary || 'Initial analysis complete.',
          realIndex: index + 1
        }))
        .reverse();

      setContracts(formattedContracts);
      setStats({
        totalContracts: formattedContracts.length,
        alertsFound: formattedContracts.reduce((acc, c) => acc + (c.alertsCount || 0), 0),
        pendingContracts: formattedContracts.filter(c => c.status === 'Processing').length
      });
    } catch (err) {
      console.error('Dashboard initialization error:', err);
    }
  }, []);

  const filteredContracts = contracts.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === '' || c.status === filterStatus)
  );

  return (
    <div className="min-h-screen bg-brand-background text-white selection:bg-white/10">
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl font-serif mb-4">Command Center</h1>
              <p className="text-white/40 max-w-sm">
                Overview of your legal intelligence landscape and recent document audits.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
                <input 
                  type="text"
                  placeholder="Search repository..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="spellbook-glass bg-white/[0.02] pl-10 pr-6 py-3 rounded-full text-sm focus:outline-none focus:border-white/20 transition-all w-64"
                />
              </div>
              <Link to="/upload" className="spellbook-btn-primary py-3">
                <Plus className="w-4 h-4" />
                New Analysis
              </Link>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <motion.div 
              whileHover={{ y: -5 }}
              className="spellbook-glass p-8 rounded-[32px] relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Layers className="w-6 h-6 text-white/60" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Document Repository</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-serif mb-1">{stats.totalContracts}</p>
                  <p className="text-xs text-white/40">Total Audits Performed</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="spellbook-glass p-8 rounded-[32px] relative overflow-hidden group border-red-500/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-red-400/40 font-bold">Critical Insights</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-serif mb-1 text-red-200">{stats.alertsFound}</p>
                  <p className="text-xs text-white/40">Active Risk Notifications</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="spellbook-glass p-8 rounded-[32px] relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Clock className="w-6 h-6 text-white/60" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Queue Status</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-serif mb-1">{stats.pendingContracts}</p>
                  <p className="text-xs text-white/40">In-Progress Extractions</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          </div>

          {/* Activity List */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif">Audit Records</h2>
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                <button 
                  onClick={() => setFilterStatus('')}
                  className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all ${filterStatus === '' ? 'bg-white text-brand-background shadow-glow' : 'hover:bg-white/5 text-white/40'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterStatus('Verified')}
                  className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all ${filterStatus === 'Verified' ? 'bg-white text-brand-background shadow-glow' : 'hover:bg-white/5 text-white/40'}`}
                >
                  Verified
                </button>
              </div>
            </div>

            {filteredContracts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="spellbook-glass p-20 rounded-[32px] text-center"
              >
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/40 text-sm mb-8 italic">Your intelligence repository is currently empty.</p>
                <Link to="/upload" className="spellbook-btn-secondary inline-flex">
                  Begin First Audit
                </Link>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredContracts.map((contract) => (
                    <motion.div
                      key={contract.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="spellbook-glass p-2 rounded-3xl group relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6 p-4">
                        <div className="w-24 h-32 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0 group-hover:border-white/30 transition-all duration-500">
                          {contract.thumbnail ? (
                            <img src={contract.thumbnail} alt="doc" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-muted/20">
                              <FileText className="w-8 h-8 text-white/20" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-serif truncate">{contract.title}</h3>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold text-white/40">
                              ID: {contract.id.slice(-6)}
                            </span>
                          </div>
                          <p className="text-sm text-white/30 truncate mb-4">
                            {contract.summary}
                          </p>
                          <div className="flex flex-wrap items-center gap-6 text-[10px] uppercase tracking-widest font-bold">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-white/30" />
                              <span className="text-white/40">{contract.uploadDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {contract.alertsCount > 0 ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-red-400" />
                                  <span className="text-red-400/80">{contract.alertsCount} Risks Detected</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400/80">Zero Risks Found</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              <span className="text-blue-400/80">{contract.status}</span>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/analysis/${contract.realIndex}`}
                          className="spellbook-btn-secondary py-3 px-8 text-xs group/btn"
                        >
                          View Report
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                      
                      {/* Hover Aura */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-white/[0.05] transition-all" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed top-1/2 left-0 w-[500px] h-[500px] aura-glow opacity-5 -translate-x-1/2" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] aura-glow opacity-5 lg:opacity-10 translate-x-1/4 translate-y-1/4" />
    </div>
  );
};

export default Dashboard;