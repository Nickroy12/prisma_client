import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { Product } from '../../types';
import CreateReviewForm from '../../components/Reviews/CreateReviewForm';


interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/products/${id}`);
  } catch (error) {
    console.error(`Failed to fetch product with id ${id}:`, error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stock === 0;
  const reviews = product.reviews || [];
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : null;

  // Calculate rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage:
      totalReviews > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === stars).length / totalReviews) * 100
          )
        : 0,
  }));

  return (
    <main className="min-h-screen bg-[#0d0f1a] text-[#e8eaf6] font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Navigation Breadcrumb */}
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7c83a0] hover:text-[#818cf8] transition-colors group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Products
          </Link>
          <div className="text-xs text-[#5c6380] font-mono bg-[#16192b] border border-[#2a2e45] px-3 py-1.5 rounded-full">
            ID: {product.id}
          </div>
        </nav>

        {/* Product Details Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Media / Showcase */}
          <div className="lg:col-span-5 bg-[#16192b] border border-[#2a2e45] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-tr from-[#1e2238] to-[#121422] flex items-center justify-center text-7xl shadow-inner group-hover:scale-110 transition-transform duration-500">
              📦
            </div>
            
            {product.category && (
              <div className="mt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  {product.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-7 bg-[#16192b] border border-[#2a2e45] rounded-3xl p-8 space-y-6 shadow-2xl">
            
            {/* Header / Title */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <h1 className="text-3xl font-extrabold text-[#e8eaf6] tracking-tight leading-tight">
                  {product.title}
                </h1>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isOutOfStock
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : product.stock < 5
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} Available`}
                </span>
              </div>

              {/* Quick Rating Summary */}
              {avgRating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(Number(avgRating)) ? 'opacity-100' : 'opacity-30'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#e8eaf6]">{avgRating}</span>
                  <span className="text-xs text-[#7c83a0]">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#0d0f1a]/60 border border-[#2a2e45] flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#818cf8]">
                ${(product.price / 100).toFixed(2)}
              </span>
              <span className="text-xs text-[#5c6380]">USD (Taxes included)</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-[#a0a5ba] uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-[#a0a5ba] text-base leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Category Info */}
            {product.category?.description && (
              <div className="p-4 rounded-xl bg-[#1e2238]/40 border border-[#2a2e45]">
                <h4 className="text-xs font-semibold text-[#818cf8] mb-1">About Category: {product.category.name}</h4>
                <p className="text-xs text-[#7c83a0]">{product.category.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-[#2a2e45] flex flex-col sm:flex-row items-center gap-4">
              <button
                disabled={isOutOfStock}
                className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  isOutOfStock
                    ? 'bg-[#1e2238] text-[#5c6380] cursor-not-allowed border border-[#2a2e45]'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/20 active:scale-[0.98]'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Shopping Cart'}
              </button>
              <button
                disabled={isOutOfStock}
                className={`w-full sm:w-auto py-3.5 px-6 rounded-xl font-bold text-sm border transition-all ${
                  isOutOfStock
                    ? 'border-[#1e2238] text-[#5c6380] cursor-not-allowed'
                    : 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50'
                }`}
              >
                Buy Now
              </button>
            </div>

          </div>

        </div>

        {/* Product Reviews & Rating Analytics Section */}
        <section className="bg-[#16192b] border border-[#2a2e45] rounded-3xl p-8 space-y-8 shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2e45] pb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#e8eaf6] flex items-center gap-3">
                <span className="text-amber-400">★</span> Customer Reviews & Feedback
              </h2>
              <p className="text-sm text-[#7c83a0] mt-1">
                Verified customer ratings and reviews directly from Prisma backend.
              </p>
            </div>
            <div className="text-sm font-semibold text-[#818cf8] bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
              Total Reviews: {totalReviews}
            </div>
          </div>

          {/* Rating Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#0d0f1a]/50 p-6 rounded-2xl border border-[#2a2e45]">
            
            {/* Score box */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-[#2a2e45]">
              <span className="text-5xl font-black text-[#e8eaf6]">
                {avgRating || '0.0'}
              </span>
              <div className="flex text-amber-400 text-lg my-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(Number(avgRating || 0)) ? 'opacity-100' : 'opacity-30'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-[#7c83a0]">
                Based on {totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'}
              </span>
            </div>

            {/* Breakdown bars */}
            <div className="md:col-span-8 space-y-2">
              {ratingCounts.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-[#a0a5ba] font-medium flex items-center gap-1">
                    {stars} <span className="text-amber-400">★</span>
                  </span>
                  <div className="flex-1 h-2 bg-[#1e2238] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-[#5c6380] font-mono">
                    {count} ({percentage}%)
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Post Review Form */}
          <CreateReviewForm initialProductId={product.id} />

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-[#0d0f1a]/30 rounded-2xl border border-dashed border-[#2a2e45]">
                <span className="text-4xl mb-3 block opacity-40">💬</span>
                <p className="text-[#7c83a0] text-sm">No reviews yet for this product.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 rounded-2xl bg-[#0d0f1a]/60 border border-[#2a2e45] hover:border-[#3a3f58] transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                        {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h4 className="text-[#e8eaf6] font-semibold text-sm">
                          {review.user?.name || 'Verified Buyer'}
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
                    <span className="text-xs text-indigo-400/80 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                      Verified Purchase
                    </span>
                  </div>

                  <p className="text-[#a0a5ba] text-sm leading-relaxed pl-13">
                    {review.comment || 'No written feedback provided.'}
                  </p>
                </div>
              ))
            )}
          </div>


        </section>

      </div>
    </main>
  );
}
