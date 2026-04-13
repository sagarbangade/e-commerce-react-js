import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Product } from '../hooks/useProducts';
import { useStore } from '../store/useStore';
import { formatPrice, calculateDiscountPercentage } from '../utils/helpers';
import { StarRating } from '../components/shared/StarRating';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

import { VirtualTryOnModal } from '../components/shared/VirtualTryOnModal';
import { ProductReviews } from '../components/shared/ProductReviews';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          const images = data.imageUrls || [data.imageUrl].filter(Boolean);
          setProduct({ ...data, id: docSnap.id, imageUrls: images } as Product);
          setActiveImage(images[0] || '');
        } else {
          toast.error('Product not found');
          navigate('/products');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      imageUrl: activeImage || product.imageUrl,
      quantity,
    });
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) return null;

  const images = product.imageUrls || [product.imageUrl].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-24">
        {/* Image Gallery */}
        <div className="space-y-6">
          <div className="aspect-square rounded-[40px] overflow-hidden glass relative border border-white/10">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {product.discountPrice && (
              <Badge className="absolute top-6 left-6 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
                {calculateDiscountPercentage(product.price, product.discountPrice)}% OFF
              </Badge>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === img ? 'border-indigo-500 scale-95' : 'border-transparent hover:border-white/20'}`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col py-4">
          <div className="mb-8">
            <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs mb-3">{product.category}</p>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 tracking-tighter uppercase">{product.name}</h1>
            <div className="flex items-center gap-6">
              <StarRating rating={product.rating} />
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{product.reviewCount} Reviews</span>
            </div>
          </div>

          <div className="mb-8 md:mb-10 glass p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-white/10">
            <div className="flex items-end gap-4 mb-2">
              <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                {formatPrice(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-2xl text-slate-500 line-through mb-1 font-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inclusive of all taxes</p>
          </div>

          <div className="mb-10">
            <p className="text-slate-400 leading-relaxed text-lg font-light">{product.description}</p>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-6 mb-4">
              <span className="font-black text-white uppercase tracking-widest text-xs">Quantity</span>
              <div className="flex items-center glass rounded-full p-1 border-white/10">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-black text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={18} />
                </button>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">
                {product.stock > 0 ? (
                  <span className={product.stock < 10 ? "text-orange-400" : "text-green-400"}>
                    {product.stock < 10 ? `Only ${product.stock} left` : 'In Stock'}
                  </span>
                ) : (
                  <span className="text-red-500">Out of Stock</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-2 md:gap-4 mt-auto">
            <Button 
              size="lg" 
              variant="outline" 
              className="flex-1 h-12 md:h-16 px-2 md:px-8 text-[10px] md:text-sm font-black uppercase tracking-widest rounded-full-custom border-white/10 glass hover:bg-white/10"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" /> Add to Cart
            </Button>
            <Button 
              size="lg" 
              className="flex-1 h-12 md:h-16 px-2 md:px-8 text-[10px] md:text-sm font-black uppercase tracking-widest rounded-full-custom bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              <Zap className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" /> Buy Now
            </Button>
          </div>
          
          <VirtualTryOnModal productName={product.name} productImageUrl={activeImage || product.imageUrl} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 md:mt-24 glass p-6 md:p-10 rounded-[24px] md:rounded-[40px] border-white/10">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-none rounded-none h-auto p-0 bg-transparent mb-6 md:mb-8 overflow-x-auto flex-nowrap scrollbar-hide gap-2 md:gap-4">
            <TabsTrigger value="description" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white bg-white/5 rounded-full-custom px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 whitespace-nowrap transition-all">Description</TabsTrigger>
            <TabsTrigger value="specifications" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white bg-white/5 rounded-full-custom px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 whitespace-nowrap transition-all">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white bg-white/5 rounded-full-custom px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 whitespace-nowrap transition-all">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-4">
            <p className="text-slate-400 leading-relaxed max-w-3xl font-light text-lg">{product.description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="py-4">
            <div className="max-w-3xl glass p-8 rounded-3xl border-white/5">
              <div className="grid grid-cols-3 py-4 border-b border-white/5">
                <span className="font-black text-indigo-400 uppercase tracking-widest text-xs">Category</span>
                <span className="col-span-2 text-white font-medium">{product.category}</span>
              </div>
              <div className="grid grid-cols-3 py-4">
                <span className="font-black text-indigo-400 uppercase tracking-widest text-xs">Availability</span>
                <span className="col-span-2 text-white font-medium">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-4">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
