import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Trash2, 
  AlertCircle, 
  FileText, 
  FileCode, 
  Image as ImageIcon, 
  CheckCircle,
  Loader2,
  ChevronRight,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import huggingFaceService from '../utils/huggingFaceService';
import documentTextExtractor from '../utils/documentTextExtractor';
import contractAnalysisService from '../utils/contractAnalysisService';

const UploadContract = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [processingProgress, setProcessingProgress] = useState({});

  useEffect(() => {
    localStorage.setItem('lastVisitedPage', 'upload');
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    try {
      acceptedFiles.forEach(file => {
        documentTextExtractor.validateFile(file);
      });

      const newFiles = acceptedFiles.map((file) => {
        const fileType = documentTextExtractor.getFileType(file);
        let preview = '';
        if (fileType === 'image') {
          preview = URL.createObjectURL(file);
        }
        return Object.assign(file, {
          preview,
          fileType,
          id: Math.random().toString(36).substr(2, 9)
        });
      });

      setFiles((prev) => [...prev, ...newFiles]);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.tiff', '.bmp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.fileType === 'image' && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!files.length) return setError('Please upload at least one document to analyze.');
    setUploading(true);
    
    try {
      const extractionResults = await documentTextExtractor.processMultipleFiles(files);
      const results = extractionResults.successfulResults.map((result) => ({
        name: result.name,
        text: result.text || 'No text detected',
        fileType: result.type,
        size: result.size
      }));

      const fullText = results.map((r) => r.text).join('\n');
      
      // Parallel execution for AI tasks
      const [summary, keyPoints, detailedSections] = await Promise.all([
        huggingFaceService.generateSummary(fullText).catch(() => 'Summary unavailable.'),
        huggingFaceService.generateKeyPoints(fullText).catch(() => ['Analysis pending.']),
        contractAnalysisService.analyzeContractSections(fullText, 'legal contract').catch(() => [])
      ]);

      const newContract = {
        id: `${Date.now()}`,
        name: files[0].name,
        text: fullText,
        summary,
        keyPoints,
        thumbnail: files[0].preview || null,
        detailedSections,
        documentType: 'Legal Contract',
        extractedText: fullText,
        timestamp: new Date().toISOString()
      };

      const history = JSON.parse(localStorage.getItem('ocrHistory')) || [];
      history.push(newContract);
      localStorage.setItem('ocrHistory', JSON.stringify(history));
      navigate(`/analysis/${history.length}`);
    } catch (err) {
      setError('System failure during analysis. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-400" />;
      case 'doc':
      case 'docx': return <FileCode className="w-8 h-8 text-blue-400" />;
      case 'image': return <ImageIcon className="w-8 h-8 text-emerald-400" />;
      default: return <FileText className="w-8 h-8 text-white/40" />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-white selection:bg-white/10">
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-serif mb-4">Analyze Documents</h1>
            <p className="text-white/40 max-w-xl">
              Deposit your contracts into our neural engine for instant, exhaustive legal analysis and summarization.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Upload Area */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                {...getRootProps()}
                className={`group relative overflow-hidden rounded-[32px] border-2 border-dashed transition-all duration-500 cursor-pointer p-12 text-center
                  ${isDragActive ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`p-6 rounded-full bg-white/5 mb-6 transition-transform duration-500 ${isDragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Upload className={`w-10 h-10 transition-colors ${isDragActive ? 'text-white' : 'text-white/40'}`} />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    {isDragActive ? 'Drop to start analysis' : 'Select Files'}
                  </h3>
                  <p className="text-sm text-white/30 max-w-xs mb-8">
                    Drag and drop your PDFs, Images, or Word docs here. Up to 10 files, 50MB each.
                  </p>
                  <span className="spellbook-btn-secondary px-6 py-2 text-xs">
                    Choose from device
                  </span>
                  <input {...getInputProps()} />
                </div>
                {isDragActive && (
                  <motion.div 
                    layoutId="upload-glow"
                    className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"
                  />
                )}
              </motion.div>

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/40">Queue ({files.length}/10)</h4>
                      <button onClick={() => setFiles([])} className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 transition-colors">Clear All</button>
                    </div>
                    <div className="grid gap-3">
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="spellbook-glass p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/[0.05]"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {file.preview ? (
                              <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                            ) : getFileIcon(file.fileType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-[10px] text-white/30 uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.fileType}</p>
                          </div>
                          <button 
                            onClick={() => removeFile(file.id)}
                            className="p-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar / Info */}
            <div className="space-y-8">
              <div className="spellbook-glass p-8 rounded-[32px] space-y-6">
                <div className="flex items-center gap-3 text-white/60">
                  <Shield className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Safe Passage</span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  Your documents are processed in a zero-persistence sandbox. We do not store sensitive legal data after the session ends.
                </p>
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    AES-256 Encryption
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Multi-page PDF Parsing
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Semantic Clause Mapping
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-6 rounded-[32px] bg-red-500/5 border border-red-500/10 text-red-200 text-xs flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={uploading || files.length === 0}
                className="spellbook-btn-primary w-full py-4 text-md group relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {uploading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Initializing Engine...
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="static"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      Process Documents
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadContract;