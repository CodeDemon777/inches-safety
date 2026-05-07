import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Reviews = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['approved-feedbacks'],
    queryFn: async () => await apiFetch('/feedback?approved=true'),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-testimonial py-16 flex-grow">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground">Customer Reviews</h1>
          <p className="mt-4 text-lg text-muted-foreground">See what our customers have to say about our products.</p>
        </div>
      
        <div className="container mx-auto px-4 py-16">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (reviews ?? []).length === 0 ? (
            <p className="text-center text-muted-foreground">No reviews yet. Be the first to leave one after your purchase!</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {(reviews ?? []).map((review: any, i: number) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border bg-card p-6 shadow-sm"
                >
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= review.rating ? 'fill-star text-star' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground">{review.comment}</p>
                  <p className="mt-4 font-display font-bold text-foreground">
                    {review.guest_name || review.user_id?.full_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Reviews;
