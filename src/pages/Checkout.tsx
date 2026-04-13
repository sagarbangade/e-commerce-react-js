import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/helpers';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import toast from 'react-hot-toast';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(10, 'Full address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  });

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 50;
  const taxes = subtotal * 0.18;
  const total = subtotal + shipping + taxes;

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const onShippingSubmit = (data: ShippingFormValues) => {
    setShippingData(data);
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!user || !shippingData) return;
    setIsSubmitting(true);

    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        userName: shippingData.fullName,
        items: cart,
        subtotal,
        shipping,
        taxes,
        totalAmount: total,
        status: 'pending',
        shippingAddress: shippingData,
        paymentMethod: 'COD',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-white mb-12 tracking-tighter uppercase">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-12 glass p-6 rounded-full-custom border-white/5">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${step >= s ? 'bg-indigo-600 text-white' : 'glass text-slate-500'}`}>
                  {s}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${step >= s ? 'text-white' : 'text-slate-600'}`}>
                  {s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Review'}
                </span>
                {s < 3 && <div className={`w-8 h-[2px] ${step > s ? 'bg-indigo-600' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="glass p-10 rounded-[40px] border-white/10">
              <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">Shipping Address</h2>
              <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Full Name</Label>
                    <Input id="fullName" {...register('fullName')} className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
                    {errors.fullName && <p className="text-red-500 text-[10px] font-bold ml-4">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Phone Number</Label>
                    <Input id="phone" {...register('phone')} className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-4">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Address</Label>
                  <Input id="address" {...register('address')} className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
                  {errors.address && <p className="text-red-500 text-[10px] font-bold ml-4">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">City</Label>
                    <Input id="city" {...register('city')} className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
                    {errors.city && <p className="text-red-500 text-[10px] font-bold ml-4">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">State</Label>
                    <Input id="state" {...register('state')} className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
                    {errors.state && <p className="text-red-500 text-[10px] font-bold ml-4">{errors.state.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Pincode</Label>
                    <Input id="pincode" {...register('pincode')} className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
                    {errors.pincode && <p className="text-red-500 text-[10px] font-bold ml-4">{errors.pincode.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full h-16 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-full-custom font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-white/5">
                  Continue to Payment
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="glass p-10 rounded-[40px] border-white/10">
              <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">Payment Method</h2>
              <RadioGroup defaultValue="cod" className="space-y-4">
                <div className="flex items-center space-x-4 glass p-6 rounded-3xl border-white/5 bg-indigo-500/10 border-indigo-500/30">
                  <RadioGroupItem value="cod" id="cod" className="border-indigo-500 text-indigo-500" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <p className="font-black text-white uppercase tracking-widest text-sm">Cash on Delivery</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Pay when your order arrives</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-4 glass p-6 rounded-3xl border-white/5 opacity-50">
                  <RadioGroupItem value="card" id="card" disabled />
                  <Label htmlFor="card" className="flex-1">
                    <p className="font-black text-white uppercase tracking-widest text-sm">Credit / Debit Card</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Coming soon</p>
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex gap-4 mt-10">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-16 glass rounded-full-custom border-white/10 text-white font-black uppercase tracking-widest">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-16 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-full-custom font-black uppercase tracking-widest">Review Order</Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="glass p-10 rounded-[40px] border-white/10">
              <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter">Review Your Order</h2>
              
              <div className="mb-10 glass p-8 rounded-3xl border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Shipping To</h3>
                <p className="text-white font-bold">{shippingData?.fullName}</p>
                <p className="text-slate-400 text-sm mt-1">{shippingData?.address}, {shippingData?.city}, {shippingData?.state} - {shippingData?.pincode}</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Phone: {shippingData?.phone}</p>
              </div>

              <div className="mb-10 glass p-8 rounded-3xl border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Payment Method</h3>
                <p className="text-white font-bold uppercase tracking-widest text-sm">Cash on Delivery</p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-16 glass rounded-full-custom border-white/10 text-white font-black uppercase tracking-widest">Back</Button>
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={isSubmitting}
                  className="flex-1 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full-custom font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="glass rounded-[40px] p-10 border-white/10 sticky top-24">
            <h2 className="text-xl font-black text-white mb-8 uppercase tracking-tighter">Order Summary</h2>
            
            <div className="space-y-6 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 glass rounded-2xl overflow-hidden border border-white/5">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight line-clamp-1">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-white">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
              <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <span>Shipping</span>
                <span className="text-white">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <span>Tax</span>
                <span className="text-white">{formatPrice(taxes)}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-black text-white uppercase tracking-tighter">Total</span>
                <span className="text-2xl font-black text-indigo-400 tracking-tighter">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
