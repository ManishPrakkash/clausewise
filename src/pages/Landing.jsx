import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  ChevronRight, 
  Lock, 
  Search, 
  Cpu, 
  ArrowUpRight 
} from 'lucide-react';
import { hasAcceptedTerms } from '../utils/termsManager';

const Landing = ({ setIsAuthenticated = () => {} }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const termsAccepted = hasAcceptedTerms();
    setAcceptedTerms(termsAccepted);

    // If already authenticated, redirect
    const token = localStorage.getItem('token');
    if (token) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError('All fields are required');
      return;
    }
    if (!acceptedTerms) {
      setError('Acceptance of Terms is required.');
      return;
    }

    try {
      const mockUser = { id: '123', name: isLogin ? 'Explorer' : name, email };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'premium-access-token');
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-background text-white selection:bg-white/10 selection:text-white">
      {/* Background Auras */}
      <div className="aura-glow top-[-10%] left-[-10%] w-[600px] h-[600px] opacity-20" />
      <div className="aura-glow bottom-[-10%] right-[-10%] w-[600px] h-[600px] opacity-10" />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between spellbook-glass rounded-full px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-background" />
            </div>
            <span className="font-serif text-xl tracking-tighter">ClauseWise</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
          <button 
            onClick={() => document.getElementById('auth-section').scrollIntoView({ behavior: 'smooth' })}
            className="spellbook-btn-primary py-2 px-6 text-sm"
          >
            Get Started
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/60 mb-6 tracking-wide uppercase">
              <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
              Award Winning Contract AI
            </div>
            <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] text-gradient mb-8">
              The Future of <br />
              <span className="italic">Legal Intelligence.</span>
            </h1>
            <p className="text-xl text-white/50 leading-relaxed mb-10 max-w-lg">
              ClauseWise uses advanced neural networks to analyze, summarize, and verify complex legal documents in seconds instead of hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => document.getElementById('auth-section').scrollIntoView({ behavior: 'smooth' })}
                className="spellbook-btn-primary group"
              >
                Access Platform
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="spellbook-btn-secondary">
                View Demo
              </button>
            </div>

            <div className="mt-16 flex items-center gap-8 grayscale-0 opacity-40">
              <div className="flex flex-col">
                <span className="text-2xl font-serif">99.2%</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">Accuracy Rate</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-serif">1.4k+</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">Contracts Analyzed</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            id="auth-section"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aura-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-30" />
            
            <div className="spellbook-glass p-8 md:p-10 rounded-[32px] relative z-10">
              <h2 className="text-3xl font-serif mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-white/40 text-sm mb-8">
                {isLogin ? 'Enter your credentials to access the laboratory.' : 'Join the new era of legal document analysis.'}
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-3">
                  <Lock className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
                      placeholder="Alexander Hamilton"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
                    placeholder="alex@clausewise.ai"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 ml-1">Secure Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-start gap-3 py-2">
                  <input 
                    type="checkbox" 
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 accent-white" 
                  />
                  <span className="text-[11px] text-white/40 leading-relaxed">
                    I acknowledge and agree to the <Link to="/terms" className="text-white hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-white hover:underline">Privacy Policy</Link>.
                  </span>
                </div>

                <button type="submit" className="spellbook-btn-primary w-full mt-4">
                  {isLogin ? 'Authorize Access' : 'Create Identity'}
                </button>
              </form>

              <div className="mt-8 flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[10px] uppercase tracking-widest text-white/20 font-semibold text-center">Identity Switch</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>
                
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-2"
                >
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <span className="text-white font-medium">{isLogin ? "Register here" : "Sign in here"}</span>
                </button>
              </div>
            </div>

            {/* Decorative Floating Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 spellbook-glass rounded-2xl flex items-center justify-center animate-float hidden md:flex">
              <Cpu className="w-8 h-8 text-white/60" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 spellbook-glass rounded-full flex items-center justify-center animate-float [animation-delay:1.5s] hidden md:flex">
              <Search className="w-6 h-6 text-white/60" />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-serif">Neural Analysis</h3>
            <p className="text-white/40 leading-relaxed text-sm">
              Our models go beyond simple keywords, understanding the semantic intent and legal nuances of your documents.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-serif">Native PDF Support</h3>
            <p className="text-white/40 leading-relaxed text-sm">
              Process multi-page PDFs instantly with our new high-accuracy extraction engine. No slow OCR fallbacks.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-serif">Safe Harbor</h3>
            <p className="text-white/40 leading-relaxed text-sm">
              Your documents never leave our secure extraction environment. Enterprise-grade encryption at every step.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2 opacity-50">
          <Shield className="w-4 h-4" />
          <span className="font-serif text-sm">ClauseWise</span>
        </div>
        <div className="flex items-center gap-8 text-[10px] uppercase tracking-widest font-semibold text-white/30">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Status</a>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-white/20">
          © 2026 ClauseWise Intelligence. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
