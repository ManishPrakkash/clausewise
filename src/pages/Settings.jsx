import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings as SettingsIcon, 
  Camera, 
  Save, 
  Shield, 
  Bell, 
  Lock,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Settings = ({ setIsAuthenticated }) => {
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('profileImage') || ''
  );
  const [previewImage, setPreviewImage] = useState(profileImage);
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Explorer", "email": "user@clausewise.ai"}');

  useEffect(() => {
    localStorage.setItem('lastVisitedPage', 'settings');
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSaveImage = () => {
    setProfileImage(previewImage);
    localStorage.setItem('profileImage', previewImage);
    // In a real app, you'd upload this to a server
  };

  const sections = [
    { name: 'Profile Information', icon: User },
    { name: 'Security & Neural Access', icon: Lock },
    { name: 'Notifications', icon: Bell },
    { name: 'Data & Privacy', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-brand-background text-white selection:bg-white/10">
      <Navigation setIsAuthenticated={setIsAuthenticated} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 text-white/40 mb-2">
                <SettingsIcon className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-bold">System Configuration</span>
              </div>
              <h1 className="text-4xl font-serif">Command Settings</h1>
            </motion.div>
            
            <Link to="/dashboard" className="p-3 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all">
              <ArrowLeft className="w-6 h-6" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-4 gap-12">
            {/* Sidebar Rail */}
            <aside className="lg:col-span-1 space-y-2">
              {sections.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button 
                    key={i}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${i === 0 ? 'bg-white text-brand-background shadow-glow' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {s.name.split(' ')[0]}
                  </button>
                );
              })}
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="spellbook-glass p-10 rounded-[40px] relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[32px] bg-white/5 border border-white/10 overflow-hidden relative">
                      {previewImage ? (
                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-white/10" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-brand-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-serif mb-2">{user.name}</h3>
                    <p className="text-sm text-white/40 italic font-serif">ClauseWise Intelligence Explorer</p>
                  </div>

                  <button 
                    onClick={handleSaveImage}
                    className="spellbook-btn-secondary py-3 px-8 text-xs flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Snapshot Profile
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                  {[
                    { label: 'Neural ID', value: user.email },
                    { label: 'Operational Hub', value: 'System Default' },
                    { label: 'Access Tier', value: 'Foundational' },
                    { label: 'Session Integrity', value: 'AES-256' }
                  ].map((item, i) => (
                    <div key={i}>
                      <span className="text-[10px] uppercase font-bold text-white/20 block mb-1">{item.label}</span>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="aura-glow opacity-5 -top-20 -right-20 w-80 h-80" />
              </motion.div>

              {/* Security Banner */}
              <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-6">
                <Shield className="w-6 h-6 text-emerald-400 mt-1" />
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-2">Security Manifest</h4>
                  <p className="text-[11px] text-emerald-400/40 leading-relaxed italic">
                    Your personal data is encrypted using ClauseWise end-to-end protocols. Document analysis happens in a zero-persistence sandbox, ensuring total privacy of your legal archives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
