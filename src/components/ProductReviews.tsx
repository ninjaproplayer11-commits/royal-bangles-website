import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop, Review } from '../context/ShopContext';

interface Props {
  productId: string;
}

const ProductReviews: React.FC<Props> = ({ productId }) => {
  const { currentUser, getProductReviews, addReview, orders } = useShop();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const hasPurchased = orders.some(o =>
    o.items?.some((i: any) => String(i.id) === String(productId)) &&
    o.status === 'Delivered'
  );

  const alreadyReviewed = reviews.some(r => r.userId === currentUser?.uid);

  useEffect(() => {
    getProductReviews(productId).then(setReviews);
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !comment.trim()) return;
    setLoading(true);
    try {
      await addReview({
        productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Royal Member',
        rating,
        comment: comment.trim(),
      });
      const updated = await getProductReviews(productId);
      setReviews(updated);
      setIsWriting(false);
      setComment('');
      setRating(5);
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(rev => rev.rating === r).length,
    pct: reviews.length > 0 ? (reviews.filter(rev => rev.rating === r).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="space-y-10">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white/5 p-10 rounded-[2.5rem] border border-white/5">
          <div className="flex flex-col items-center justify-center">
            <span className="text-7xl font-playfair font-bold text-gold italic">{avgRating.toFixed(1)}</span>
            <div className="flex gap-1 my-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-gold' : 'fill-white/10'}`} viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              ))}
            </div>
            <p className="text-white/30 text-[10px] uppercase tracking-widest">{reviews.length} Reviews</p>
          </div>
          <div className="space-y-3">
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-white/40 w-4">{star}</span>
                <svg className="w-3 h-3 fill-gold flex-shrink-0" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-white/30 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Action Bar */}
      {!isWriting && (
        <div className="w-full">
          {currentUser ? (
            hasPurchased ? (
              !alreadyReviewed ? (
                <button
                  onClick={() => setIsWriting(true)}
                  className="w-full py-5 border-2 border-dashed border-gold/30 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold/5 transition-all"
                >
                  ✍️ Write a Verified Review
                </button>
              ) : (
                <div className="w-full py-5 bg-white/5 rounded-[2rem] text-center border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">✓ You've already reviewed this masterpiece</p>
                </div>
              )
            ) : (
              <div className="w-full py-5 bg-white/5 rounded-[2rem] text-center border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">Only verified owners can leave reviews. Purchase this item to share your experience.</p>
              </div>
            )
          ) : (
            <button
              onClick={() => window.location.href = '/auth'}
              className="w-full py-5 border-2 border-dashed border-white/10 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest text-white/40 hover:border-white/30 hover:text-white transition-all"
            >
              🔒 Login to Write a Review
            </button>
          )}
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {isWriting && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="bg-[#111] border border-gold/20 rounded-[2.5rem] p-10 space-y-8"
          >
            <h3 className="text-2xl font-playfair font-bold italic text-gold">Share Your Experience</h3>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Your Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-125"
                  >
                    <svg className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating) ? 'fill-gold' : 'fill-white/10'}`} viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Describe your experience with this masterpiece..."
              rows={4}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-gold/40 transition-all resize-none"
            />
            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="flex-1 bg-gold text-luxury-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setIsWriting(false)} className="px-8 py-4 bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
          <p className="text-white/20 italic font-playfair text-lg">Be the first to review this masterpiece.</p>
          {!currentUser && <p className="text-white/20 text-[10px] uppercase tracking-widest mt-3">Login to write a review</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/5 rounded-[2rem] p-8"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-sm">{review.userName}</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-gold' : 'fill-white/10'}`} viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
