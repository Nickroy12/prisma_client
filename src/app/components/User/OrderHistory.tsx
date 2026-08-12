'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Order, Product, User } from '../../types';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Quick Order Placement State for Client Testing
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Client can see their orders (including soft deleted cancelled orders)
      const data = await apiFetch<Order[]>('/api/orders?includeDeleted=true');
      setOrders(data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Fetch products & users for client place order helper
    async function loadOptions() {
      try {
        const prods = await apiFetch<Product[]>('/api/products');
        setAvailableProducts(prods || []);
        if (prods && prods.length > 0) setSelectedProduct(prods[0].id);

        const users = await apiFetch<User[]>('/api/users');
        setAvailableUsers(users || []);
        if (users && users.length > 0) setSelectedUser(users[0].id);
      } catch {
        // Ignore fetch errors
      }
    }
    loadOptions();
  }, []);

  const handleSoftDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel (soft delete) this order?')) return;

    setDeletingId(orderId);
    setMsg(null);

    try {
      // Soft Delete request (no hard=true flag)
      await apiFetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      setMsg('Order soft-deleted (cancelled) successfully!');
      fetchOrders();
    } catch (err: unknown) {
      if (err instanceof Error) setMsg(`Error: ${err.message}`);
      else setMsg('Failed to cancel order.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedProduct) return;

    setCreating(true);
    setMsg(null);

    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser,
          productId: selectedProduct,
          quantity,
        }),
      });
      setMsg('New order created successfully!');
      fetchOrders();
    } catch (err: unknown) {
      if (err instanceof Error) setMsg(`Error: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-[#16192b] border border-[#2a2e45] rounded-3xl overflow-hidden shadow-xl space-y-6">
      
      {/* Header */}
      <div className="p-6 border-b border-[#2a2e45] flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#e8eaf6] flex items-center gap-2">
            <span>📦</span> Client Order History
          </h3>
          <p className="text-xs text-[#7c83a0] mt-1">
            Client panel supporting <strong>Soft Delete</strong> (cancels order without erasing from database).
          </p>
        </div>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
          {orders.length} Total Orders
        </span>
      </div>

      {msg && (
        <div className="mx-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-xs text-[#7c83a0] hover:text-white">✕</button>
        </div>
      )}

      {/* Place Order Helper Form */}
      {availableProducts.length > 0 && availableUsers.length > 0 && (
        <div className="mx-6 p-4 bg-[#0d0f1a] border border-[#2a2e45] rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-[#a0a5ba] uppercase tracking-wider">
            + Quick Place Order (Test Order Creation)
          </h4>
          <form onSubmit={handleCreateOrder} className="flex flex-wrap items-center gap-3 text-xs">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-[#16192b] border border-[#2a2e45] text-[#e8eaf6] px-3 py-2 rounded-xl"
            >
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-[#16192b] border border-[#2a2e45] text-[#e8eaf6] px-3 py-2 rounded-xl"
            >
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.title} (${(p.price / 100).toFixed(2)})</option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 bg-[#16192b] border border-[#2a2e45] text-[#e8eaf6] px-3 py-2 rounded-xl"
            />

            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
            >
              {creating ? 'Placing...' : 'Place Order'}
            </button>
          </form>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="p-12 text-center text-[#7c83a0]">
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-[#7c83a0]">
          <p>No orders found. Place an order to see it here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1e36] text-[#7c83a0] text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Product / Customer</th>
                <th className="p-4 font-medium text-center">Quantity</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Client Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e45]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#1e2238]/50 transition-colors">
                  
                  {/* Order ID */}
                  <td className="p-4 font-mono text-xs text-[#e8eaf6]">
                    #{order.id.slice(0, 8)}...
                  </td>

                  {/* Product / User Info */}
                  <td className="p-4 text-xs">
                    <div className="font-semibold text-white">
                      {order.product?.title || 'Unknown Product'}
                    </div>
                    <div className="text-[#7c83a0] mt-0.5">
                      Buyer: {order.user?.name || order.userId}
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="p-4 text-center text-[#e8eaf6] font-medium text-xs">
                    {order.quantity}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.isDeleted
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {order.isDeleted ? 'Soft Deleted (Cancelled)' : 'Active'}
                    </span>
                  </td>

                  {/* Soft Delete Action Button */}
                  <td className="p-4 text-right">
                    {!order.isDeleted ? (
                      <button
                        onClick={() => handleSoftDelete(order.id)}
                        disabled={deletingId === order.id}
                        className="px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all"
                      >
                        {deletingId === order.id ? 'Cancelling...' : 'Cancel (Soft Delete)'}
                      </button>
                    ) : (
                      <span className="text-xs text-[#5c6380] italic">
                        Cancelled
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
