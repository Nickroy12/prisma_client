import { apiFetch } from '../../lib/api';
import { Review } from '../../types';
import CreateReviewForm from './CreateReviewForm';

async function getReviews(): Promise<Review[]> {
  try {
    return await apiFetch<Review[]>('/api/reviews');
  } catch {
    return [];
  }
}

export default async function ReviewList() {
  const reviews = await getReviews();

  return (
    <div className="mt-12 space-y-10">
      
      {/* Post Review Form Section */}
      <section>
        <CreateReviewForm />
      </section>

      {/* Customer Reviews Section */}
      <section>
        <h3 className="text-2xl font-bold text-[#e8eaf6] mb-6 flex items-center gap-3">
          <span className="text-amber-400">★</span> Customer Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="bg-[#16192b] border border-[#2a2e45] rounded-2xl p-8 text-center">
            <p className="text-[#7c83a0]">No reviews yet. Be the first to review a product above!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#16192b] border border-[#2a2e45] rounded-2xl p-6 transition-all hover:border-[#3a3f58]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-[#e8eaf6] font-medium text-sm">
                        {review.user?.name || 'Anonymous User'}
                      </h4>
                      <div className="flex text-amber-400 text-xs mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-30'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#5c6380]">Verified Purchase</span>
                </div>

                <p className="text-[#a0a5ba] text-sm leading-relaxed">
                  {review.comment || 'No written comment provided.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

