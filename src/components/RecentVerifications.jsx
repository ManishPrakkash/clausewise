import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  Eye, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import reportGenerator from '../utils/reportGenerator';

const RecentVerifications = () => {
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    const results = JSON.parse(localStorage.getItem('landVerificationResults')) || [];
    setRecentResults(results.slice(0, 5));
  }, []);

  const downloadReport = (result, format = 'pdf') => {
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

  if (recentResults.length === 0) {
    return (
      <div className="spellbook-glass p-12 rounded-[32px] text-center border-white/5">
        <MapPin className="mx-auto h-12 w-12 text-white/5 mb-6" />
        <p className="text-white/20 italic text-sm">
          No historical validations found in this registry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentResults.map((result, idx) => (
        <motion.div
          key={result.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="spellbook-glass p-6 rounded-[28px] group hover:bg-white/[0.04] transition-all border-white/5 hover:border-white/10"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${result.isLegal ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
              {result.isLegal ? <ShieldCheck className="w-5 h-5 text-emerald-400/60" /> : <ShieldAlert className="w-5 h-5 text-red-500/60" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-serif truncate text-white/80 group-hover:text-white transition-colors">
                  {result.documentName}
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-widest font-bold ${
                  result.isLegal ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {result.isLegal ? 'Verified' : 'Flagged'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-white/20">
                <span className="flex items-center gap-2"><FileText className="w-3 h-3" /> {result.documentType}</span>
                <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {result.surveyNumber}</span>
                <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {result.uploadDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to={`/verification-results/${result.id}`}
                className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="View Conclusion"
              >
                <Eye className="w-5 h-5" />
              </Link>
              
              <button
                onClick={() => downloadReport(result, 'pdf')}
                className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="Export Audit"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecentVerifications;
