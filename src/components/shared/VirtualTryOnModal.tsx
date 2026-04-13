import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Sparkles, Upload, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface VirtualTryOnModalProps {
  productName: string;
  productImageUrl: string;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ productName, productImageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'success' | 'error'>('idle');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [agentPrompt, setAgentPrompt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setGeneratedImage(null);
        setAgentPrompt(null);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const getBase64FromUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `lumina-try-on-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTryOn = async () => {
    if (!userImage) {
      toast.error('Please upload your photo first.');
      return;
    }

    try {
      setStatus('analyzing');
      
      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Convert product image URL to base64
      const productBase64Full = await getBase64FromUrl(productImageUrl);
      const productBase64Data = productBase64Full.split(',')[1];
      const userBase64Data = userImage.split(',')[1];

      // Agent 1: Prompt Engineer (Analyzes both images and writes a prompt)
      const agent1Response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: userBase64Data,
                mimeType: 'image/jpeg'
              }
            },
            {
              inlineData: {
                data: productBase64Data,
                mimeType: 'image/jpeg'
              }
            },
            {
              text: `You are an expert fashion AI prompt engineer. Look at Image 1 (the user) and Image 2 (the product: ${productName}). Write a highly detailed image generation prompt that describes the user (their pose, hair, skin tone, expression) wearing the exact product shown in Image 2 (mentioning its color, texture, style, and fit). The prompt should be optimized for an image-to-image AI model. Output ONLY the prompt text, nothing else.`
            }
          ]
        }
      });

      const generatedPrompt = agent1Response.text?.trim();
      if (!generatedPrompt) throw new Error("Failed to generate prompt");
      
      setAgentPrompt(generatedPrompt);
      setStatus('generating');

      // Agent 2: Image Generator
      const agent2Response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: userBase64Data,
                mimeType: 'image/jpeg'
              }
            },
            {
              text: `Modify this person to be wearing the following outfit seamlessly. Keep their face and body identical. Outfit description: ${generatedPrompt}`
            }
          ]
        }
      });

      let finalImageBase64 = null;
      if (agent2Response.candidates?.[0]?.content?.parts) {
        for (const part of agent2Response.candidates[0].content.parts) {
          if (part.inlineData) {
            finalImageBase64 = `data:image/jpeg;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!finalImageBase64) {
        throw new Error("Failed to generate image");
      }

      setGeneratedImage(finalImageBase64);
      setStatus('success');
      toast.success('Virtual try-on complete!');

    } catch (error: any) {
      console.error('Try-on error:', error);
      setStatus('error');
      toast.error(error.message || 'Failed to generate virtual try-on');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full mt-4 h-14 text-sm font-black uppercase tracking-widest rounded-full-custom border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-all"
        >
          <Sparkles className="mr-2 h-5 w-5" /> Virtual Try-On (AI)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-[#050505] border-white/10 text-white rounded-[24px] md:rounded-[40px] p-6 md:p-8 glass max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter text-center mb-2">AI Virtual Try-On</DialogTitle>
          <p className="text-center text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
            See how {productName} looks on you
          </p>
        </DialogHeader>

        <div className="space-y-6 md:space-y-8">
          {/* Upload Section */}
          {!userImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center cursor-pointer hover:bg-white/5 transition-colors glass"
            >
              <Upload className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-4 text-indigo-400" />
              <h3 className="text-base md:text-lg font-black uppercase tracking-widest mb-2">Upload your photo</h3>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Full body or half body shot works best</p>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Your Photo</p>
                <div className="aspect-[3/4] rounded-3xl overflow-hidden glass border border-white/10 relative group">
                  <img src={userImage} alt="User" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="glass rounded-full-custom">
                      Change Photo
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Result</p>
                <div className="aspect-[3/4] rounded-3xl overflow-hidden glass border border-white/10 flex items-center justify-center relative bg-white/5">
                  {status === 'idle' && (
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center px-4">
                      Ready to generate
                    </p>
                  )}
                  {status === 'analyzing' && (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-4" />
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Agent 1: Analyzing...
                      </p>
                    </div>
                  )}
                  {status === 'generating' && (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Agent 2: Generating...
                      </p>
                    </div>
                  )}
                  {status === 'success' && generatedImage && (
                    <img src={generatedImage} alt="Generated Try-On" className="w-full h-full object-cover" />
                  )}
                  {status === 'error' && (
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest text-center px-4">
                      Generation failed
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Agent Prompt Display */}
          {agentPrompt && (
            <div className="glass p-4 rounded-2xl border border-white/5 text-left">
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Agent 1 Prompt:</p>
              <p className="text-slate-400 text-xs italic leading-relaxed">"{agentPrompt}"</p>
            </div>
          )}

          {/* Action Button */}
          {userImage && status !== 'analyzing' && status !== 'generating' && (
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button 
                onClick={handleTryOn}
                className="flex-1 h-12 md:h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full-custom font-black uppercase tracking-widest text-xs md:text-sm shadow-xl shadow-indigo-600/20"
              >
                {status === 'success' || status === 'error' ? 'Try Again' : 'Generate Try-On'}
              </Button>
              {status === 'success' && generatedImage && (
                <Button 
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 h-12 md:h-14 glass border-white/10 hover:bg-white/10 text-white rounded-full-custom font-black uppercase tracking-widest text-xs md:text-sm"
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
