import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { StarRating } from './StarRating';
import { Button } from '../ui/button';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export const ProductReviews = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId)
        );
        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];
        
        // Sort manually if we don't have a composite index for where + orderBy
        fetchedReviews.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to post a review');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const newReview = {
        productId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      
      // Optimistic UI update
      setReviews([{ ...newReview, id: docRef.id, createdAt: { toMillis: () => Date.now() } } as any, ...reviews]);
      setShowForm(false);
      setComment('');
      setRating(5);
      toast.success('Review posted successfully!');
    } catch (error) {
      console.error("Error posting review:", error);
      toast.error('Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Customer Reviews</h3>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full-custom text-xs font-black uppercase tracking-widest px-6"
          >
            Write a Review
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-white/10 mb-10">
          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Post your review</h4>
          
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px] text-sm"
              placeholder="What did you think about this product?"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowForm(false)}
              className="flex-1 glass border-white/10 rounded-full-custom text-xs font-black uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full-custom text-xs font-black uppercase tracking-widest"
            >
              {submitting ? 'Posting...' : 'Post Review'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 glass rounded-[32px] border-white/5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No reviews yet. Be the first!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="glass p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.userPhoto ? (
                    <img src={review.userPhoto} alt={review.userName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-bold text-sm">{review.userName}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      {review.createdAt?.toMillis ? new Date(review.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
