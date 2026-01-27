"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  User,
  Star,
  MapPin,
  Phone,
  Package,
  Clock,
  TrendingUp,
  Users,
  Activity,
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bike,
  Car,
} from "lucide-react";

interface DeliveryPerson {
  userId: string;
  user: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  DeliveryProfile: {
    id: string;
    isAvailable: boolean;
    rating: number | null;
    completed: number;
    cancelled: number;
    phone: string | null;
    address: string | null;
    vehicleType: string | null;
  } | null;
  _count: {
    deliveries: number;
  };
}

interface DeliveryStats {
  totalDeliveryPersons: number;
  availableNow: number;
  averageRating: number;
  totalDeliveries: number;
  ongoingDeliveries: number;
  completedToday: number;
}

export default function DeliveryPersonsPage() {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "unavailable">("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "deliveries" | "joined">("name");

  const fetchDeliveryData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('status', filterStatus);
      params.append('sort', sortBy);

      const response = await fetch(`/api/canteen-home/delivery-persons?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Delivery data received:', data); // Debug log
        setDeliveryPersons(data.deliveryPersons || []);
        setStats(data.stats || {});
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || `Failed to load data (${response.status})`);
        console.error('Failed to fetch delivery data:', response.status, errorData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
      console.error('Error fetching delivery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, [searchTerm, filterStatus, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderStars = (rating: number | null) => {
    const actualRating = rating || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= actualRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {actualRating > 0 ? actualRating.toFixed(1) : "N/A"}
        </span>
      </div>
    );
  };

  const getVehicleIcon = (vehicleType: string | null) => {
    switch (vehicleType?.toLowerCase()) {
      case 'bike':
      case 'bicycle':
        return <Bike className="w-5 h-5 text-blue-600" />;
      case 'car':
        return <Car className="w-5 h-5 text-green-600" />;
      default:
        return <Truck className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
        <CheckCircle className="w-3 h-3" />
        Available
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
        <XCircle className="w-3 h-3" />
        Unavailable
      </span>
    );
  };

  if (isLoading) {
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
                  Loading Delivery Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Please wait while we fetch delivery personnel...</p>
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
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-l-[6px] border-red-500 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-red-500 to-rose-500 p-3 rounded-xl">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="ml-3 text-2xl font-extrabold text-gray-900 dark:text-white">Error Loading Data</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4">{error}</p>
            <button
              onClick={fetchDeliveryData}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10"></div>
        <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">Delivery Management</h1>
              <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg font-semibold">Manage and track your delivery personnel</p>
            </div>
            <button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:scale-105 transition-all">
              <Plus className="w-4 h-4" />
              Add Person
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-blue-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Total Delivery Persons</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.totalDeliveryPersons ?? 0}</p>
              </div>
              <div className="shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-green-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Available Now</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.availableNow ?? 0}</p>
              </div>
              <div className="shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-2xl shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-yellow-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Average Rating</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}</p>
              </div>
              <div className="shrink-0 bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-2xl shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border-l-[6px] border-purple-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold">Completed Today</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.completedToday ?? 0}</p>
              </div>
              <div className="shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-orange-200 dark:border-orange-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search delivery persons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="deliveries">Sort by Deliveries</option>
              <option value="joined">Sort by Join Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delivery Persons List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-orange-200 dark:border-orange-700">
        <div className="p-6 border-b-2 border-orange-200 dark:border-orange-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Personnel</h3>
        </div>
        
        {deliveryPersons.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Delivery Persons Found</h3>
            <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your filters to see more delivery persons." 
                : "You haven't added any delivery persons yet."}
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 mx-auto font-bold shadow-lg hover:scale-105 transition-all">
              <Plus className="w-4 h-4" />
              Add First Delivery Person
            </button>
          </div>
        ) : (
          <div className="divide-y divide-orange-100 dark:divide-orange-900">
            {deliveryPersons.map((person) => (
              <div key={person.userId} className="p-6 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {person.user.name?.charAt(0) || "D"}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {person.user.name || "Unknown Delivery Person"}
                        </h4>
                        {person.DeliveryProfile ? (
                          <>
                            {getStatusBadge(person.DeliveryProfile.isAvailable)}
                            <div className="flex items-center gap-1">
                              {getVehicleIcon(person.DeliveryProfile.vehicleType)}
                              <span className="text-xs text-gray-500">
                                {person.DeliveryProfile.vehicleType || 'No vehicle'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Profile Incomplete
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {person.user.phone || person.DeliveryProfile?.phone || 'No phone'}
                        </div>
                        {person.user.email && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {person.user.email}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {person.DeliveryProfile?.address || 'No address'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Rating</p>
                      {renderStars(person.DeliveryProfile?.rating || null)}
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Completed</p>
                      <p className="font-extrabold text-gray-900 dark:text-white">
                        {person.DeliveryProfile?.completed ?? 0}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Success Rate</p>
                      <p className="font-extrabold text-gray-900 dark:text-white">
                        {(() => {
                          const completed = person.DeliveryProfile?.completed || 0;
                          const cancelled = person.DeliveryProfile?.cancelled || 0;
                          const total = completed + cancelled;
                          return total > 0 ? ((completed / total) * 100).toFixed(0) : "0";
                        })()}%
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Total Orders</p>
                      <p className="font-extrabold text-gray-900 dark:text-white">{person._count?.deliveries ?? 0}</p>
                    </div>

                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="mt-4 flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      person.DeliveryProfile?.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-600">
                      {person.DeliveryProfile?.isAvailable ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  {person.DeliveryProfile?.rating && person.DeliveryProfile.rating >= 4.5 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Top Rated</span>
                    </div>
                  )}
                  
                  {person.DeliveryProfile?.completed && person.DeliveryProfile.completed >= 100 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>Experienced</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}  