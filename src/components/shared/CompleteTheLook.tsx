import { useState, useEffect } from 'react';
import { Product } from '../../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { Button } from '../ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { getAccessToken, generateContent, QuotaExceededError } from '../../utils/auth-utils';
import toast from 'react-hot-toast';

interface CompleteTheLookProps {
  currentProduct: Product;
  allProducts: Product[];
}

export const CompleteTheLook = ({ currentProduct, allProducts }: CompleteTheLookProps) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (allProducts.length < 3) {
      toast.error('Not enough products in the store to build an outfit.');
      return;
    }

    try {
      setIsGenerating(true);
      const accessToken = await getAccessToken();

      const availableProducts = allProducts
        .filter(p => p.id !== currentProduct.id && p.stock > 0)
        .map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description }));

      const prompt = `You are an expert fashion and lifestyle stylist. The user is currently looking at this product:
      Name: ${currentProduct.name}
      Category: ${currentProduct.category}
      Description: ${currentProduct.description}

      Here is a list of other available products in the store:
      ${JSON.stringify(availableProducts)}

      Select exactly 3 products from the available list that would perfectly complement the current product to create a "Complete the Look" outfit or aesthetic. 
      Return ONLY a JSON array of the 3 product IDs. Example: ["id1", "id2", "id3"]`;

      const response = await generateContent(accessToken, {
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const jsonMatch = text.match(/\[.*\]/s) || [null, text];
      const jsonString = jsonMatch[0];
      
      const recommendedIds: string[] = JSON.parse(jsonString);
      
      const matchedProducts = recommendedIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean) as Product[];

      setRecommendations(matchedProducts.slice(0, 3));
      setHasGenerated(true);
    } catch (error: any) {
      console.error('Complete the look error:', error);
      if (error instanceof QuotaExceededError || error.name === 'QuotaExceededError') {
        toast.error('AI quota exceeded. Please upgrade your plan.');
      } else {
        toast.error('Failed to generate recommendations.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-16 md:mt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Complete the Look</h3>
          <p className="text-slate-400 text-sm mt-2">AI-powered recommendations to match this item</p>
        </div>
        {!hasGenerated && (
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full-custom text-xs font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-indigo-600/20"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Outfit Ideas
          </Button>
        )}
      </div>

      {isGenerating && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[3/4] glass rounded-[32px] border-white/5 animate-pulse flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-500/30" />
            </div>
          ))}
        </div>
      )}

      {hasGenerated && recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
