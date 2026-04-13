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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          {/* Progress Indicator */}
          <div className="flex items-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} font-bold`}>1</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} font-bold`}>2</div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} font-bold`}>3</div>
          </div>

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
              <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register('fullName')} />
                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register('phone')} />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register('city')} />
                    {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register('state')} />
                    {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" {...register('pincode')} />
                    {errors.pincode && <p className="text-sm text-red-500">{errors.pincode.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700">
                  Continue to Payment
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>
              <RadioGroup defaultValue="cod" className="space-y-4">
                <div className="flex items-center space-x-3 border p-4 rounded-lg bg-indigo-50 border-indigo-200">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="font-medium cursor-pointer">Cash on Delivery (COD)</Label>
                </div>
                <div className="flex items-center space-x-3 border p-4 rounded-lg opacity-50">
                  <RadioGroupItem value="card" id="card" disabled />
                  <div className="flex flex-col">
                    <Label htmlFor="card" className="font-medium">Credit / Debit Card</Label>
                    <span className="text-xs text-slate-500">Coming soon</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 border p-4 rounded-lg opacity-50">
                  <RadioGroupItem value="upi" id="upi" disabled />
                  <div className="flex flex-col">
                    <Label htmlFor="upi" className="font-medium">UPI</Label>
                    <span className="text-xs text-slate-500">Coming soon</span>
                  </div>
                </div>
              </RadioGroup>
              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Review Order</Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-xl font-bold mb-6">Review Your Order</h2>
              
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Shipping Address</h3>
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                  <p className="font-medium text-slate-900">{shippingData?.fullName}</p>
                  <p>{shippingData?.address}</p>
                  <p>{shippingData?.city}, {shippingData?.state} - {shippingData?.pincode}</p>
                  <p>Phone: {shippingData?.phone}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Payment Method</h3>
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                  <p>Cash on Delivery (COD)</p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={isSubmitting}>Back</Button>
                <Button 
                  onClick={handlePlaceOrder} 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-slate-50 rounded-xl p-6 border sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-16 h-16 bg-white rounded border overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-slate-500">Qty: {item.quantity}</p>
                    <p className="font-medium text-indigo-600">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t text-sm">
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
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-indigo-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
