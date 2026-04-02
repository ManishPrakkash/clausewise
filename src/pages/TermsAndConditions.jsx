import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Check, 
  X, 
  ArrowLeft,
  ChevronRight,
  Scale,
  FileSearch
} from 'lucide-react';
import { motion } from 'framer-motion';
import { acceptTerms } from '../utils/termsManager';

const TermsAndConditions = ({ onAccept, onDecline }) => {
  const navigate = useNavigate();
  const [hasRead, setHasRead] = useState(false);

  const handleAccept = () => {
    if (hasRead) {
      acceptTerms();
      onAccept && onAccept();
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      navigate('/login');
    }
  };

  const handleDecline = () => {
    onDecline && onDecline();
    navigate('/landing');
  };

  const sections = [
    {
      title: 'Neural Protocol Acceptance',
      icon: ShieldCheck,
      content: 'By accessing ClauseWise, you enter into a binding agreement with our neural analysis engine. This platform is optimized for legal deconstruction and verification within the global regulatory framework.'
    },
    {
      title: 'Service Architecture',
      icon: FileSearch,
      content: 'Our systems provide AI-driven contract auditing, territory validation, and semantic clause mapping. These tools are designed for expert assistance and do not constitute formal legal counsel.'
    },
    {
      title: 'Zero-Persistence Data',
      icon: Lock,
      content: 'We implement AES-256 encryption. Documents are processed in a volatile memory environment. Once a session terminates, the neural cache is purged to ensure total document privacy.'
    },
    {
      title: 'Legal Limitation',
      icon: Scale,
      content: 'ClauseWise is a supportive intelligence layer. All findings should be verified by certified legal entities. We are not liable for autonomous decisions made based on AI-generated summaries.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-background text-white selection:bg-white/10">
      <main className="pt-20 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-[20px] bg-white mx-auto mb-8 flex items-center justify-center"
            >
              <FileText className="w-8 h-8 text-brand-background" />
            </motion.div>
            <h1 className="text-5xl font-serif mb-4">Neural Statutes</h1>
            <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold">Terms & Conditions • v2.4.0</p>
          </div>

          {/* Content Scroll */}
          <div className="spellbook-glass rounded-[40px] p-1 border-white/5 mb-12">
            <div className="max-h-[500px] overflow-y-auto p-10 space-y-12 scrollbar-premium">
              {sections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div key={idx} className="relative">
                    <div className="flex items-start gap-6">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-white/40" />
                      </div>
                      <div>
                        <h3 className="text-lg font-serif mb-4 text-white/80">{idx + 1}. {section.title}</h3>
                        <p className="text-sm text-white/40 leading-relaxed font-serif italic">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-8 border-t border-white/5">
                <p className="text-[11px] text-white/20 leading-relaxed uppercase tracking-widest font-bold">
                  Effective Date: {new Date().toLocaleDateString()} • Jurisdiction: Global Digital Framework
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setHasRead(!hasRead)}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${hasRead ? 'bg-white border-white' : 'border-white/10 hover:border-white/30'}`}
              >
                {hasRead && <Check className="w-4 h-4 text-brand-background" />}
              </button>
              <span className="text-xs text-white/40 font-medium">I acknowledge the neural processing protocols and legal limitations.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={handleDecline}
                className="text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors"
              >
                Decline & Exit
              </button>
              <button
                onClick={handleAccept}
                disabled={!hasRead}
                className="spellbook-btn-primary py-4 px-12 text-xs group disabled:opacity-20 translate-y-0"
              >
                Authorize Access
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] aura-glow opacity-5 pointer-events-none" />
    </div>
  );
};

export default TermsAndConditions;
