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
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>
      
      <div className="bg-white border rounded-xl p-8 text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={user.photoURL || ''} />
          <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">
            {user.displayName?.charAt(0) || user.email?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{user.displayName}</h2>
        <p className="text-slate-500 mb-8">{user.email}</p>
        
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            View Orders
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
