// Customer ongoing orders tracking with real-time status updates
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { 
    Clock, 
    CheckCircle, 
    Package, 
    Truck, 
    XCircle, 
    MessageCircle,
    User,
    Phone,
    RefreshCw
} from "lucide-react";

type OrderItem = {
    id: string;
    quantity: number;
    food: { id: string; name: string; price: number; image?: string };
    canteen: { id: string; name: string };
};

type Order = {
    id: string;
    status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "DELIVERING" | "DELIVERED" | "CANCELLED";
    totalPrice: number;
    createdAt: string;
    deliveryAt?: string | null;
    foodItems: OrderItem[];
    deliveryMan?: { 
        user?: { name?: string | null; phone?: string | null } | null;
        isAvailable?: boolean;
    } | null;
    assignedTo?: string | null;
};

const statusStyles: Record<Order["status"], string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-orange-100 text-orange-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    DELIVERING: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const statusIcons: Record<Order["status"], React.ReactNode> = {
    PENDING: <Clock className="w-4 h-4" />,
    ACCEPTED: <CheckCircle className="w-4 h-4" />,
    IN_PROGRESS: <Package className="w-4 h-4" />,
    DELIVERING: <Truck className="w-4 h-4" />,
    DELIVERED: <CheckCircle className="w-4 h-4" />,
    CANCELLED: <XCircle className="w-4 h-4" />,
};

const getStatusMessage = (status: Order["status"]): string => {
    switch (status) {
        case "PENDING": return "Order placed, waiting for canteen confirmation";
        case "ACCEPTED": return "Order confirmed, being prepared";
        case "IN_PROGRESS": return "Food is being prepared";
        case "DELIVERING": return "On the way to you";
        case "DELIVERED": return "Order delivered";
        case "CANCELLED": return "Order cancelled";
        default: return "Unknown status";
    }
};

export default function OngoingOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startingChatFor, setStartingChatFor] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders/ongoing", {
                cache: "no-store",
            });
            if (!res.ok) {
                throw new Error(
                    (await res.json()).error || "Failed to load orders"
                );
            }
            const data = await res.json();
            setOrders(data.orders || []);
            setError(null);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load orders"
            );
        } finally {
            setLoading(false);
        }
    };

    async function startChat(orderId: string) {
        try {
            setStartingChatFor(orderId);
            const res = await fetch("/api/messages/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            const data = await res.json();
            if (!res.ok || !data.conversation?.id) {
                throw new Error(data.error || "Failed to start chat");
            }
            // start chat
            window.location.href = `/customer-home/messages?c=${data.conversation.id}`;
        } catch (e) {
            console.error(e);
            alert(e instanceof Error ? e.message : "Unable to start chat");
        } finally {
            setStartingChatFor(null);
        }
    }

    useEffect(() => {
        fetchOrders();
        
        // Auto-refresh every 30 seconds if enabled
        const interval = autoRefresh ? setInterval(fetchOrders, 30000) : null;
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen backdrop-blur-sm">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 shadow-2xl border-l-[6px] border-orange-500">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mr-4"></div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">Loading Your Orders</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Fetching real-time order status...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-red-50/70 dark:bg-red-900/30 backdrop-blur-md border-l-[6px] border-red-500 p-8 shadow-2xl">
                    <div className="flex items-start">
                        <XCircle className="w-12 h-12 text-red-600 dark:text-red-400 mr-4 shrink-0" />
                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold text-red-800 dark:text-red-300 mb-2">Error Loading Orders</h2>
                            <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
                            <button 
                                onClick={fetchOrders}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 font-extrabold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                            >
                                <RefreshCw className="w-5 h-5 inline mr-2" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center py-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500 p-12">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-xl">
                        <Package className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">No Ongoing Orders</h3>
                    <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">
                        Your active orders will appear here when you place them.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6 backdrop-blur-sm">
            {/* Header */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500 p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-4 sm:mb-0">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 shadow-xl mr-4">
                            <Clock className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white drop-shadow-lg">Ongoing Orders</h1>
                            <p className="text-slate-700 dark:text-slate-300 text-lg font-medium mt-1">Track your current orders in real-time</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center px-5 py-3 text-sm font-extrabold shadow-xl transition-all duration-300 hover:scale-105 ${
                                autoRefresh 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-400' 
                                    : 'bg-slate-100 text-slate-700 border-2 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                            }`}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
                        </button>
                        <button
                            onClick={fetchOrders}
                            className="flex items-center px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border-l-[6px] border-yellow-500 shadow-xl hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-xl shadow-lg mr-3">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Pending</p>
                            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{orders.filter(o => o.status === 'PENDING').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border-l-[6px] border-purple-500 shadow-xl hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg mr-3">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Preparing</p>
                            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{orders.filter(o => ['ACCEPTED', 'IN_PROGRESS'].includes(o.status)).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border-l-[6px] border-blue-500 shadow-xl hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg mr-3">
                            <Truck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Delivering</p>
                            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{orders.filter(o => o.status === 'DELIVERING').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border-l-[6px] border-green-500 shadow-xl hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg mr-3 text-2xl font-extrabold text-white">
                            ৳
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Total Value</p>
                            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">৳{orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {orders.map((order) => {
                const created = new Date(order.createdAt);
                const itemsByCanteen = order.foodItems.reduce<
                    Record<string, OrderItem[]>
                >((acc, item) => {
                    const key = item.canteen?.name || "Unknown";
                    (acc[key] ||= []).push(item);
                    return acc;
                }, {});
                return (
                    <div
                        key={order.id}
                        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 p-6 hover:scale-[1.01] transition-transform duration-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold shadow-lg ${
                                        statusStyles[order.status]
                                    }`}
                                >
                                    {statusIcons[order.status]}
                                    {order.status.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                    Order ID: {order.id.slice(0, 8)}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                    Placed {created.toLocaleDateString()}{" "}
                                    {created.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                                    Total
                                </div>
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-extrabold text-2xl">
                                    ৳{order.totalPrice}
                                </div>
                            </div>
                        </div>
                        
                        {/* Status message */}
                        <div className="mb-4 px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border-l-4 border-orange-500 shadow-md">
                            <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                                {getStatusMessage(order.status)}
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            {Object.entries(itemsByCanteen).map(
                                ([canteenName, items]) => (
                                    <div
                                        key={canteenName}
                                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border-l-4 border-amber-500 shadow-lg"
                                    >
                                        <div className="font-extrabold text-gray-900 dark:text-white mb-3 text-lg">
                                            {canteenName.replace(/_/g, " ")}
                                        </div>
                                        <ul className="space-y-3">
                                            {items.map((it) => (
                                                <li
                                                    key={it.id}
                                                    className="flex items-center justify-between text-sm bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10 p-3 rounded-lg border-l-2 border-orange-400"
                                                >
                                                    <div className="truncate">
                                                        <span className="font-extrabold text-gray-900 dark:text-white">
                                                            {it.food.name}
                                                        </span>
                                                        <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                                            {" "}
                                                            × {it.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="text-orange-600 dark:text-orange-400 font-extrabold text-base">
                                                        ৳
                                                        {it.food.price *
                                                            it.quantity}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            )}
                        </div>
                        <div className="space-y-4">
                            {/* Delivery Information */}
                            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-l-4 border-blue-500 shadow-md">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
                                            Delivery Person
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                                            {order.assignedTo && order.deliveryMan?.user?.name
                                                ? order.deliveryMan.user.name
                                                : order.status === "PENDING"
                                                ? "Waiting for order confirmation"
                                                : order.status === "ACCEPTED" || order.status === "IN_PROGRESS"
                                                ? "Will be assigned soon"
                                                : "Not assigned yet"}
                                        </p>
                                        {order.deliveryMan?.user?.phone && (
                                            <div className="flex items-center mt-2">
                                                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                                                <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                                                    {order.deliveryMan.user.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {order.deliveryAt && (
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">ETA</p>
                                        <p className="text-base text-blue-600 dark:text-blue-400 font-extrabold">
                                            {new Date(order.deliveryAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => startChat(order.id)}
                                    className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:transform-none"
                                    disabled={startingChatFor === order.id}
                                    aria-busy={startingChatFor === order.id}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>
                                        {startingChatFor === order.id ? "Starting…" : "Start Chat"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
