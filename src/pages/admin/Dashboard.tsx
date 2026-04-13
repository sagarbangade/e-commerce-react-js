import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { seedDatabase } from '../../utils/seedData';
import { formatPrice } from '../../utils/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    users: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Products
        const productsSnap = await getDocs(collection(db, 'products'));
        const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        // Fetch Orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        // Calculate Stats
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        setStats({
          revenue: totalRevenue,
          orders: orders.length,
          products: products.length,
          users: new Set(orders.map(o => o.userId)).size // Approximation based on orders
        });

        // Low Stock
        setLowStock(products.filter(p => p.stock < 10).slice(0, 5));

        // Recent Orders
        setRecentOrders(
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
        );

        // Chart Data (Mocking monthly data based on orders)
        const monthlyData = orders.reduce((acc: any, order) => {
          const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
          if (!acc[month]) acc[month] = { name: month, revenue: 0, orders: 0 };
          acc[month].revenue += order.totalAmount;
          acc[month].orders += 1;
          return acc;
        }, {});
        
        setChartData(Object.values(monthlyData));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    const success = await seedDatabase();
    if (success) {
      toast.success('Database seeded successfully! Refreshing...');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      toast.error('Failed to seed database or already seeded.');
    }
    setIsSeeding(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <Button onClick={handleSeed} disabled={isSeeding} className="bg-indigo-600 hover:bg-indigo-700">
          {isSeeding ? 'Seeding...' : 'Seed Database'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatPrice(stats.revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Products</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip formatter={(value: number) => formatPrice(value)} />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-slate-900">{order.userName}</p>
                      <p className="text-sm text-slate-500">{order.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{formatPrice(order.totalAmount)}</p>
                      <p className="text-xs text-slate-500 capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && <p className="text-slate-500 text-center">No recent orders</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStock.map(product => (
                  <div key={product.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover" />
                      <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                    </div>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                      {product.stock} left
                    </span>
                  </div>
                ))}
                {lowStock.length === 0 && <p className="text-slate-500 text-center">All products well stocked</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
