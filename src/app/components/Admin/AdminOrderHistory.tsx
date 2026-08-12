'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Order } from '../../types';

export default function AdminOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      // Admin fetches ALL orders including soft-deleted ones
      const data = await apiFetch<Order[]>('/api/orders?includeDeleted=true');
      setOrders(data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleHardDelete = async (orderId: string) => {
    if (!confirm('⚠️ WARNING: This will PERMANENTLY remove this order from the database. Are you sure you want to Hard Delete?')) {
      return;
    }

    setDeletingId(orderId);
    setMsg(null);

    try {
      // Hard Delete request with hard=true query flag
      await apiFetch(`/api/orders/${orderId}?hard=true`, {
        method: 'DELETE',
      });
      setMsg('Order permanently erased (Hard Delete successful)!');
      fetchAllOrders();
    } catch (err: unknown) {
      if (err instanceof Error) setMsg(`Hard Delete Error: ${err.message}`);
      else setMsg('Failed to hard delete order.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-[#16192b] border border-red-500/20 rounded-3xl overflow-hidden shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="p-6 border-b border-[#2a2e45] flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-red-500/5 to-purple-500/5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#e8eaf6]">
              🛡️ Admin Order History & Audit
            </h3>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
              Hard Delete Access
            </span>
          </div>
          <p className="text-xs text-[#7c83a0] mt-1">
            Admin console view displaying active & soft-deleted orders with permanent database purge options.
          </p>
        </div>

        <button
          onClick={fetchAllOrders}
          className="px-3.5 py-1.5 text-xs font-semibold bg-[#1e2238] text-[#a0a5ba] hover:text-white rounded-xl border border-[#2a2e45] transition-all"
        >
          🔄 Refresh Orders
        </button>
      </div>

      {msg && (
        <div className="mx-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-xs text-[#7c83a0] hover:text-white">✕</button>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="p-12 text-center text-[#7c83a0]">
          <p>Loading full order history for Admin...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-[#7c83a0]">
          <p>No orders found in database.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1e36] text-[#7c83a0] text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer Details</th>
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium text-center">Qty</th>
                <th className="p-4 font-medium text-center">Database Status</th>
                <th className="p-4 font-medium text-right">Admin Hard Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e45]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#1e2238]/50 transition-colors">
                  
                  {/* Order ID */}
                  <td className="p-4 font-mono text-xs text-[#e8eaf6]">
                    #{order.id.slice(0, 8)}...
                  </td>

                  {/* Customer Details */}
                  <td className="p-4 text-xs">
                    <div className="font-semibold text-white">
                      {order.user?.name || 'Unknown User'}
                    </div>
                    <div className="text-[#7c83a0] text-[11px]">
                      {order.user?.email || `ID: ${order.userId}`}
                    </div>
                  </td>

                  {/* Product */}
                  <td className="p-4 text-xs">
                    <div className="font-medium text-[#e8eaf6]">
                      {order.product?.title || 'Unknown Product'}
                    </div>
                    {order.product?.price && (
                      <div className="text-[#818cf8] text-[11px]">
                        ${(order.product.price / 100).toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="p-4 text-center text-[#e8eaf6] font-medium text-xs">
                    {order.quantity}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.isDeleted
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {order.isDeleted ? 'Soft Deleted' : 'Active'}
                    </span>
                  </td>

                  {/* Hard Delete Action */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleHardDelete(order.id)}
                      disabled={deletingId === order.id}
                      className="px-3.5 py-1.5 text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 rounded-xl transition-all shadow-sm"
                    >
                      {deletingId === order.id ? 'Deleting...' : '🗑️ Hard Delete'}
                    </button>
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
