import { useStore } from '../store/useStore';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/shared/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export const Wishlist = () => {
  const wishlistIds = useStore((state) => state.wishlist);
  const { products, loading } = useProducts();

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 min-h-screen">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-16 h-16 rounded-full glass border-white/10 flex items-center justify-center">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">Your Wishlist</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'} Saved
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-[32px]" />
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[40px] glass">
          <Heart className="w-16 h-16 text-slate-600 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500 mb-8 font-bold uppercase tracking-widest text-xs">Save items you love to find them easily later.</p>
          <Link to="/products">
            <Button 
              className="rounded-full-custom bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/20"
            >
              Explore Collection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
