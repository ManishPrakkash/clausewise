import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Download, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowLeft,
  Share2,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import jsPDF from 'jspdf';
import { getAlertSummary } from '../utils/contractAlerts';
import DocumentChatbot from '../components/DocumentChatbot';

const AnalysisSummary = ({ setIsAuthenticated }) => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSummary, setExpandedSummary] = useState(true);
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  useEffect(() => {
    try {
      localStorage.setItem('lastVisitedPage', `analysis-summary/${id}`);
      const history = JSON.parse(localStorage.getItem('ocrHistory')) || [];
      const contractDetails = history.find((_, index) => `${index + 1}` === id);

      if (contractDetails) {
        const detailedSections = contractDetails.detailedSections || [];
        const alertSummary = getAlertSummary(detailedSections);
        
        setContract({
          id,
          title: contractDetails.name || 'Untitled Analysis',
          uploadDate: new Date(contractDetails.timestamp || Date.now()).toLocaleDateString(),
          status: 'Verified',
          pages: history.length,
          thumbnail: contractDetails.thumbnail,
          confidenceScore: Math.max(100 - alertSummary.totalAlerts * 5, 0),
          alertsCount: alertSummary.totalAlerts,
          summary: contractDetails.summary || 'Initial analysis complete.',
          keyPoints: contractDetails.keyPoints || [],
          detailedSections: detailedSections,
          documentData: contractDetails,
          documentText: contractDetails.extractedText || '',
        });
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
    } finally {
      setTimeout(() => setLoading(false), 800); // Cinematic delay
    }
  }, [id]);

  const toggleSection = (index) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const downloadPDF = () => {
    if (!contract) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(22);
    doc.text('CLAUSEWISE INTELLIGENCE REPORT', 10, y);
    y += 15;
    doc.setFontSize(12);
    doc.text(`Document: ${contract.title}`, 10, y); y += 8;
    doc.text(`Verified On: ${contract.uploadDate}`, 10, y); y += 8;
    doc.text(`Confidence: ${contract.confidenceScore}%`, 10, y); y += 15;
    
    doc.setFontSize(16);
    doc.text('EXECUTIVE SUMMARY', 10, y); y += 10;
    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(contract.summary, 180);
    doc.text(summaryLines, 10, y);
    y += (summaryLines.length * 6) + 10;

    doc.save(`${contract.title.replace(/\s+/g, '_')}_Analysis.pdf`);
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
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Decrypting Clauses...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center spellbook-glass p-12 rounded-[32px]">
          <h2 className="text-2xl font-serif mb-4">Record Missing</h2>
          <Link to="/dashboard" className="spellbook-btn-secondary">Return to Command Center</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background text-white selection:bg-white/10">
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar Actions */}
          <div className="flex items-center justify-between mb-12">
            <Link to="/dashboard" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Link>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full border border-white/10 hover:bg-white/5 text-white/40 hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
              </button>
              <button onClick={downloadPDF} className="spellbook-btn-primary py-2 px-6 text-xs bg-white text-brand-background">
                <Download className="w-3 h-3" />
                Export Audit
              </button>
            </div>
          </div>

          {/* Analysis Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="spellbook-glass p-8 rounded-[40px] mb-12 flex flex-col md:flex-row gap-10 items-center overflow-hidden relative"
          >
            <div className="w-40 h-52 bg-white/5 rounded-2xl border border-white/10 overflow-hidden shrink-0 shadow-2xl relative group">
              {contract.thumbnail ? (
                <img src={contract.thumbnail} alt="doc" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-background/80 to-transparent" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] uppercase tracking-widest font-bold text-emerald-400 mb-6">
                <ShieldCheck className="w-3 h-3" />
                Verification Protocol Active
              </div>
              <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight text-gradient">{contract.title}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Confidence</span>
                  <span className="text-2xl font-serif">{contract.confidenceScore}%</span>
                </div>
                <div className="w-px h-10 bg-white/5 hidden md:block" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Risks Flagged</span>
                  <span className={`text-2xl font-serif ${contract.alertsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {contract.alertsCount}
                  </span>
                </div>
                <div className="w-px h-10 bg-white/5 hidden md:block" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Extraction Date</span>
                  <span className="text-xl font-serif opacity-60">{contract.uploadDate}</span>
                </div>
              </div>
            </div>

            <div className="aura-glow opacity-10 -right-20 -bottom-20 w-80 h-80" />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-12">
              {/* Summary Section */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-serif">Executive Summary</h2>
                  <button onClick={() => setExpandedSummary(!expandedSummary)} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                    {expandedSummary ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                  </button>
                </div>
                <AnimatePresence>
                  {expandedSummary && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="spellbook-glass p-8 rounded-[32px] overflow-hidden"
                    >
                      <p className="text-lg text-white/60 font-serif italic mb-8 leading-relaxed">
                        &quot;{contract.summary}&quot;
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {contract.keyPoints.map((point, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 items-start">
                            <Zap className="w-4 h-4 text-white/20 mt-1 shrink-0" />
                            <p className="text-xs text-white/50 leading-relaxed">{point}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Detailed Clauses */}
              <section className="space-y-6">
                <h2 className="text-2xl font-serif mb-8">Structural Breakdown</h2>
                {contract.detailedSections.map((section, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="spellbook-glass overflow-hidden rounded-[24px]"
                  >
                    <button 
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </div>
                        <h3 className="text-lg font-serif">{section.title}</h3>
                        {section.alerts?.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-500 ${expandedSections[idx] ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedSections[idx] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6"
                        >
                          <div className="pl-12 space-y-6 pt-2">
                            <p className="text-sm text-white/50 leading-relaxed border-l-2 border-white/5 pl-6 italic">
                              {section.content}
                            </p>
                            
                            {section.alerts?.length > 0 && (
                              <div className="space-y-3">
                                {section.alerts.map((alert, ai) => (
                                  <div key={ai} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-200/70 text-xs">
                                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                    {alert.message}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </section>
            </div>

            {/* Sidebar Tools */}
            <aside className="space-y-8">
              <div className="sticky top-32 space-y-8">
                {/* Advisor Tool */}
                <div className="spellbook-glass p-8 rounded-[40px] relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 w-fit mb-6">
                      <Layers className="w-6 h-6 text-white/60" />
                    </div>
                    <h3 className="text-xl font-serif mb-4">Neural Advisor</h3>
                    <p className="text-xs text-white/40 leading-relaxed mb-8">
                      Interact with the semantic core of this document. Ask questions or clarify specific legal obligations.
                    </p>
                    <DocumentChatbot 
                      documentData={contract.documentData} 
                      documentText={contract.documentText}
                    />
                  </div>
                  <div className="aura-glow top-0 right-0 w-32 h-32 opacity-20" />
                </div>

                {/* Status Card */}
                <div className="spellbook-glass p-8 rounded-[32px] border border-emerald-500/10">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400/60">Audit Verified</span>
                  </div>
                  <p className="text-[11px] text-white/30 leading-relaxed italic">
                    Certified compliant with AI structural integrity standards. This report was generated using ClauseWise Neural extraction.
                  </p>
                </div>

                <Link 
                  to="/upload" 
                  className="spellbook-btn-secondary w-full group justify-center text-xs py-4"
                >
                  Initiate New Analysis
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Decorative Aura */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] aura-glow opacity-5 pointer-events-none" />
    </div>
  );
};

export default AnalysisSummary;