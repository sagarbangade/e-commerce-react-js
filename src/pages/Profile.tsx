import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [luminaCoins, setLuminaCoins] = useState<number>(0);

  useEffect(() => {
    const fetchCoins = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setLuminaCoins(userSnap.data().luminaCoins || 0);
        }
      }
    };
    fetchCoins();
  }, [user]);

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
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">{user.email}</p>
        
        <div className="inline-flex items-center gap-3 bg-indigo-600/20 border border-indigo-500/30 px-6 py-4 rounded-full mb-10">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Lumina Coins</p>
            <p className="text-2xl font-black text-white tracking-tighter">{luminaCoins}</p>
          </div>
        </div>

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
