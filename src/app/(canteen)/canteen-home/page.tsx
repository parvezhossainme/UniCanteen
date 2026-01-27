// Canteen owner dashboard with orders, revenue, and analytics overview
"use client"

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    ShoppingBag, 
    Clock, 
    CheckCircle, 
    DollarSign, 
    TrendingUp, 
    AlertTriangle,
    Star,
    Users,
    Eye,
    Package,
    ShoppingCart,
    Calendar,
    Settings
} from "lucide-react";
import type { CanteenDetails } from "@/types/canteen";

type DashboardStats = {
    totalFoodItems: number;
    availableFoodItems: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    totalReviews: number;
    averageRating: number;
};

type FoodItem = {
    id: string;
    name: string;
    price: number;
    image?: string;
    totalSold?: number;
    orderCount?: number;
    stocks?: number;
};

type RecentOrder = {
    id: string;
    customerName: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalPrice: number;
    status: string;
    createdAt: string;
};

export default function CanteenHome() {
  const { userId } = useAuth();
  const [canteenDetails, setCanteenDetails] = useState<CanteenDetails | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<FoodItem[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<FoodItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [canteenResponse, dashboardResponse] = await Promise.all([
                  fetch('/api/canteen-home/canteen-info'),
                  fetch('/api/canteen-home/dashboard')
              ]);

              if (!canteenResponse.ok || !dashboardResponse.ok) {
                  throw new Error('Failed to fetch data');
              }

              const [canteenData, dashboardData] = await Promise.all([
                  canteenResponse.json(),
                  dashboardResponse.json()
              ]);

              setCanteenDetails(canteenData);
              setDashboardStats(dashboardData.stats);
              setLowStockItems(dashboardData.lowStockItems || []);
              setTopSellingItems(dashboardData.topSellingItems || []);
              setRecentOrders(dashboardData.recentOrders || []);
          } catch (err) {
              setError(err instanceof Error ? err.message : 'An error occurred');
          } finally {
              setLoading(false);
          }
      };

      if (userId) {
          fetchData();
          // Set up polling for real-time updates
          const interval = setInterval(fetchData, 30000); // Update every 30 seconds
          return () => clearInterval(interval);
      }
  }, [userId]);


  if (loading) {
      return (
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
                                  Loading Dashboard
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Please wait while we fetch your data...</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="flex items-center justify-center min-h-screen p-6">
              <div className="relative max-w-md w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl opacity-10"></div>
                  <div className="relative bg-white/80 backdrop-blur-md border-l-[6px] border-red-500 rounded-3xl p-8 shadow-2xl">
                      <div className="flex items-center mb-4">
                          <div className="bg-gradient-to-br from-red-500 to-rose-500 p-3 rounded-xl">
                              <AlertTriangle className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="ml-3 text-2xl font-extrabold text-gray-900">Error Loading Dashboard</h2>
                      </div>
                      <p className="text-gray-700 font-semibold mb-4">{error}</p>
                      <button
                          onClick={() => window.location.reload()}
                          className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
                      >
                          Retry Loading
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (!canteenDetails) {
      return (
          <div className="flex items-center justify-center min-h-screen p-6">
              <div className="relative max-w-md w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl opacity-10"></div>
                  <div className="relative bg-white/80 backdrop-blur-md border-l-[6px] border-orange-500 rounded-3xl p-8 shadow-2xl text-center">
                      <div className="inline-flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl mb-4">
                          <AlertTriangle className="h-8 w-8 text-white" />
                      </div>
                      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">No Canteen Found</h1>
                      <p className="text-gray-700 font-semibold mb-6">Please contact an administrator to set up your canteen.</p>
                      <Link
                          href="/"
                          className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
                      >
                          Go to Home
                      </Link>
                  </div>
              </div>
          </div>
      );
  }

  return (
      <div className="p-6 mx-auto">
          {/* Header */}
          <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10"></div>
              <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-lg">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">{canteenDetails.name} Dashboard</h1>
                  <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg font-semibold">Manage your canteen operations and monitor performance</p>
              </div>
          </div>

          {/* Stats Grid */}
          {dashboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-blue-500 hover:scale-105 transition-transform">
                          <div className="flex items-center">
                              <div className="shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                                  <Package className="h-8 w-8 text-white" />
                              </div>
                              <div className="ml-4">
                                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Total Food Items</p>
                                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{dashboardStats.totalFoodItems}</p>
                                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">{dashboardStats.availableFoodItems} available</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-orange-500 hover:scale-105 transition-transform">
                          <div className="flex items-center">
                              <div className="shrink-0 bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-2xl shadow-lg">
                                  <ShoppingCart className="h-8 w-8 text-white" />
                              </div>
                              <div className="ml-4">
                                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Total Orders</p>
                                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{dashboardStats.totalOrders}</p>
                                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{dashboardStats.pendingOrders} pending</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-green-500 hover:scale-105 transition-transform">
                          <div className="flex items-center">
                              <div className="shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-2xl shadow-lg">
                                  <DollarSign className="h-8 w-8 text-white" />
                              </div>
                              <div className="ml-4">
                                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Total Revenue</p>
                                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white">৳{dashboardStats.totalRevenue}</p>
                                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">৳{dashboardStats.todayRevenue} today</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-yellow-500 hover:scale-105 transition-transform">
                          <div className="flex items-center">
                              <div className="shrink-0 bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-2xl shadow-lg">
                                  <Star className="h-8 w-8 text-white" />
                              </div>
                              <div className="ml-4">
                                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Reviews</p>
                                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{dashboardStats.averageRating}/5</p>
                                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-400">{dashboardStats.totalReviews} reviews</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* Today's Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1 h-full">
                  <div className="relative h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl opacity-5"></div>
                      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-orange-500 h-full flex flex-col">
                          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
                              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl mr-3">
                                  <Settings className="h-5 w-5 text-white" />
                              </div>
                              Quick Actions
                          </h3>
                          <div className="space-y-3">
                              <Link href="/canteen-home/food-items/add-food" className="flex items-center p-3 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl transition-all border-l-4 border-orange-400 hover:scale-105 shadow-md">
                                  <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg">
                                      <Package className="h-5 w-5 text-white" />
                                  </div>
                                  <span className="ml-3 font-bold text-orange-700">Add New Food Item</span>
                              </Link>
                              <Link href="/canteen-home/orders/pending" className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all border-l-4 border-blue-400 hover:scale-105 shadow-md">
                                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                                      <Clock className="h-5 w-5 text-white" />
                                  </div>
                                  <span className="ml-3 font-bold text-blue-700">Pending Orders ({dashboardStats?.pendingOrders || 0})</span>
                              </Link>
                              <Link href="/canteen-home/food-items/food-availability" className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all border-l-4 border-green-400 hover:scale-105 shadow-md">
                                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
                                      <Eye className="h-5 w-5 text-white" />
                                  </div>
                                  <span className="ml-3 font-bold text-green-700">Manage Availability</span>
                              </Link>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Today's Stats */}
              <div className="lg:col-span-2 h-full">
                  <div className="relative h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-5"></div>
                      <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-purple-500 h-full flex flex-col">
                          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
                              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl mr-3">
                                  <TrendingUp className="h-5 w-5 text-white" />
                              </div>
                              Today's Performance
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                  <div className="relative text-center p-6 backdrop-blur-sm rounded-xl border-l-4 border-blue-400 hover:scale-105 transition-transform">
                                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl mx-auto mb-3 w-fit">
                                          <Calendar className="h-6 w-6 text-white" />
                                      </div>
                                      <p className="text-sm font-bold text-blue-600 mb-1">Today's Orders</p>
                                      <p className="text-3xl font-extrabold text-blue-700">{dashboardStats?.todayOrders || 0}</p>
                                  </div>
                              </div>
                              <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                  <div className="relative text-center p-6 backdrop-blur-sm rounded-xl border-l-4 border-green-400 hover:scale-105 transition-transform">
                                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl mx-auto mb-3 w-fit">
                                          <DollarSign className="h-6 w-6 text-white" />
                                      </div>
                                      <p className="text-sm font-bold text-green-600 mb-1">Today's Revenue</p>
                                      <p className="text-3xl font-extrabold text-green-700">৳{dashboardStats?.todayRevenue || 0}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
              <div className="mb-8">
                  <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl opacity-10"></div>
                      <div className="relative bg-white dark:bg-slate-800 border-l-[6px] border-yellow-500 rounded-2xl p-6 shadow-xl">
                          <div className="flex items-center mb-4">
                              <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-xl">
                                  <AlertTriangle className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="ml-3 text-xl font-extrabold text-yellow-700 dark:text-yellow-400">Low Stock Alert</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {lowStockItems.slice(0, 6).map(item => (
                                  <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 backdrop-blur-sm rounded-xl border-2 border-yellow-200 dark:border-yellow-600 hover:border-yellow-400 transition-all shadow-md hover:scale-105">
                                      <span className="font-bold text-gray-900 dark:text-white">{item.name}</span>
                                      <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white font-extrabold rounded-full text-sm">{item.stocks} left</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling Items */}
              <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-5"></div>
                  <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-purple-500 h-full flex flex-col">
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
                          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl mr-3">
                              <Star className="h-5 w-5 text-white" />
                          </div>
                          Top Selling Items
                      </h3>
                      {topSellingItems.length > 0 ? (
                          <div className="space-y-4 overflow-y-auto max-h-96 scrollbar-hide">
                              {topSellingItems.map((item, index) => (
                                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all border-l-4 border-purple-400 hover:scale-105 shadow-md">
                                      <div className="shrink-0">
                                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                              <span className="text-white font-extrabold text-lg">#{index + 1}</span>
                                          </div>
                                      </div>
                                      <div className="grow">
                                          <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                                          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">৳{item.price} • {item.totalSold} sold</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-gray-600 dark:text-gray-400 text-center py-6 font-semibold">No sales data available</p>
                      )}
                  </div>
              </div>

              {/* Recent Orders */}
              <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-5"></div>
                  <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-blue-500 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center">
                              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl mr-3">
                                  <ShoppingBag className="h-5 w-5 text-white" />
                              </div>
                              Recent Orders
                          </h3>
                          <Link href="/canteen-home/orders" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-md">
                              View All
                          </Link>
                      </div>
                      {recentOrders.length > 0 ? (
                          <div className="space-y-4 overflow-y-auto max-h-96 scrollbar-hide">
                              {recentOrders.slice(0, 5).map(order => (
                                  <div key={order.id} className="flex items-center justify-between p-4 border-2 border-blue-100 dark:border-blue-700 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 hover:border-blue-300 transition-all hover:scale-105 shadow-md">
                                      <div>
                                          <p className="font-bold text-gray-900 dark:text-white">{order.customerName}</p>
                                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                              {order.items.length} item{order.items.length > 1 ? 's' : ''} • ৳{order.totalPrice}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                              {new Date(order.createdAt).toLocaleTimeString()}
                                          </p>
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                                          order.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900' :
                                          order.status === 'DELIVERED' ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-green-900' :
                                          'bg-gradient-to-r from-blue-400 to-cyan-400 text-blue-900'
                                      }`}>
                                          {order.status}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-gray-600 dark:text-gray-400 text-center py-6 font-semibold">No recent orders</p>
                      )}
                  </div>
              </div>
          </div>

          {/* Canteen Image Section */}
          <div className="mt-8">
              <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl opacity-5"></div>
                  <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-orange-500">
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
                          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl mr-3">
                              <Users className="h-5 w-5 text-white" />
                          </div>
                          Canteen Information
                      </h3>
                      <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/3">
                              <div className="relative w-full h-48 rounded-2xl overflow-hidden border-4 border-orange-200 dark:border-orange-600 shadow-lg">
                                  <Image 
                                      src={canteenDetails.canteen_image || '/default-canteen.jpg'} 
                                      alt={`${canteenDetails.name} image`} 
                                      fill
                                      className="object-cover"
                                  />
                              </div>
                          </div>
                          <div className="md:w-2/3 space-y-4">
                              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl border-l-4 border-orange-400">
                                  <h4 className="font-extrabold text-gray-900 dark:text-white mb-1">Canteen Name</h4>
                                  <p className="text-gray-700 dark:text-gray-300 font-semibold">{canteenDetails.name}</p>
                              </div>
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border-l-4 border-blue-400">
                                  <h4 className="font-extrabold text-gray-900 dark:text-white mb-1">Established</h4>
                                  <p className="text-gray-700 dark:text-gray-300 font-semibold">{new Date(canteenDetails.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-4">
                                  <Link 
                                      href="/canteen-home/settings" 
                                      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                                  >
                                      <Settings className="h-5 w-5" />
                                      Manage Settings
                                  </Link>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}