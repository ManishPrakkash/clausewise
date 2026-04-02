import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Globe, 
  MapPin,
  ChevronRight,
  Database,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import reportGenerator from '../utils/reportGenerator';

const VerificationResults = ({ setIsAuthenticated }) => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const results = JSON.parse(localStorage.getItem('landVerificationResults')) || [];
    const foundResult = results.find(r => r.id === id);
    setResult(foundResult);
    setTimeout(() => setLoading(false), 800);
  }, [id]);

  const downloadReport = (format = 'pdf') => {
    if (!result) return;
    if (format === 'pdf') {
      const filename = `land_verification_report_${result.documentName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      reportGenerator.downloadReport(result, filename);
    } else {
      const reportData = { ...result, verificationDate: new Date().toLocaleDateString() };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `land_verification_report_${result.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-white/5 rounded-full" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-16 h-16 border-t-2 border-white rounded-full"
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Syncing with Registry...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center spellbook-glass p-12 rounded-[32px]">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-serif mb-4">Record Missing</h2>
          <Link to="/land-verification" className="spellbook-btn-secondary">Begin New Audit</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background text-white selection:bg-white/10">
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-12">
            <Link to="/history" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              History Archive
            </Link>
            <div className="flex gap-3">
              <button onClick={() => downloadReport('pdf')} className="spellbook-btn-secondary py-2 px-6 text-xs group">
                <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                Export Ledger
              </button>
            </div>
          </div>

          {/* Status Hero */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`spellbook-glass p-12 rounded-[40px] mb-12 relative overflow-hidden text-center border-t-2 ${result.isLegal ? 'border-emerald-500/20' : 'border-red-500/20'}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 bg-white/5 border ${result.isLegal ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
              {result.isLegal ? <ShieldCheck className="w-10 h-10 text-emerald-400" /> : <AlertTriangle className="w-10 h-10 text-red-400" />}
            </div>
            
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-4 block">Audit Conclusion</span>
            <h1 className="text-4xl md:text-5xl font-serif mb-6">
              {result.isLegal ? 'Territory Validated' : 'Discrepancy Detected'}
            </h1>
            <p className="text-white/40 max-w-lg mx-auto mb-10 text-sm">
              The neural cross-reference with regional land registries has concluded for {result.documentName}.
            </p>

            <div className="flex justify-center gap-12 border-t border-white/5 pt-10">
              <div>
                <p className="text-[10px] uppercase font-bold text-white/20 mb-1">Authenticity</p>
                <p className="text-2xl font-serif">{result.confidence}%</p>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div>
                <p className="text-[10px] uppercase font-bold text-white/20 mb-1">State Type</p>
                <p className="text-2xl font-serif text-emerald-400/80">{result.ownershipType}</p>
              </div>
            </div>

            <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 ${result.isLegal ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Information Grid */}
            <div className="spellbook-glass p-8 rounded-[32px] space-y-8">
              <div className="flex items-center gap-3 text-white/40 mb-2">
                <Database className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Metadata Extraction</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-6 text-sm">
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Survey Identifier</p>
                  <p className="font-serif">{result.surveyNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Dimension</p>
                  <p className="font-serif">{result.area}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Owner of Record</p>
                  <p className="font-serif">{result.owner}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Village</p>
                  <p className="font-serif">{result.village}</p>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="spellbook-glass p-8 rounded-[32px] space-y-6">
              <div className="flex items-center gap-3 text-white/40 mb-2">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Protocol Checks</span>
              </div>

              <div className="space-y-4">
                {Object.entries(result.verificationDetails).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-xs text-white/60 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                        value === true || value === 'Registered' || value === 'Current' 
                          ? 'text-emerald-400' 
                          : 'text-red-400'
                      }`}>
                        {typeof value === 'boolean' ? (value ? 'Verified' : 'Flagged') : value}
                      </span>
                      {value === true || value === 'Registered' || value === 'Current' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400/40" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-500/40" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Discrepancies */}
          <AnimatePresence>
            {result.discrepancies && result.discrepancies.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 rounded-[32px] bg-red-500/[0.03] border border-red-500/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-serif text-red-200">Critical Observations</h2>
                </div>
                <ul className="space-y-4">
                  {result.discrepancies.map((d, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm text-red-200/50 italic border-l-2 border-red-500/20 pl-6 py-2">
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] aura-glow opacity-5 pointer-events-none" />
    </div>
  );
};

export default VerificationResults;
