import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  Bot, 
  User as UserIcon,
  Loader2,
  ChevronRight
} from 'lucide-react';
import huggingFaceService from '../utils/huggingFaceService';

const DocumentChatbot = ({ documentData, documentText }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const documentType = documentData?.documentType || 'document';
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `I have ingested the ${documentType}. My neural analysis is complete. You may now query the document for specific clauses, risks, or semantic clarifications.`,
        timestamp: new Date()
      }
    ]);
  }, [documentData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await huggingFaceService.generateResponse(inputMessage, documentData, documentText);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I encountered a disruption in my neural pathways. Please re-state your query.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    'Flag critical risks',
    'Summarize obligations',
    'Termination clauses'
  ];

  return (
    <div className="relative z-40">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="spellbook-glass p-4 rounded-2xl flex items-center gap-3 border-white/20 hover:border-white/40 transition-all group"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-background" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest pr-2">Neural Advisor</span>
            <div className="aura-glow w-20 h-20 -top-4 -right-4 opacity-20 group-hover:opacity-40 transition-opacity" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="spellbook-glass w-full md:w-[450px] rounded-[32px] overflow-hidden flex flex-col shadow-4xl border-white/20"
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-white/60" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">Neural Interface</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="h-80 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.type === 'bot' ? 'bg-white/5 border border-white/10' : 'bg-white text-brand-background'}`}>
                    {msg.type === 'bot' ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${msg.type === 'bot' ? 'bg-white/[0.03] text-white/60 font-serif italic' : 'bg-white/[0.08] text-white'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-2 mb-6">
                {suggestions.map((s) => (
                  <button 
                    key={s}
                    onClick={() => { setInputMessage(s); }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] uppercase tracking-widest font-bold text-white/30 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <input 
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Query document..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-6 pr-12 py-4 text-xs focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-background shadow-glow disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentChatbot;
