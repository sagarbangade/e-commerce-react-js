import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatPrice } from '../../utils/helpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: any[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update status');
    }
  };

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

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-12 bg-[#050505] min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Orders</h1>
        <div className="flex gap-3 glass p-2 rounded-full-custom border-white/5">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-full-custom text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === status ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-[40px] border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16 px-8">Order ID</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16">Customer</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16">Date</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16">Amount</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16">Status</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16 text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest text-xs">Loading orders...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest text-xs">No orders found</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-8 py-6 font-black text-white uppercase tracking-tight">#{order.id.slice(-8).toUpperCase()}</TableCell>
                  <TableCell>
                    <p className="font-black text-white uppercase tracking-tight text-sm">{order.userName}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{order.userEmail}</p>
                  </TableCell>
                  <TableCell className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="font-black text-indigo-400">{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                      <SelectTrigger className={`w-[140px] h-10 rounded-full text-[10px] font-black uppercase tracking-widest border-0 ${getStatusColor(order.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10 text-white rounded-2xl">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                          <Eye className="w-4 h-4 text-slate-400" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl glass border-white/10 rounded-[40px] p-10">
                        <DialogHeader className="mb-8">
                          <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">Order Details #{order.id.slice(-8).toUpperCase()}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-12 py-4">
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Customer Info</h4>
                            <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Name</p>
                                <p className="text-white font-black uppercase tracking-tight">{order.userName}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Email</p>
                                <p className="text-white font-bold text-sm">{order.userEmail}</p>
                              </div>
                              <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Shipping Address</p>
                                <p className="text-slate-300 text-sm leading-relaxed">{order.shippingAddress.address}</p>
                                <p className="text-slate-300 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Phone: {order.shippingAddress.phone}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Order Summary</h4>
                            <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500"><span>Subtotal:</span> <span className="text-white">{formatPrice(order.subtotal)}</span></div>
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500"><span>Shipping:</span> <span className="text-white">{formatPrice(order.shipping)}</span></div>
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500"><span>Taxes:</span> <span className="text-white">{formatPrice(order.taxes)}</span></div>
                              <div className="flex justify-between pt-4 border-t border-white/5">
                                <span className="text-sm font-black text-white uppercase tracking-widest">Total:</span> 
                                <span className="text-xl font-black text-indigo-400 tracking-tighter">{formatPrice(order.totalAmount)}</span>
                              </div>
                              <div className="flex justify-between pt-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment:</span> 
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{order.paymentMethod}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Items ({order.items.length})</h4>
                          <div className="space-y-4 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-6 glass p-4 rounded-3xl border-white/5">
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-2xl object-cover glass border border-white/5" />
                                <div className="flex-1">
                                  <p className="font-black text-white uppercase tracking-tight text-sm line-clamp-1">{item.name}</p>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                </div>
                                <div className="font-black text-white">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
