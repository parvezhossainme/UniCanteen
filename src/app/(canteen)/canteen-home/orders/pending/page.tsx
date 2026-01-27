// Canteen pending orders management with accept and reject actions
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Eye, 
  Phone, 
  MapPin, 
  Package,
  DollarSign,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Truck,
  X
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
  customer?: { user?: { name?: string | null; email?: string } } | null;
  deliveryMan?: { 
    user?: { name?: string | null; phone?: string | null } | null;
    isAvailable?: boolean;
  } | null;
  assignedTo?: string | null;
};

const statusStyles: Record<Order["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ACCEPTED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERING: "bg-orange-100 text-orange-800 border-orange-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const statusIcons: Record<Order["status"], React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  ACCEPTED: <CheckCircle className="w-4 h-4" />,
  IN_PROGRESS: <Package className="w-4 h-4" />,
  DELIVERING: <Truck className="w-4 h-4" />,
  DELIVERED: <CheckCircle className="w-4 h-4" />,
  CANCELLED: <XCircle className="w-4 h-4" />,
};

export default function PendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingChatFor, setStartingChatFor] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Delivery management states
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>("");
  const [assigningDelivery, setAssigningDelivery] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/canteen-home/orders/pending", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
    
    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(fetchOrders, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Filter orders
  useEffect(() => {
    let filtered = orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
                          order.customer?.user?.name?.toLowerCase().includes(searchLower) ||
                          order.id?.toLowerCase().includes(searchLower) ||
                          false;
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  async function acceptOrderWithAutoAssignment(orderId: string) {
    if (!confirm("Are you sure you want to accept this order? A delivery person will be automatically assigned within 2 minutes.")) return;
    
    setProcessingOrder(orderId);
    try {
      const res = await fetch(`/api/canteen-home/orders/${orderId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to accept order");
      }
      
      const result = await res.json();
      
      // Update the local state immediately
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: "ACCEPTED" } : order
      ));
      
      // Show success message
      alert("Order accepted! A delivery person will be automatically assigned within 2 minutes.");
      
      // Refetch to ensure we have the latest data
      fetchOrders();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to accept order");
    } finally {
      setProcessingOrder(null);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: Order["status"]) {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this order?`)) return;
    
    setProcessingOrder(orderId);
    try {
      const res = await fetch(`/api/canteen-home/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update order");
      }
      
      const result = await res.json();
      const updatedOrder = result.order || result;
      
      // Update the local state immediately
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Also refetch to ensure we have the latest data
      fetchOrders();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update order");
    } finally {
      setProcessingOrder(null);
    }
  }

  async function startChat(orderId: string) {
    try {
      setStartingChatFor(orderId);
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.conversation?.id) throw new Error(data.error || "Failed to start chat");
      window.location.href = `/canteen-home/messages?c=${data.conversation.id}`;
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Unable to start chat");
    } finally {
      setStartingChatFor(null);
    }
  }

  const fetchDeliveryPersons = async () => {
    try {
      const res = await fetch("/api/canteen-home/delivery-persons?status=available", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        console.log("🚛 Delivery persons fetched:", data.deliveryPersons);
        setDeliveryPersons(data.deliveryPersons || []);
      }
    } catch (e) {
      console.error("Failed to fetch delivery persons:", e);
    }
  };

  const assignDeliveryPerson = async (orderId: string, deliveryPersonId: string) => {
    if (!deliveryPersonId) return;
    
    setAssigningDelivery(orderId);
    try {
      console.log("Assigning delivery person:", { orderId, deliveryPersonId });
      const url = `/api/canteen-home/orders/${orderId}/assign-delivery`;
      console.log("API URL:", url);
      
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPersonId }),
      });
      
      console.log("Response status:", res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response:", errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: `HTTP ${res.status}: ${res.statusText}` };
        }
        throw new Error(error.message || error.error || "Failed to assign delivery person");
      }
      
      // Update local state and refetch orders
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, assignedTo: deliveryPersonId } : order
      ));
      
      // Close all modals and reset state
      setShowDeliveryModal(false);
      setSelectedOrder(null);
      setSelectedDeliveryPerson("");
      
      // Refresh orders to show updated status
      fetchOrders();
      
      // Show success message
      console.log("✅ Delivery person assigned successfully!");
      
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to assign delivery person");
    } finally {
      setAssigningDelivery(null);
    }
  };



  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const orderTime = new Date(dateString).getTime();
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error Loading Orders</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchOrders}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10 -left-4 -right-4"></div>
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Orders Management</h1>
            <p className="text-gray-700 font-semibold">Monitor and manage incoming orders</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all ${
              autoRefresh 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          <button
            onClick={fetchOrders}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-md p-4 rounded-2xl border-l-[6px] border-yellow-500 shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-2 rounded-xl">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-gray-600">Pending</p>
                <p className="text-2xl font-extrabold text-gray-900">{orders.filter(o => o.status === 'PENDING').length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-md p-4 rounded-2xl border-l-[6px] border-purple-500 shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-gray-600">Preparing</p>
                <p className="text-2xl font-extrabold text-gray-900">{orders.filter(o => ['ACCEPTED', 'IN_PROGRESS'].includes(o.status)).length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-md p-4 rounded-2xl border-l-[6px] border-blue-500 shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-gray-600">Delivering</p>
                <p className="text-2xl font-extrabold text-gray-900">{orders.filter(o => o.status === 'DELIVERING').length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-md p-4 rounded-2xl border-l-[6px] border-green-500 shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-xl flex items-center justify-center">
                <span className="text-white font-extrabold text-lg">৳</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-gray-600">Total Value</p>
                <p className="text-2xl font-extrabold text-gray-900">৳{orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-5"></div>
        <div className="relative bg-white/80 backdrop-blur-md p-4 rounded-2xl border-l-[6px] border-blue-500 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm font-semibold"
              />
            </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Active Orders</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DELIVERING">Delivering</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length === 0 
              ? 'Orders will appear here when customers place them.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const isProcessing = processingOrder === order.id;
            const timeAgo = getTimeAgo(order.createdAt);
            
            return (
              <div key={order.id || `order-${index}`} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Order Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[order.status || 'PENDING']}`}>
                          {statusIcons[order.status || 'PENDING']}
                          <span className="ml-2">{(order.status || 'PENDING').replace(/_/g, " ")}</span>
                        </span>
                        <span className="text-sm text-gray-500">#{(order.id || '').slice(0, 8)}</span>
                        <span className="text-sm text-gray-500">{timeAgo}</span>
                      </div>

                      {/* Customer Info */}
                      {order.customer?.user && (
                        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{order.customer.user.name}</p>
                            {order.customer.user.email && (
                              <p className="text-sm text-gray-600">{order.customer.user.email}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Items Ordered:</h4>
                        <div className="space-y-2">
                          {(order.foodItems || []).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-3">
                                {item.food?.image && (
                                  <div className="relative w-10 h-10">
                                    <Image
                                      src={item.food.image}
                                      alt={item.food.name}
                                      fill
                                      className="rounded object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">{item.food?.name || 'Unknown Item'}</p>
                                  <p className="text-sm text-gray-600">Quantity: {item.quantity || 0}</p>
                                  {item.canteen?.name && (
                                    <p className="text-xs text-blue-600">From: {item.canteen.name}</p>
                                  )}
                                </div>
                              </div>
                              <span className="font-medium text-gray-900">৳{((item.food?.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Total */}
                      <div className="flex justify-between items-center py-3 border-t">
                        <span className="font-semibold text-lg text-gray-900">Total Amount:</span>
                        <span className="font-bold text-xl text-green-600">৳{(order.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col space-y-2 min-w-35">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => acceptOrderWithAutoAssignment(order.id)}
                            disabled={isProcessing}
                            className="flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Accept & Auto-Assign
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              // Accept order first, then show manual assignment
                              updateOrderStatus(order.id, 'ACCEPTED').then(() => {
                                fetchDeliveryPersons();
                                setSelectedOrder(order);
                                setShowDeliveryModal(true);
                              });
                            }}
                            disabled={isProcessing}
                            className="flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                          >
                            <User className="w-3 h-3 mr-1" />
                            Accept & Manual Assign
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                            disabled={isProcessing}
                            className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {order.status === 'ACCEPTED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                          disabled={isProcessing}
                          className="flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Start Preparing
                        </button>
                      )}
                      
                      {order.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERING')}
                          disabled={isProcessing}
                          className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Ready
                        </button>
                      )}

                      {order.status === 'DELIVERING' && !order.assignedTo && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDeliveryModal(true);
                          }}
                          disabled={isProcessing}
                          className="flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                        >
                          <User className="w-3 h-3 mr-1" />
                          Assign Rider
                        </button>
                      )}

                      {order.status === 'DELIVERING' && order.assignedTo && (
                        <>
                          <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                            <User className="w-3 h-3 mr-1" />
                            Rider Assigned
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeliveryModal(true);
                            }}
                            disabled={isProcessing}
                            className="flex items-center justify-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                          >
                            <User className="w-3 h-3 mr-1" />
                            Change Rider
                          </button>
                        </>
                      )}

                      {(order.status === 'ACCEPTED' || order.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDeliveryModal(true);
                          }}
                          disabled={isProcessing}
                          className="flex items-center justify-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                        >
                          <User className="w-3 h-3 mr-1" />
                          Pre-Assign Rider
                        </button>
                      )}
                      
                      <button
                        onClick={() => startChat(order.id)}
                        disabled={startingChatFor === order.id}
                        className="flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {startingChatFor === order.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && !showDeliveryModal && (
        <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-700">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Order ID:</h4>
                  <p className="text-gray-600">{selectedOrder.id}</p>
                </div>
                <div>
                  <h4 className="font-medium">Status:</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${statusStyles[selectedOrder.status]}`}>
                    {statusIcons[selectedOrder.status]}
                    <span className="ml-1">{selectedOrder.status}</span>
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">Order Time:</h4>
                  <p className="text-gray-600">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                {selectedOrder.customer?.user && (
                  <div>
                    <h4 className="font-medium">Customer:</h4>
                    <p className="text-gray-600">{selectedOrder.customer.user.name}</p>
                    {selectedOrder.customer.user.email && (
                      <p className="text-gray-500 text-sm">{selectedOrder.customer.user.email}</p>
                    )}
                  </div>
                )}
                {selectedOrder.assignedTo && selectedOrder.deliveryMan && (
                  <div>
                    <h4 className="font-medium">Delivery Person:</h4>
                    <p className="text-gray-600">{selectedOrder.deliveryMan.user?.name || 'N/A'}</p>
                    {selectedOrder.deliveryMan.user?.phone && (
                      <p className="text-gray-500 text-sm">{selectedOrder.deliveryMan.user.phone}</p>
                    )}
                    <p className="text-xs text-gray-500">Status: {selectedOrder.deliveryMan.isAvailable ? "Available" : "Busy"}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium">Items:</h4>
                  <div className="space-y-2 mt-2">
                    {selectedOrder.foodItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{item.food.name} x {item.quantity}</span>
                          {item.canteen?.name && (
                            <p className="text-xs text-blue-600">From: {item.canteen.name}</p>
                          )}
                        </div>
                        <span className="font-medium">৳{(item.food.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">৳{selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Assignment Modal */}
      {showDeliveryModal && selectedOrder && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-orange-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedOrder.assignedTo ? "Change Delivery Person" : "Assign Delivery Person"}
              </h3>
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setSelectedOrder(null);
                  setSelectedDeliveryPerson("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Order ID: {selectedOrder.id}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Total: ৳{selectedOrder.totalPrice.toFixed(2)}
              </p>
              
              {/* Show current delivery person if assigned */}
              {selectedOrder.assignedTo && selectedOrder.deliveryMan && selectedOrder.deliveryMan.user && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">Current Delivery Person:</p>
                  <p className="text-sm text-blue-700">
                    {selectedOrder.deliveryMan.user.name || 'N/A'} - {selectedOrder.deliveryMan.user.phone || 'N/A'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Status: {selectedOrder.deliveryMan.isAvailable ? "Available" : "Busy"}
                  </p>
                </div>
              )}
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedOrder.assignedTo ? "Select New Delivery Person" : "Select Delivery Person"}
              </label>
              <select
                value={selectedDeliveryPerson}
                onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Choose a rider...</option>
                {deliveryPersons.map((person, idx) => (
                  <option 
                    key={person.userId || idx} 
                    value={person.userId}
                    disabled={person.userId === selectedOrder.assignedTo}
                  >
                    {person.user.name} - {person.user.phone}
                    {person.userId === selectedOrder.assignedTo ? " (Current)" : ""}
                    {!person.isAvailable ? " (Busy)" : ""}
                  </option>
                ))}
              </select>
              
              {selectedOrder.assignedTo && (
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Changing the delivery person will notify both the current and new rider.
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setSelectedOrder(null);
                  setSelectedDeliveryPerson("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedDeliveryPerson && selectedOrder) {
                    assignDeliveryPerson(selectedOrder.id, selectedDeliveryPerson);
                  }
                }}
                disabled={!selectedDeliveryPerson || assigningDelivery === selectedOrder.id || selectedDeliveryPerson === selectedOrder.assignedTo}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {assigningDelivery === selectedOrder.id ? 
                  (selectedOrder.assignedTo ? "Changing..." : "Assigning...") : 
                  (selectedOrder.assignedTo ? "Change Rider" : "Assign Rider")
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}