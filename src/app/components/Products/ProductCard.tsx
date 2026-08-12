"use client";
import Link from 'next/link';
import { Product } from '../../types';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthHeader } from '../../lib/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const router = useRouter();

  const handleAdd = async () => {
    if (isOutOfStock) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to place an order');
      return;
    }
    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify({ quantity: 1, productId: product.id }),
      });
      // Navigate to orders page to view the new order
      router.push('/orders');
    } catch (err) {
      console.error('Failed to create order', err);
      const message = err instanceof Error ? err.message : 'Failed to place order';
      alert(message);
    }
  };



  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#16192b] border border-[#2a2e45] transition-all hover:border-[#6366f1] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] duration-300">
      {/* Image Placeholder */}
      <Link href={`/products/${product.id}`} className="aspect-[4/3] bg-gradient-to-br from-[#1e2238] to-[#121422] flex items-center justify-center p-6 relative cursor-pointer group-hover:scale-105 transition-transform duration-300">
        <span className="text-5xl">📦</span>
        {isOutOfStock && (
          <div className="absolute top-3 right-3 bg-red-500/10 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/20 backdrop-blur-sm">
            Out of Stock
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-4">
          <Link href={`/products/${product.id}`} className="flex-1">
            <h3 className="text-[#e8eaf6] font-semibold text-lg leading-tight line-clamp-2 group-hover:text-[#818cf8] transition-colors">
              {product.title}
            </h3>
          </Link>
          <span className="text-[#818cf8] font-bold text-lg whitespace-nowrap">
            ${(product.price / 100).toFixed(2)}
          </span>
        </div>

        <p className="text-[#7c83a0] text-sm line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2a2e45] mt-auto gap-2">
          <div className="text-xs text-[#5c6380]">
            Stock: <span className="font-semibold text-[#a0a5ba]">{product.stock}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/products/${product.id}`}
              className="text-xs font-medium px-3 py-2 rounded-lg bg-[#1e2238] text-[#a0a5ba] hover:bg-[#2a2e45] hover:text-white transition-all"
            >
              Details
            </Link>
            <button
              disabled={isOutOfStock}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-all ${isOutOfStock
                  ? 'bg-[#1e2238] text-[#5c6380] cursor-not-allowed'
                  : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                }`}
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
