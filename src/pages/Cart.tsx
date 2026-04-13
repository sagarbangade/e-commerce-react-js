import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/helpers';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 50;
  const taxes = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + taxes;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you love.
        </p>
        <Link to="/products">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 bg-white border rounded-xl">
                <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/product/${item.productId}`} className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-indigo-600 font-bold mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-slate-50 text-slate-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-50 text-slate-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      Total: {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-slate-50 rounded-xl p-6 border sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-medium text-slate-900">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (18%)</span>
                <span className="font-medium text-slate-900">{formatPrice(taxes)}</span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <Input placeholder="Promo code" className="bg-white" />
                <Button variant="outline">Apply</Button>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
