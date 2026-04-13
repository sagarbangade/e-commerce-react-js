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

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
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
      imageUrl: product.imageUrl,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 relative">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {product.discountPrice && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-sm px-3 py-1">
                {calculateDiscountPercentage(product.price, product.discountPrice)}% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <p className="text-indigo-600 font-medium mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <StarRating rating={product.rating} />
              <span className="text-sm text-slate-500">{product.reviewCount} Reviews</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-slate-900">
                {formatPrice(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-xl text-slate-400 line-through mb-1">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">Inclusive of all taxes</p>
          </div>

          <div className="mb-8">
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-medium text-slate-900">Quantity</span>
              <div className="flex items-center border rounded-md">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-slate-50 text-slate-600"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-slate-50 text-slate-600"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-slate-500">
                {product.stock > 0 ? (
                  <span className={product.stock < 10 ? "text-orange-500 font-medium" : "text-green-600 font-medium"}>
                    {product.stock < 10 ? `Only ${product.stock} left in stock` : 'In Stock'}
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <Button 
              size="lg" 
              variant="outline" 
              className="flex-1 h-14 text-base"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button 
              size="lg" 
              className="flex-1 h-14 text-base bg-indigo-600 hover:bg-indigo-700"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              <Zap className="mr-2 h-5 w-5" /> Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-8 py-4 text-base">Description</TabsTrigger>
            <TabsTrigger value="specifications" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-8 py-4 text-base">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-8 py-4 text-base">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-8">
            <p className="text-slate-600 leading-relaxed max-w-3xl">{product.description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="py-8">
            <div className="max-w-3xl">
              <div className="grid grid-cols-3 py-3 border-b">
                <span className="font-medium text-slate-900">Category</span>
                <span className="col-span-2 text-slate-600">{product.category}</span>
              </div>
              <div className="grid grid-cols-3 py-3 border-b">
                <span className="font-medium text-slate-900">Availability</span>
                <span className="col-span-2 text-slate-600">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-8">
            <div className="max-w-3xl">
              <p className="text-slate-500 italic">Reviews feature coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
