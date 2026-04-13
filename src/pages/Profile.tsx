import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-black text-white mb-12 tracking-tighter uppercase">My Profile</h1>
      
      <div className="glass rounded-[40px] p-12 text-center border-white/10">
        <Avatar className="w-32 h-32 mx-auto mb-8 border-4 border-white/5 shadow-2xl">
          <AvatarImage src={user.photoURL || ''} />
          <AvatarFallback className="text-4xl bg-indigo-600 text-white font-black">
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{user.displayName}</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-10">{user.email}</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/orders')} className="h-14 px-8 glass rounded-full-custom border-white/10 text-white font-black uppercase tracking-widest text-xs">
            View Orders
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white rounded-full-custom font-black uppercase tracking-widest text-xs">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
