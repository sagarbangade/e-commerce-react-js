import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const ADMIN_EMAILS = ['sagarbangade21@gmail.com', 'sagar.bangade.dev@gmail.com', 'kashishbawane9@gmail.com'];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const email = currentUser.email?.toLowerCase();
        const isHardcodedAdmin = !!email && ADMIN_EMAILS.includes(email);

        // Listen to the admins collection to see if they used the passcode
        const unsubscribeAdmin = onSnapshot(doc(db, 'admins', currentUser.uid), (docSnap) => {
          setIsAdmin(isHardcodedAdmin || docSnap.exists());
          setLoading(false);
        }, (error) => {
          console.error("Error checking admin status:", error);
          setIsAdmin(isHardcodedAdmin);
          setLoading(false);
        });

        return () => unsubscribeAdmin();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, loading, isAdmin };
};
