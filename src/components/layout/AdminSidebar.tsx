import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { cn } from '../../lib/utils';

export const AdminSidebar = () => {
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <div className="w-64 bg-[#050505] border-r border-white/5 text-white flex flex-col min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="p-8 relative z-10">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Lumina<span className="text-indigo-500">.</span></h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Admin Panel</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-full-custom transition-all text-xs font-black uppercase tracking-widest",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 relative z-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-4 w-full rounded-full-custom text-red-400 hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
