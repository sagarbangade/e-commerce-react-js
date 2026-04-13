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
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tighter mb-2">LUMINA ADMIN</h1>
          <p className="text-slate-400">Enter the secret passcode to access the dashboard</p>
        </div>

        {!user ? (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-900/30 border border-indigo-800 rounded-lg text-left">
              <p className="text-indigo-200 text-sm">
                <strong>Step 1:</strong> You must be logged in with a normal account first before entering the admin passcode.
              </p>
            </div>
            <Link to="/auth">
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12">
                Go to Normal Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="p-4 bg-slate-700/50 rounded-lg text-left mb-4">
              <p className="text-slate-300 text-sm">
                Logged in as: <strong>{user.email}</strong>
              </p>
            </div>
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Passcode"
                className="w-full h-12 px-4 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12"
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
