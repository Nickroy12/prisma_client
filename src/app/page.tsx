import ProductList from './components/Products/ProductList';
import CategorySidebar from './components/Categories/CategorySidebar';

import ReviewList from './components/Reviews/ReviewList';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0d0f1a] text-[#e8eaf6] font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header */}
        <header className="border-b border-[#2a2e45] pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Prisma App
          </h1>
          <p className="text-[#7c83a0] text-lg">
            A premium UI connected live to the Prisma backend.
          </p>
        </header>





        {/* Catalog Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-[#a0a5ba]">Product Catalog</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <CategorySidebar />
            <div className="flex-1">
              <ProductList title="All Products" />
              <ReviewList />
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
