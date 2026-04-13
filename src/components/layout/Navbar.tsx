import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

export const Navbar = () => {
  const { user } = useAuth();
  const cart = useStore((state) => state.cart);
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const NavLinks = () => (
    <>
      <Link to="/products" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Archive</Link>
      <Link to="/products?delivery=fast" className="px-4 py-1.5 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-500 transition-all flex items-center gap-1 rounded-full shadow-lg shadow-yellow-400/20">
        15 Min <Clock className="w-3 h-3 text-black" />
      </Link>
      <Link to="/products?category=Fashion" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Fashion</Link>
      <Link to="/products?category=Electronics" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Electronics</Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 glass">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] glass border-white/10">
              <div className="flex flex-col gap-8 mt-12">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="text-2xl font-black tracking-[-0.05em] text-white uppercase">
            LUMINA<span className="text-indigo-500">.</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 ml-4">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-white/10">
              <ShoppingBag className="h-5 w-5 text-white" />
              {cartItemCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[8px] font-black text-white">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 overflow-hidden hover:bg-white/10">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="h-6 w-6 rounded-full" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl glass border-white/10 text-white">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="text-xs font-bold uppercase tracking-widest focus:bg-white/10">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')} className="text-xs font-bold uppercase tracking-widest focus:bg-white/10">
                  Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-red-400 focus:bg-red-500/10">
                  <LogOut className="h-3 w-3 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="default" className="bg-white text-black hover:bg-indigo-500 hover:text-white rounded-full-custom h-10 px-8 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-white/5">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
