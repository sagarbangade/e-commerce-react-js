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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="glass w-32 h-32 rounded-full flex items-center justify-center mb-10 text-indigo-400 border border-white/10 shadow-2xl relative z-10">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase relative z-10">Your cart is empty</h2>
        <p className="text-slate-500 mb-12 text-center max-w-md font-bold uppercase tracking-widest text-xs leading-relaxed relative z-10">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you love.
        </p>
        <Link to="/products" className="relative z-10">
          <Button size="lg" className="h-16 px-10 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-full-custom font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-white/5">
            Continue Shopping <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-white mb-12 tracking-tighter uppercase">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1">
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.productId} className="flex gap-6 p-6 glass-card rounded-[32px]">
                <div className="w-32 h-32 bg-slate-900 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/product/${item.productId}`} className="text-xl font-black text-white hover:text-indigo-400 transition-colors line-clamp-1 uppercase tracking-tight">
                        {item.name}
                      </Link>
                      <p className="text-indigo-400 font-black mt-2 text-lg">{formatPrice(item.price)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-600 hover:text-red-500 transition-colors p-2 glass rounded-full"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center glass rounded-full p-1 border-white/5">
                      <button 
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-widest">
                      Total: {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <div className="glass rounded-[40px] p-10 border-white/10 sticky top-24">
            <h2 className="text-xl font-black text-white mb-8 uppercase tracking-tighter">Order Summary</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-xs">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-xs">
                <span>Shipping</span>
                <span className="text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-xs">
                <span>Estimated Tax (18%)</span>
                <span className="text-white">{formatPrice(taxes)}</span>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-white uppercase tracking-tighter">Total</span>
                  <span className="text-3xl font-black text-indigo-400 tracking-tighter">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex gap-2">
                <Input placeholder="Promo code" className="glass rounded-full-custom border-white/5 text-white placeholder:text-slate-600 h-12 px-6" />
                <Button variant="outline" className="glass rounded-full-custom border-white/10 hover:bg-white/10 px-6">Apply</Button>
              </div>
            </div>

            <Button 
              className="w-full h-16 text-sm font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 rounded-full-custom shadow-xl shadow-indigo-600/20"
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
