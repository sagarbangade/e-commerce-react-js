import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

export const AdminLogin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isAdmin && !authLoading) {
      navigate('/admin');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in as a normal user first.');
      return;
    }

    setLoading(true);
    try {
      // Attempt to write to the admins collection.
      // The Firestore rules will ONLY allow this if the passcode is 'lumina2026'
      await setDoc(doc(db, 'admins', user.uid), {
        passcode: passcode,
        email: user.email,
        createdAt: new Date().toISOString()
      });

      toast.success('Admin access granted!');
      // useAuth will automatically detect the new document and set isAdmin to true,
      // which will trigger the useEffect to navigate to /admin
    } catch (error: any) {
      console.error('Passcode error:', error);
      toast.error('Invalid passcode. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-bold uppercase tracking-widest text-xs">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full glass p-12 rounded-[40px] border-white/10 text-center relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">LUMINA ADMIN</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Enter the secret passcode to access the dashboard</p>
        </div>

        {!user ? (
          <div className="space-y-8">
            <div className="p-6 glass border border-indigo-500/20 rounded-3xl text-left">
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                <span className="text-white">Step 1:</span> You must be logged in with a normal account first before entering the admin passcode.
              </p>
            </div>
            <Link to="/auth">
              <Button className="w-full h-16 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-full-custom font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-white/5">
                Go to Normal Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePasscodeSubmit} className="space-y-6">
            <div className="p-6 glass border border-white/5 rounded-3xl text-left mb-8">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Logged in as: <span className="text-white">{user.email}</span>
              </p>
            </div>
            <div className="space-y-2">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Passcode"
                className="w-full h-16 px-8 glass border border-white/5 rounded-full-custom text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full-custom font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20"
              disabled={loading || !passcode}
            >
              {loading ? 'Verifying...' : 'Grant Admin Access'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
