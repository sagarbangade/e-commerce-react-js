import * as React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Product } from '../../hooks/useProducts';
import { formatPrice, calculateDiscountPercentage } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
    toast.success('Added to cart');
  };

  return (
    <Link to={`/product/${product.id}`} className="group block glass-card p-3 rounded-[32px]">
      <div className="relative overflow-hidden bg-slate-900 aspect-[3/4] rounded-[24px]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.discountPrice && (
            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
              -{calculateDiscountPercentage(product.price, product.discountPrice)}%
            </span>
          )}
          {product.stock > 50 && (
            <span className="bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-400/20">
              <Clock size={10} /> 15 MIN
            </span>
          )}
        </div>
 
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-8">
          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-white text-black hover:bg-indigo-600 hover:text-white rounded-full-custom h-14 font-bold uppercase tracking-widest text-xs transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 shadow-xl"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sold Out' : 'Quick Add +'}
          </Button>
        </div>
      </div>

      <div className="mt-6 px-2 pb-2 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">{product.category}</p>
            <h3 className="font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-lg">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-black text-white text-lg">
              {formatPrice(product.discountPrice || product.price)}
            </p>
            {product.discountPrice && (
              <p className="text-[10px] text-slate-500 line-through font-bold">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              className={`${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-800 text-slate-800'}`} 
            />
          ))}
          <span className="text-[10px] font-bold text-slate-500 ml-1">({product.reviewCount})</span>
        </div>
      </div>
    </Link>
  );
};
