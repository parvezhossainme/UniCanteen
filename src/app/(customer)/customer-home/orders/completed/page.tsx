"use client";
import React, { useEffect, useState } from "react";
import { Package, XCircle, Calendar, Clock } from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  food: { id: string; name: string; price: number; image?: string };
  canteen: { id: string; name: string };
};

type Order = {
  id: string;
  status: "DELIVERED" | "CANCELLED" | "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "DELIVERING";
  totalPrice: number;
  createdAt: string;
  deliveryAt?: string | null;
  foodItems: OrderItem[];
};

const statusStyles: Record<Order["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-orange-100 text-orange-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  DELIVERING: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function CompletedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/orders/completed", { cache: "no-store" });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to load orders");
        const data = await res.json();
        if (mounted) setOrders(data.orders || []);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen backdrop-blur-sm">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 shadow-2xl border-l-[6px] border-orange-500">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mr-4"></div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">Loading Completed Orders</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Please wait while we fetch your order history...</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-red-50/70 dark:bg-red-900/30 backdrop-blur-md border-l-[6px] border-red-500 p-8 shadow-xl">
        <div className="flex items-start">
          <XCircle className="w-12 h-12 text-red-600 dark:text-red-400 mr-4 shrink-0" />
          <div>
            <h2 className="text-2xl font-extrabold text-red-800 dark:text-red-300 mb-2">Error Loading Orders</h2>
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (orders.length === 0) return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center py-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500 p-12">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-xl">
          <Package className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">No Completed Orders Yet</h3>
        <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">Your completed orders will appear here once delivered.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 backdrop-blur-sm">
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500 p-8 mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 shadow-xl mr-4">
            <Package className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white drop-shadow-lg">Completed Orders</h1>
            <p className="text-slate-700 dark:text-slate-300 text-lg font-medium mt-1">Your order history and past deliveries</p>
          </div>
        </div>
      </div>
      {orders.map((order) => {
        const created = new Date(order.createdAt);
        const itemsByCanteen = order.foodItems.reduce<Record<string, OrderItem[]>>((acc, item) => {
          const key = item.canteen?.name || "Unknown";
          (acc[key] ||= []).push(item);
          return acc;
        }, {});
        return (
          <div key={order.id} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl overflow-hidden border-l-[6px] border-orange-500 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(251,146,60,0.3)]">
            <div className="p-8 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-slate-800/90">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <span className={`px-4 py-2 text-sm font-extrabold shadow-xl ${statusStyles[order.status]}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-bold">
                    <span className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 border-l-4 border-orange-500">Order ID: {order.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                    {created.toLocaleDateString()}
                    <Clock className="w-4 h-4 ml-3 mr-2 text-orange-500" />
                    {created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="text-right bg-gradient-to-br from-orange-500 to-amber-500 px-6 py-4 shadow-xl">
                  <div className="text-white text-xs font-bold uppercase tracking-wider mb-1">Total Amount</div>
                  <div className="text-white font-extrabold text-3xl">৳{order.totalPrice}</div>
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                {Object.entries(itemsByCanteen).map(([canteenName, items]) => (
                  <div key={canteenName} className="bg-white dark:bg-slate-800 border-l-4 border-orange-500 shadow-lg p-6">
                    <div className="font-extrabold text-lg text-slate-900 dark:text-white mb-4 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-orange-500" />
                      {canteenName.replace(/_/g, " ")}
                    </div>
                    <ul className="space-y-3">
                      {items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between text-base bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-700 dark:to-slate-600 p-3 border-l-2 border-orange-500">
                          <div className="truncate">
                            <span className="font-bold text-slate-900 dark:text-white">{it.food.name}</span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium"> × {it.quantity}</span>
                          </div>
                          <div className="text-orange-600 dark:text-orange-400 font-extrabold text-lg">৳{it.food.price * it.quantity}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
