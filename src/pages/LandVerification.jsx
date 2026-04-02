import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
  Loader2, 
  FileText, 
  X, 
  Download, 
  History, 
  ShieldCheck, 
  Search,
  MapPin,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import documentExtractor from '../utils/documentExtractor';
import RecentVerifications from '../components/RecentVerifications';

const LandVerification = ({ setIsAuthenticated }) => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      setError('Some documents were excluded due to incompatible format or size constraints.');
    } else {
      setError('');
    }

    setFiles(prevFiles => [...prevFiles, ...validFiles].slice(0, 10));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const processLandDocuments = async () => {
    if (files.length === 0) return setError('At least one land record is required for verification.');
    setIsProcessing(true);
    setError('');

    try {
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const verificationResult = await documentExtractor.processDocument(file);
          results.push({
            ...verificationResult,
            id: verificationResult.id || Date.now().toString() + i,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            id: Date.now().toString() + i,
            documentName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            status: 'Extraction Failed',
            isLegal: false,
            ownershipType: 'Unknown',
            discrepancies: ['Optical character recognition failure'],
            timestamp: new Date().toISOString()
          });
        }
      }

      const existingResults = JSON.parse(localStorage.getItem('landVerificationResults')) || [];
      results.forEach(result => existingResults.unshift(result));
      localStorage.setItem('landVerificationResults', JSON.stringify(existingResults));
      navigate(`/verification-results/${results[0].id}`);
    } catch (err) {
      setError('Verification engine encountered an internal disruption.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-white selection:bg-white/10">
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 text-white/40 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Territorial Audit</span>
            </div>
            <h1 className="text-5xl font-serif mb-4 text-gradient">Land Verification</h1>
            <p className="text-white/40 max-w-xl">
              Cross-reference your territorial deeds with government archives using our neural validation engine.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Dropzone */}
              <motion.div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`spellbook-glass p-12 rounded-[40px] border-2 border-dashed transition-all duration-500 text-center relative overflow-hidden group
                  ${dragOver ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
              >
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 transition-transform duration-500 ${dragOver ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Upload className="w-6 h-6 text-white/40" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Deposit Records</h3>
                  <p className="text-xs text-white/30 mb-8 max-w-xs mx-auto italic">
                    Supported: Patta, Chitta, FMB, and Title Deeds (PDF/Image)
                  </p>
                  
                  <label className="spellbook-btn-secondary py-3 px-8 text-xs cursor-pointer inline-flex">
                    Select Archives
                    <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e.target.files)} disabled={isProcessing} />
                  </label>
                </div>
                {dragOver && <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />}
              </motion.div>

              {/* Files Queue */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/20 px-4">Extraction Queue ({files.length}/10)</h4>
                    {files.map((file, idx) => (
                      <motion.div 
                        key={idx}
                        className="spellbook-glass p-4 rounded-2xl flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all">
                            <FileText className="w-4 h-4 text-white/20" />
                          </div>
                          <div>
                            <p className="text-xs font-medium truncate max-w-xs">{file.name}</p>
                            <p className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1]}</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(idx)} className="p-2 text-white/10 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="spellbook-glass p-8 rounded-[40px] space-y-6">
                <div className="flex items-center gap-3 text-white/60 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Verification Logic</span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed italic">
                  Documents are analyzed for survey number authenticity and matched against regional land registries in real-time.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] uppercase text-white/20 font-bold">E-Service Link</span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] uppercase text-white/20 font-bold">Optical Engine</span>
                    <span className="text-[10px] text-white/60 font-bold uppercase">Neural</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-6 rounded-[32px] bg-red-500/5 border border-red-500/10 text-red-200/80 text-[10px] uppercase tracking-widest font-bold flex items-center gap-4">
                  <Info className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={processLandDocuments}
                disabled={files.length === 0 || isProcessing}
                className="spellbook-btn-primary w-full py-4 text-xs group justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Territory...
                  </>
                ) : (
                  <>
                    Verify Records
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-20">
            <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="text-2xl font-serif">Recent Validations</h2>
              <Link to="/history" className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </Link>
            </div>
            <RecentVerifications />
          </div>
        </div>
      </main>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] aura-glow opacity-5 pointer-events-none" />
    </div>
  );
};

export default LandVerification;
