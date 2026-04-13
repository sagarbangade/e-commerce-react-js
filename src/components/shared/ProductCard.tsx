import * as React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
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
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {product.discountPrice && (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
              {calculateDiscountPercentage(product.price, product.discountPrice)}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-slate-700">{product.rating}</span>
            <span className="text-sm text-slate-400">({product.reviewCount})</span>
          </div>
          <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-slate-500 mb-2">{product.category}</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-900">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white transition-colors"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
