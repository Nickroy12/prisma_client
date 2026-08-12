'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { Product, User } from '../../types';

interface CreateReviewFormProps {
  initialProductId?: string;
  onReviewCreated?: () => void;
}

export default function CreateReviewForm({ initialProductId = '', onReviewCreated }: CreateReviewFormProps) {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState(initialProductId);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load products and users for quick selection helpers
  useEffect(() => {
    async function loadOptions() {
      try {
        const products = await apiFetch<Product[]>('/api/products');
        setAvailableProducts(products || []);
        if (!initialProductId && products && products.length > 0) {
          setProductId(products[0].id);
        }
      } catch {
        // Ignore product fetch error
      }

      try {
        const users = await apiFetch<User[]>('/api/users');
        setAvailableUsers(users || []);
        if (users && users.length > 0) {
          setUserId(users[0].id);
        }
      } catch {
        // Ignore user fetch error
      }
    }
    loadOptions();
  }, [initialProductId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userId.trim()) {
      setError('Please enter or select a valid User ID.');
      return;
    }

    if (!productId.trim()) {
      setError('Please enter or select a Product.');
      return;
    }

    setLoading(true);

    try {
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId.trim(),
          productId: productId.trim(),
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      setSuccess('Review posted successfully!');
      setComment('');

      if (onReviewCreated) {
        onReviewCreated();
      }
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to post review. Please check the User ID and Product ID.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#16192b] border border-[#2a2e45] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-[#2a2e45] pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#e8eaf6] flex items-center gap-2">
            <span className="text-amber-400">✍️</span> Write a Product Review
          </h3>
          <p className="text-xs text-[#7c83a0] mt-1">
            Post a review directly by specifying your User ID and rating.
          </p>
        </div>
        <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full">
          Prisma Server Live API
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold">Error Submitting Review</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
          <span className="text-lg">✅</span>
          <div className="flex-1">
            <p className="font-semibold">{success}</p>
            <p className="text-xs mt-0.5 opacity-90">Your feedback has been saved in the database.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* User ID Input Field */}
        <div className="space-y-2 hidden">
          <div className="flex items-center justify-between">
            <label htmlFor="userId" className="block text-xs font-bold uppercase tracking-wider text-[#a0a5ba]">
              User ID <span className="text-red-400">*</span>
            </label>
            {availableUsers.length > 0 && (
              <span className="text-[11px] text-indigo-400">
                {availableUsers.length} user(s) found in backend
              </span>
            )}
          </div>

          <div className="space-y-2">
            <input
              id="userId"
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
              className="w-full bg-[#0d0f1a] border border-[#2a2e45] rounded-xl px-4 py-3 text-sm text-[#e8eaf6] placeholder-[#5c6380] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />

            {/* Quick User Picker Dropdown */}
            {availableUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5c6380]">Quick Select User:</span>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="bg-[#0d0f1a] border border-[#2a2e45] rounded-lg px-2.5 py-1 text-xs text-[#a0a5ba] focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>-- Select a registered user --</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) - ID: {u.id.substring(0, 8)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Product Selection / ID Input Field */}
        <div className="space-y-2 hidden">
          <label htmlFor="productId" className="block text-xs font-bold uppercase tracking-wider text-[#a0a5ba]">
            Product <span className="text-red-400">*</span>
          </label>

          {availableProducts.length > 0 ? (
            <select
              id="productId"
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-[#0d0f1a] border border-[#2a2e45] rounded-xl px-4 py-3 text-sm text-[#e8eaf6] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="" disabled>-- Select target product --</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${(p.price / 100).toFixed(2)}) - ID: {p.id.substring(0, 8)}...
                </option>
              ))}
            </select>
          ) : (
            <input
              id="productId"
              type="text"
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter Product ID (UUID)"
              className="w-full bg-[#0d0f1a] border border-[#2a2e45] rounded-xl px-4 py-3 text-sm text-[#e8eaf6] placeholder-[#5c6380] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
          )}
        </div>

        {/* Star Rating Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#a0a5ba]">
            Rating <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2 bg-[#0d0f1a] border border-[#2a2e45] rounded-xl p-3 w-fit">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-transform hover:scale-125 focus:outline-none"
              >
                <span className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-[#3a3f58]'}>
                  ★
                </span>
              </button>
            ))}
            <span className="ml-3 text-xs font-semibold text-[#818cf8]">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Comment Input */}
        <div className="space-y-2">
          <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wider text-[#a0a5ba]">
            Review Comment
          </label>
          <textarea
            id="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your honest review here..."
            className="w-full bg-[#0d0f1a] border border-[#2a2e45] rounded-xl px-4 py-3 text-sm text-[#e8eaf6] placeholder-[#5c6380] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${loading
              ? 'bg-indigo-600/50 cursor-wait'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/20 active:scale-[0.98]'
            }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Posting Review...
            </>
          ) : (
            'Post Review'
          )}
        </button>

      </form>
    </div>
  );
}
