import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/shared/ProductCard';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, SlidersHorizontal, Clock, Sparkles, Loader2, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../components/ui/sheet';
import { getAccessToken, generateContent, QuotaExceededError } from '../utils/auth-utils';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty', 'Books'];

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const { products, loading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // Filters
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(searchParams.get('delivery') === 'fast');
  const [sortBy, setSortBy] = useState('newest');
  
  // Vibe Search State
  const [isVibeSearch, setIsVibeSearch] = useState(false);
  const [isSearchingVibe, setIsSearchingVibe] = useState(false);
  const [vibeMatches, setVibeMatches] = useState<string[] | null>(null);
  
  // Visual Search State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVisualSearching, setIsVisualSearching] = useState(false);

  useEffect(() => {
    if (initialCategory !== category) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    const deliveryParam = searchParams.get('delivery');
    if (deliveryParam === 'fast' && !fastDeliveryOnly) {
      setFastDeliveryOnly(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];

    // Category filter
    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    // Search filter
    if (search) {
      if (isVibeSearch && vibeMatches) {
        result = result.filter(p => vibeMatches.includes(p.id));
      } else if (!isVibeSearch) {
        result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
    } else {
      // If search is cleared, reset vibe matches
      if (vibeMatches !== null) setVibeMatches(null);
    }

    // Price filter
    result = result.filter(p => {
      const price = p.discountPrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Fast Delivery filter (Mocking: products with stock > 50 are eligible for fast delivery)
    if (fastDeliveryOnly) {
      result = result.filter(p => p.stock > 50);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredProducts(result);
  }, [products, category, search, priceRange, inStockOnly, fastDeliveryOnly, sortBy, isVibeSearch, vibeMatches]);

  const handleVibeSearch = async () => {
    if (!search.trim()) return;
    
    try {
      setIsSearchingVibe(true);
      const accessToken = await getAccessToken();
      
      const availableProducts = products.map(p => ({ 
        id: p.id, 
        name: p.name, 
        category: p.category, 
        description: p.description 
      }));

      const prompt = `You are an AI personal shopper. The user is searching for a specific "vibe", aesthetic, or occasion: "${search}".
      
      Here is the catalog of available products:
      ${JSON.stringify(availableProducts)}

      Find all products that match this vibe/aesthetic. Return ONLY a JSON array of the matching product IDs. Example: ["id1", "id2"]`;

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
      
      const matchedIds: string[] = JSON.parse(jsonString);
      setVibeMatches(matchedIds);
      
      if (matchedIds.length === 0) {
        toast('No exact vibe matches found, try a different description.', { icon: '🤔' });
      } else {
        toast.success(`Found ${matchedIds.length} matches for your vibe!`);
      }
    } catch (error: any) {
      console.error('Vibe search error:', error);
      if (error instanceof QuotaExceededError || error.name === 'QuotaExceededError') {
        toast.error('AI quota exceeded. Please upgrade your plan.');
      } else {
        toast.error('Failed to perform vibe search.');
      }
      // Fallback to normal search
      setIsVibeSearch(false);
    } finally {
      setIsSearchingVibe(false);
    }
  };

  const handleVisualSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsVisualSearching(true);
      toast('Analyzing image...', { icon: '📸' });
      const accessToken = await getAccessToken();

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const prompt = `Analyze this image and describe the main clothing item or aesthetic in exactly 3 to 5 words. Do not use full sentences. Example: "vintage red leather jacket" or "minimalist office wear".`;

      const response = await generateContent(accessToken, {
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type
                }
              }
            ]
          }
        ]
      });

      const query = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (query) {
        setSearch(query);
        setIsVibeSearch(true);
        toast.success(`Searching for: ${query}`);
        // We need to trigger the vibe search with this new query.
        // Since state updates are async, we'll just call the API directly here for the second step.
        
        const availableProducts = products.map(p => ({ 
          id: p.id, 
          name: p.name, 
          category: p.category, 
          description: p.description 
        }));

        const searchPrompt = `You are an AI personal shopper. The user is searching for a specific "vibe", aesthetic, or occasion: "${query}".
        
        Here is the catalog of available products:
        ${JSON.stringify(availableProducts)}

        Find all products that match this vibe/aesthetic. Return ONLY a JSON array of the matching product IDs. Example: ["id1", "id2"]`;

        const searchResponse = await generateContent(accessToken, {
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: searchPrompt }] }]
        });

        const text = searchResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        const jsonMatch = text.match(/\[.*\]/s) || [null, text];
        const jsonString = jsonMatch[0];
        
        const matchedIds: string[] = JSON.parse(jsonString);
        setVibeMatches(matchedIds);
        
        if (matchedIds.length === 0) {
          toast('No exact matches found for this image.', { icon: '🤔' });
        }
      }
    } catch (error: any) {
      console.error('Visual search error:', error);
      if (error instanceof QuotaExceededError || error.name === 'QuotaExceededError') {
        toast.error('AI quota exceeded. Please upgrade your plan.');
      } else {
        toast.error('Failed to analyze image.');
      }
    } finally {
      setIsVisualSearching(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const FilterContent = () => (
    <div className="space-y-10">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                if (cat === 'All') {
                  searchParams.delete('category');
                } else {
                  searchParams.set('category', cat);
                }
                setSearchParams(searchParams);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-full text-sm font-bold uppercase tracking-tight transition-all ${category === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Price Range</h3>
        <Slider
          defaultValue={[0, 50000]}
          max={50000}
          step={100}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-6"
        />
        <div className="flex justify-between text-[10px] font-bold font-mono text-slate-500">
          <span className="glass px-3 py-1 rounded-full">₹{priceRange[0]}</span>
          <span className="glass px-3 py-1 rounded-full">₹{priceRange[1]}</span>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-white/5">
        <div className="flex items-center justify-between">
          <Label htmlFor="in-stock" className="text-sm font-bold uppercase tracking-tight text-white">In Stock Only</Label>
          <Switch
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={setInStockOnly}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="fast-delivery" className="text-sm font-bold uppercase tracking-tight flex items-center gap-2 text-white">
              15 Min Delivery <Clock className="w-3 h-3 text-yellow-400" />
            </Label>
            <p className="text-[10px] text-slate-500">Available for select items</p>
          </div>
          <Switch
            id="fast-delivery"
            checked={fastDeliveryOnly}
            onCheckedChange={(checked) => {
              setFastDeliveryOnly(checked);
              if (checked) {
                searchParams.set('delivery', 'fast');
              } else {
                searchParams.delete('delivery');
              }
              setSearchParams(searchParams);
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <span className="text-indigo-600 font-mono text-xs tracking-widest uppercase mb-2 block">Collection</span>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
            {category === 'All' ? 'The Archive' : category}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Curated selection of {filteredProducts.length} premium pieces</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-80 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder={isVibeSearch ? "Describe a vibe (e.g. cozy rainy day)..." : "Search the collection..."}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (isVibeSearch) setVibeMatches(null); // Reset matches when typing
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isVibeSearch) {
                    handleVibeSearch();
                  }
                }}
                className={`pl-11 h-12 rounded-full-custom border-white/10 glass focus:ring-0 transition-all text-white placeholder:text-slate-600 ${isVibeSearch ? 'focus:border-purple-500 pr-12' : 'focus:border-indigo-500'}`}
              />
              {isVibeSearch && search && (
                <button 
                  onClick={handleVibeSearch}
                  disabled={isSearchingVibe}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                >
                  {isSearchingVibe ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                </button>
              )}
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleVisualSearch}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isVisualSearching}
              className="h-12 px-4 rounded-full-custom border-white/10 glass text-slate-400 hover:text-white transition-all"
              title="Snap & Shop (Visual Search)"
            >
              {isVisualSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setIsVibeSearch(!isVibeSearch);
                setSearch('');
                setVibeMatches(null);
              }}
              className={`h-12 px-4 rounded-full-custom border-white/10 transition-all ${isVibeSearch ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'glass text-slate-400 hover:text-white'}`}
              title="Toggle AI Vibe Search"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12 rounded-full-custom border-white/10 glass text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10 text-white rounded-2xl">
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden h-12 w-12 rounded-full border-white/10 glass">
                  <SlidersHorizontal className="h-4 w-4 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] glass border-white/10">
                <SheetTitle className="text-2xl font-black uppercase tracking-tighter mb-8 text-white">Filters</SheetTitle>
                <FilterContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 glass p-8 rounded-[32px] border-white/10">
            <FilterContent />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-[32px]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[40px] glass">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">No matches found</h3>
              <p className="text-slate-500 mb-8 font-bold uppercase tracking-widest text-xs">Refine your search or clear filters to explore more.</p>
              <Button 
                variant="outline" 
                className="rounded-full-custom border-white/10 glass text-white hover:bg-white/10 px-8 h-12 font-black uppercase tracking-widest text-[10px] transition-all"
                onClick={() => {
                  setCategory('All');
                  setSearch('');
                  setPriceRange([0, 50000]);
                  setInStockOnly(false);
                  setFastDeliveryOnly(false);
                  searchParams.delete('category');
                  searchParams.delete('delivery');
                  setSearchParams(searchParams);
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
