import { useState, useRef, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquare, X, Sparkles, Send, Loader2, Mic, MicOff } from 'lucide-react';
import { getAccessToken, generateContent, QuotaExceededError } from '../../utils/auth-utils';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIStylistChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi! I am your AI Personal Stylist. Tell me what occasion you are shopping for, or describe your style!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { products } = useProducts();

  // Speech Recognition Setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Microphone error. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [recognition]);

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast('Listening...', { icon: '🎙️' });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const accessToken = await getAccessToken();

      const availableProducts = products.map(p => ({ 
        id: p.id, 
        name: p.name, 
        category: p.category, 
        price: p.price,
        description: p.description 
      }));

      const systemPrompt = `You are Lumina's AI Personal Stylist. You help customers find the perfect outfit or product from our store.
      Be friendly, concise, and stylish. 
      
      Here is our current product catalog:
      ${JSON.stringify(availableProducts)}

      When recommending products, mention their names exactly as they appear in the catalog so the user can search for them. Explain WHY they fit the user's request. Keep responses under 4 sentences.`;

      const chatHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await generateContent(accessToken, {
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: "Understood. I am ready to help." }] },
          ...chatHistory,
          { role: 'user', parts: [{ text: userMsg.content }] }
        ]
      });

      const replyText = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'I am having trouble finding the right items right now. Please try again!';
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: replyText }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      if (error instanceof QuotaExceededError || error.name === 'QuotaExceededError') {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'It looks like you have reached your AI usage limit for the day. Please upgrade your plan to continue chatting!' }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I am having connection issues right now.' }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/30 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 rounded-t-[32px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs">AI Stylist</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Powered by Gemini</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/10 text-slate-200 border border-white/5 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Stylist is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-white/5 rounded-b-[32px]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask for style advice..."}
              className={`pr-24 h-12 rounded-full-custom border-white/10 glass focus:ring-0 focus:border-indigo-500 transition-all text-white placeholder:text-slate-500 text-sm ${isListening ? 'border-red-500/50 bg-red-500/5' : ''}`}
            />
            <div className="absolute right-1 flex items-center gap-1">
              <Button
                type="button"
                onClick={toggleListening}
                size="icon"
                variant="ghost"
                className={`h-10 w-10 rounded-full hover:bg-white/10 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
