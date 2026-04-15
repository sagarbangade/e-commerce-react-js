import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { seedDatabase } from '../../utils/seedData';
import { formatPrice } from '../../utils/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Package, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAccessToken, generateContent, QuotaExceededError } from '../../utils/auth-utils';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

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

  const handleAIAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const accessToken = await getAccessToken();

      const prompt = `You are Lumina's AI Business Analyst. Here is the current state of the e-commerce store:
      
      Total Revenue: ${stats.revenue}
      Total Orders: ${stats.orders}
      Total Products: ${stats.products}
      Active Users: ${stats.users}
      
      Monthly Data: ${JSON.stringify(chartData)}
      Low Stock Items: ${JSON.stringify(lowStock.map(p => ({ name: p.name, stock: p.stock })))}
      
      Write a concise, 3-paragraph business report. 
      Paragraph 1: Executive summary of performance.
      Paragraph 2: Insights on sales trends.
      Paragraph 3: Actionable recommendations (e.g., restock warnings, marketing ideas).
      Format with bold text for emphasis.`;

      const response = await generateContent(accessToken, {
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const report = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (report) {
        setAiReport(report);
        toast.success('Analysis complete!');
      }
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      if (error instanceof QuotaExceededError || error.name === 'QuotaExceededError') {
        toast.error('AI quota exceeded. Please upgrade your plan.');
      } else {
        toast.error('Failed to generate analysis.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-12 bg-[#050505] min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Dashboard</h1>
        <div className="flex gap-4">
          <Button onClick={handleAIAnalysis} disabled={isAnalyzing} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full-custom px-8 h-12 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20">
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI Analyst
          </Button>
          <Button onClick={handleSeed} disabled={isSeeding} className="bg-white text-black hover:bg-indigo-600 hover:text-white rounded-full-custom px-8 h-12 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-white/5">
            {isSeeding ? 'Seeding...' : 'Seed Database'}
          </Button>
        </div>
      </div>

      {aiReport && (
        <div className="mb-12 glass p-8 rounded-[40px] border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">AI Business Report</h2>
          </div>
          <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-strong:text-white prose-strong:font-black">
            {aiReport.split('\n\n').map((paragraph, idx) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <Card className="glass border-white/5 rounded-[32px] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white tracking-tighter">{formatPrice(stats.revenue)}</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/5 rounded-[32px] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white tracking-tighter">{stats.orders}</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/5 rounded-[32px] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Products</CardTitle>
            <Package className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white tracking-tighter">{stats.products}</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/5 rounded-[32px] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Users</CardTitle>
            <Users className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white tracking-tighter">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <Card className="lg:col-span-2 glass border-white/5 rounded-[40px] p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black text-white uppercase tracking-tighter">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] px-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    formatter={(value: number) => formatPrice(value)} 
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest text-xs">No data available</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-12">
          <Card className="glass border-white/5 rounded-[40px] p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-black text-white uppercase tracking-tighter">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-6">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <div>
                      <p className="font-black text-white uppercase tracking-tight text-sm">{order.userName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{order.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-indigo-400">{formatPrice(order.totalAmount)}</p>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{order.status}</p>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && <p className="text-slate-600 text-center font-bold uppercase tracking-widest text-[10px]">No recent orders</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 rounded-[40px] p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl font-black text-red-500 uppercase tracking-tighter">Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-6">
                {lowStock.map(product => (
                  <div key={product.id} className="flex justify-between items-center border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-2xl object-cover glass border border-white/5" />
                      <p className="font-black text-white uppercase tracking-tight text-xs line-clamp-1">{product.name}</p>
                    </div>
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {product.stock} left
                    </span>
                  </div>
                ))}
                {lowStock.length === 0 && <p className="text-slate-600 text-center font-bold uppercase tracking-widest text-[10px]">All products well stocked</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
