import { apiFetch } from '../../lib/api';
import { Product } from '../../types';
import ProductCard from './ProductCard';

async function getProducts(): Promise<Product[]> {
  try {
    return await apiFetch<Product[]>('/api/products');
  } catch {
    return [];
  }
}

interface ProductListProps {
  title?: string;
}

export default async function ProductList({ title }: ProductListProps) {
  const products = await getProducts();

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-2xl font-bold text-[#e8eaf6] mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span>
          {title}
        </h2>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[#16192b]/50 rounded-2xl border border-dashed border-[#2a2e45]">
          <span className="text-5xl mb-4 opacity-50">🔍</span>
          <p className="text-[#7c83a0]">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
