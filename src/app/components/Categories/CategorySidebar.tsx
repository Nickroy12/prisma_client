import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { Category } from '../../types';

async function getCategories(): Promise<Category[]> {
  try {
    return await apiFetch<Category[]>('/api/categories');
  } catch {
    return [];
  }
}

interface CategorySidebarProps {
  activeCategoryId?: string;
}

export default async function CategorySidebar({ activeCategoryId }: CategorySidebarProps) {
  const categories = await getCategories();

  return (
    <aside className="w-full md:w-64 flex flex-col gap-2">
      <h3 className="text-[#e8eaf6] font-semibold text-lg px-4 mb-2">Categories</h3>

      <div className="flex flex-col space-y-1">
        <Link
          href="/products"
          className={`px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
            !activeCategoryId
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
              : 'text-[#7c83a0] hover:bg-[#1e2238] hover:text-[#e8eaf6] border border-transparent'
          }`}
        >
          <span className="font-medium">All Products</span>
        </Link>

        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className={`px-4 py-3 rounded-xl flex flex-col transition-all ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  : 'text-[#7c83a0] hover:bg-[#1e2238] hover:text-[#e8eaf6] border border-transparent'
              }`}
            >
              <span className="font-medium">{category.name}</span>
              {category.description && (
                <span className="text-xs opacity-70 mt-1 line-clamp-1">{category.description}</span>
              )}
            </Link>
          );
        })}

        {categories.length === 0 && (
          <p className="text-[#5c6380] text-sm px-4">No categories found.</p>
        )}
      </div>
    </aside>
  );
}
