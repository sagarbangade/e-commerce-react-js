import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../utils/helpers';
import { Badge } from '../components/ui/badge';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-32 h-32 glass rounded-full flex items-center justify-center mb-8 text-indigo-400 border border-white/5">
          <Package size={48} />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">No orders yet</h2>
        <p className="text-slate-500 mb-10 text-center max-w-md font-medium">
          You haven't placed any orders. Start shopping to see your orders here.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-black text-white mb-12 tracking-tighter uppercase">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="glass rounded-[40px] border-white/10 overflow-hidden transition-all hover:border-white/20">
            <div 
              className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex-1 mb-6 sm:mb-0">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-black text-white uppercase tracking-tight text-lg">Order #{order.id.slice(-8).toUpperCase()}</span>
                  <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`} variant="outline">
                    {order.status}
                  </Badge>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-xl font-black text-indigo-400 tracking-tighter">{formatPrice(order.totalAmount)}</p>
                </div>
                <div className="text-slate-500 glass p-2 rounded-full border-white/5">
                  {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {expandedOrder === order.id && (
              <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Order Items</h4>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 glass p-4 rounded-3xl border-white/5">
                      <div className="w-20 h-20 glass rounded-2xl overflow-hidden border border-white/5 shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-white uppercase tracking-tight line-clamp-1">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-black text-white">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
