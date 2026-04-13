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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === status ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading orders...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No orders found</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-slate-900">#{order.id.slice(-8).toUpperCase()}</TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900">{order.userName}</p>
                    <p className="text-sm text-slate-500">{order.userEmail}</p>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="font-bold text-indigo-600">{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                      <SelectTrigger className={`w-[130px] h-8 text-xs font-bold capitalize border-0 ${getStatusColor(order.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details #{order.id.slice(-8).toUpperCase()}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-8 py-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Customer Info</h4>
                            <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                              <p className="font-medium text-slate-900">{order.userName}</p>
                              <p>{order.userEmail}</p>
                              <p className="mt-2 text-slate-900 font-medium">Shipping Address:</p>
                              <p>{order.shippingAddress.address}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                              <p>Phone: {order.shippingAddress.phone}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Order Summary</h4>
                            <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between"><span>Subtotal:</span> <span>{formatPrice(order.subtotal)}</span></div>
                              <div className="flex justify-between"><span>Shipping:</span> <span>{formatPrice(order.shipping)}</span></div>
                              <div className="flex justify-between"><span>Taxes:</span> <span>{formatPrice(order.taxes)}</span></div>
                              <div className="flex justify-between pt-2 border-t font-bold text-slate-900">
                                <span>Total:</span> <span className="text-indigo-600">{formatPrice(order.totalAmount)}</span>
                              </div>
                              <div className="flex justify-between pt-2"><span>Payment:</span> <span className="uppercase">{order.paymentMethod}</span></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Items ({order.items.length})</h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg">
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900 text-sm line-clamp-1">{item.name}</p>
                                  <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                </div>
                                <div className="font-bold text-slate-900 text-sm">
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
