import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Lock, 
  EyeOff, 
  Database, 
  Trash2, 
  ArrowLeft,
  ChevronRight,
  Fingerprint,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/terms');
  };

  const sections = [
    {
      title: 'Data Ingestion',
      icon: Database,
      content: 'We collect minimal telemetry required for session stability. This includes cryptographic identifiers, volatile document metadata, and peripheral technical data.'
    },
    {
      title: 'Neural Processing',
      icon: Fingerprint,
      content: 'Documents are processed using localized neural weights. No third-party data harvesting occurs during clause extraction or territory validation.'
    },
    {
      title: 'Encrypted Transit',
      icon: Lock,
      content: 'All communication between your terminal and our neural cluster is protected by industrial-grade TLS 1.3 and AES-256 encryption protocols.'
    },
    {
      title: 'Total Erasure',
      icon: Trash2,
      content: 'You retain absolute sovereignty over your records. Upon session termination or manual request, all historical deconstructions are permanently purged from our volatile cache.'
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
              <EyeOff className="w-8 h-8 text-brand-background" />
            </motion.div>
            <h1 className="text-5xl font-serif mb-4">Privacy Manifest</h1>
            <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold">Data Sovereignty • v1.0.2</p>
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
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex items-start gap-4">
                  <ShieldAlert className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
                  <p className="text-xs text-blue-200/60 leading-relaxed italic">
                    <strong>Critical Disclosure:</strong> This manifest is a living document. By continuing to utilize ClauseWise neural services, you consent to our data sovereignty protocols as defined herein.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Terms
            </button>
            <Link
              to="/landing"
              className="spellbook-btn-primary py-4 px-12 text-xs group"
            >
              System Origin
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      <div className="fixed top-0 left-0 w-[800px] h-[800px] aura-glow opacity-5 pointer-events-none" />
    </div>
  );
};

export default PrivacyPolicy;
