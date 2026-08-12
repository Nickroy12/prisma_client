"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminOrderHistory from "../components/Admin/AdminOrderHistory";


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId?: string | null;
  category?: Category | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form states
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserStr = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedUserStr) {
      try {
        setUser(JSON.parse(savedUserStr));
      } catch {
        setUser(null);
      }
    }

    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const authToken = token || localStorage.getItem("token");

    if (!authToken) {
      setError("Authorization required. Please sign in as an Admin.");
      return;
    }

    if (!form.title.trim() || !form.description.trim() || !form.price || !form.stock) {
      setError("Please fill in all required fields (title, description, price, stock).");
      return;
    }

    const priceNum = parseInt(form.price, 10);
    const stockNum = parseInt(form.stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a valid positive integer.");
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setError("Stock must be a valid positive integer.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: form.title.trim(),
          description: form.description.trim(),
          price: priceNum,
          stock: stockNum,
          categoryId: form.categoryId || undefined,
        };

        const res = await fetch(`${API_BASE}/api/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to create product.");
          return;
        }

        setSuccessMsg(`Product "${data.data?.title || form.title}" created successfully!`);
        setForm({
          title: "",
          description: "",
          price: "",
          stock: "",
          categoryId: "",
        });

        // Refresh product list
        fetchProducts();
      } catch (err) {
        console.error("Create product error", err);
        setError("Network error. Unable to reach server.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#0d0f1a] text-[#e8eaf6] px-4 py-8 md:px-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[rgba(124,108,248,0.2)] text-[#a78bfa] border border-[rgba(124,108,248,0.3)]">
                Admin Panel
              </span>
            </div>
            <p className="text-sm text-[#7c83a0] mt-1">Manage products and catalog inventory</p>
          </div>

          <Link
            href="/"
            className="self-start md:self-auto px-4 py-2 rounded-xl text-sm font-semibold text-[#b0b5cc] bg-white/[0.05] border border-white/[0.09] hover:bg-white/10 hover:text-white transition-all no-underline"
          >
            ← View Store Products
          </Link>
        </div>

        {/* Access Notice if not Admin */}
        {user && user.role !== "ADMIN" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>You are signed in as <strong>{user.name}</strong> ({user.role}). Creating products requires an <strong>ADMIN</strong> role.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Add Product Form */}
          <div className="lg:col-span-6 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Add New Product</h2>
                <p className="text-xs text-[#7c83a0]">POST /api/products (verifyToken)</p>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-2.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Title */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-[#b0b5cc]">
                  Product Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Wireless Mechanical Keyboard"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#7c6cf8] focus:ring-2 focus:ring-[#7c6cf8]/20 transition-all placeholder:text-[#7c83a0]"
                />
              </div>

              {/* Product Description */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-[#b0b5cc]">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  placeholder="Provide detailed description of the product..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#7c6cf8] focus:ring-2 focus:ring-[#7c6cf8]/20 transition-all placeholder:text-[#7c83a0] resize-none"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="price" className="text-xs font-semibold uppercase tracking-wider text-[#b0b5cc]">
                    Price ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="99"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#7c6cf8] focus:ring-2 focus:ring-[#7c6cf8]/20 transition-all placeholder:text-[#7c83a0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stock" className="text-xs font-semibold uppercase tracking-wider text-[#b0b5cc]">
                    Stock Count <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="50"
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#7c6cf8] focus:ring-2 focus:ring-[#7c6cf8]/20 transition-all placeholder:text-[#7c83a0]"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label htmlFor="categoryId" className="text-xs font-semibold uppercase tracking-wider text-[#b0b5cc]">
                  Category <span className="text-[#7c83a0] lowercase font-normal">(optional)</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full bg-[#161829] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#7c6cf8] focus:ring-2 focus:ring-[#7c6cf8]/20 transition-all cursor-pointer"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm shadow-[0_4px_20px_rgba(124,108,248,0.35)] hover:shadow-[0_8px_28px_rgba(124,108,248,0.5)] hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer border-none [background:linear-gradient(135deg,#7c6cf8,#4fa8ff)] flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Product...
                  </>
                ) : (
                  "Create Product"
                )}
              </button>
            </form>
          </div>

          {/* Product Preview List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Existing Products</h2>
              <span className="text-xs text-[#7c83a0]">{products.length} products total</span>
            </div>

            {products.length === 0 ? (
              <div className="p-8 text-center bg-white/[0.02] border border-white/[0.06] rounded-3xl text-[#7c83a0]">
                No products found in database yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.15] rounded-2xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm">{prod.title}</h3>
                        {prod.category && (
                          <span className="px-2 py-0.5 text-[0.68rem] font-medium rounded-md bg-white/[0.06] text-[#a78bfa] border border-white/[0.08]">
                            {prod.category.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#7c83a0] line-clamp-1">{prod.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-emerald-400 text-sm">${prod.price}</div>
                      <div className="text-[0.72rem] text-[#7c83a0]">Stock: {prod.stock}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Admin Order History Section (With Hard Delete) */}
        <section className="pt-6">
          <AdminOrderHistory />
        </section>

      </div>
    </main>
  );
}

