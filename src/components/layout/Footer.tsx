import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <Link to="/" className="text-3xl font-black tracking-tighter text-white mb-6 block uppercase italic">
              LUMINA
            </Link>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
              Premium D2C brand offering the best in fashion, electronics, and lifestyle products. Quality meets design.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"><Twitter size={18} /></a>
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"><Youtube size={18} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-sm mb-6">Shop</h3>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <li><Link to="/products" className="hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-indigo-400 transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-indigo-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Home" className="hover:text-indigo-400 transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-sm mb-6">Support</h3>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Returns & Exchanges</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-sm mb-6">Newsletter</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex h-12 w-full rounded-full-custom border border-white/10 glass px-6 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="submit" className="h-12 px-6 bg-white text-black rounded-full-custom text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/5">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            © {new Date().getFullYear()} Lumina Store. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
