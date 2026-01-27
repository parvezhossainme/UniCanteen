"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Truck, MessageSquare, Clock, User, CheckCircle, XCircle } from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  food: { id: string; name: string; price: number; image?: string };
  canteen: { id: string; name: string };
};

type Order = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";
  totalPrice: number;
  createdAt: string;
  deliveryAt?: string | null;
  foodItems: OrderItem[];
  customer?: { user?: { name?: string | null } } | null;
  deliveryMan?: { user?: { name?: string | null } } | null;
  assignedTo?: string | null;
};

type DeliveryPerson = {
  userId: string;
  user: {
    name: string | null;
    phone: string | null;
  };
  DeliveryProfile: {
    isAvailable: boolean;
    rating: number | null;
  } | null;
};

const statusStyles: Record<Order["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-orange-100 text-orange-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-orange-100 text-orange-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function CompletedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [assigningOrder, setAssigningOrder] = useState<string | null>(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>("");
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/canteen-home/orders/completed", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const res = await fetch("/api/canteen-home/delivery-persons?status=available", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDeliveryPersons(data.deliveryPersons || []);
      }
    } catch (e) {
      console.error("Failed to fetch delivery persons:", e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const canAssignDelivery = (order: Order) => {
    // Can assign delivery within 30 minutes and if not already assigned
    const orderTime = new Date(order.createdAt).getTime();
    const now = new Date().getTime();
    const timeDiff = now - orderTime;
    const thirtyMinutes = 30 * 60 * 1000;
    
    return timeDiff <= thirtyMinutes && !order.assignedTo && order.status === 'DELIVERED';
  };

  const assignDeliveryPerson = async (orderId: string, deliveryPersonId: string) => {
    if (!deliveryPersonId) return;
    
    setAssigningOrder(orderId);
    try {
      const res = await fetch(`/api/canteen-home/orders/${orderId}/assign-delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPersonId }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to assign delivery person");
      }
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, assignedTo: deliveryPersonId } : order
      ));
      
      // Start conversation with delivery person
      await startConversationWithDelivery(orderId, deliveryPersonId);
      
      setShowAssignModal(null);
      setSelectedDeliveryPerson("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to assign delivery person");
    } finally {
      setAssigningOrder(null);
    }
  };

  const startConversationWithDelivery = async (orderId: string, deliveryPersonId: string) => {
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          participantIds: [deliveryPersonId], 
          orderId 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          // Redirect to messages with the conversation
          window.open(`/canteen-home/messages?c=${data.conversation.id}`, '_blank');
        }
      }
    } catch (e) {
      console.error("Failed to start conversation:", e);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                Loading Orders
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Please wait while we fetch completed orders...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="relative max-w-md w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl opacity-10"></div>
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-l-[6px] border-red-500 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-br from-red-500 to-rose-500 p-3 rounded-xl">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="ml-3 text-2xl font-extrabold text-gray-900 dark:text-white">Error</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">{error}</p>
        </div>
      </div>
    </div>
  );
  if (orders.length === 0) return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 p-6 rounded-3xl mb-4">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
          No Completed Orders
        </h3>
        <p className="text-gray-700 dark:text-gray-300 font-semibold">Completed orders will appear here.</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10"></div>
        <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-lg">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">Completed Orders</h1>
          <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg font-semibold">View and manage your completed orders</p>
        </div>
      </div>
      {orders.map((order) => {
        const created = new Date(order.createdAt);
        const itemsByCanteen = order.foodItems.reduce<Record<string, OrderItem[]>>((acc, item) => {
          const key = item.canteen?.name || "Unknown";
          (acc[key] ||= []).push(item);
          return acc;
        }, {});
        const subtotal = order.foodItems.reduce((sum, it) => sum + it.food.price * it.quantity, 0);
        return (
          <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border-2 border-orange-200 dark:border-orange-700 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyles[order.status]}`}>
                  {order.status.replace(/_/g, " ")}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Order ID: {order.id.slice(0, 8)}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  Placed {created.toLocaleDateString()} {created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {order.customer?.user?.name && (
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Customer: {order.customer.user.name}</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Subtotal (your items)</div>
                <div className="text-orange-600 dark:text-orange-400 font-extrabold text-lg">৳{subtotal}</div>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {Object.entries(itemsByCanteen).map(([canteenName, items]) => (
                <div key={canteenName} className="border-2 border-orange-200 dark:border-orange-700 rounded-xl p-3 bg-white/50 dark:bg-slate-700/50">
                  <div className="font-extrabold mb-2 text-gray-900 dark:text-white">{canteenName.replace(/_/g, " ")}</div>
                  <ul className="space-y-2">
                    {items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between text-sm">
                        <div className="truncate">
                          <span className="font-bold text-gray-900 dark:text-white">{it.food.name}</span>
                          <span className="text-gray-700 dark:text-gray-300 font-semibold"> × {it.quantity}</span>
                        </div>
                        <div className="text-gray-900 dark:text-white font-bold">৳{it.food.price * it.quantity}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                {order.deliveryMan?.user?.name ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                    <span>Delivery by {order.deliveryMan.user.name}</span>
                  </div>
                ) : order.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span>Delivery assigned</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Delivery person not assigned</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {order.deliveryAt && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    Delivered at: {new Date(order.deliveryAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
                
                {canAssignDelivery(order) && (
                  <button
                    onClick={() => setShowAssignModal(order.id)}
                    className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm rounded-xl flex items-center gap-1 font-bold shadow-lg hover:scale-105 transition-all"
                  >
                    <Truck className="w-4 h-4" />
                    Assign Delivery
                  </button>
                )}
                
                {order.assignedTo && (
                  <button
                    onClick={() => startConversationWithDelivery(order.id, order.assignedTo!)}
                    className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm rounded-xl flex items-center gap-1 font-bold shadow-lg hover:scale-105 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Delivery
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Delivery Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border-2 border-orange-200 dark:border-orange-700 shadow-2xl">
            <h3 className="text-lg font-extrabold mb-4 text-gray-900 dark:text-white">Assign Delivery Person</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Select Delivery Person
              </label>
              <select
                value={selectedDeliveryPerson}
                onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                className="w-full px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
              >
                <option value="">Choose delivery person...</option>
                {deliveryPersons
                  .filter(dp => dp.DeliveryProfile?.isAvailable)
                  .map((dp) => (
                    <option key={dp.userId} value={dp.userId}>
                      {dp.user.name || "Unknown"} 
                      {dp.DeliveryProfile?.rating && ` (${dp.DeliveryProfile.rating.toFixed(1)}★)`}
                      {dp.user.phone && ` - ${dp.user.phone}`}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(null);
                  setSelectedDeliveryPerson("");
                }}
                className="flex-1 px-4 py-2 border-2 border-orange-200 dark:border-orange-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-700 font-bold"
                disabled={assigningOrder === showAssignModal}
              >
                Cancel
              </button>
              <button
                onClick={() => assignDeliveryPerson(showAssignModal, selectedDeliveryPerson)}
                disabled={!selectedDeliveryPerson || assigningOrder === showAssignModal}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
              >
                {assigningOrder === showAssignModal ? "Assigning..." : "Assign & Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}