import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="text-2xl font-bold tracking-tighter text-indigo-600 mb-4 block">
              LUMINA
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Premium D2C brand offering the best in fashion, electronics, and lifestyle products. Quality meets design.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="hover:text-indigo-600 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-indigo-600 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-indigo-600 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-indigo-600 transition-colors"><Youtube size={20} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Shop</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-indigo-600 transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-indigo-600 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Home" className="hover:text-indigo-600 transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Returns & Exchanges</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Newsletter</h3>
            <p className="text-slate-500 text-sm mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <button type="submit" className="h-10 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Lumina Store. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
