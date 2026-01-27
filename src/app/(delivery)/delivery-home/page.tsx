// Delivery person dashboard with order assignments and earnings tracking
"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
    ArrowUpDown,
    Ban,
    HandCoins,
    Wallet,
    Search,
    Package,
    Clock,
    MapPin,
    Settings,
    Play,
    Power,
    PowerOff,
} from "lucide-react";

type Stats = {
    totalOrders: number;
    totalCollections: number;
    totalProfit: number;
    cancelledOrders: number;
};

type OrderItem = {
    id: string;
    quantity: number;
    food: { id: string; name: string; price: number };
    canteen: { id: string; name: string };
};

type Order = {
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    deliveryAt?: string | null;
    foodItems: OrderItem[];
    customer?: { user?: { name?: string | null } } | null;
};

type Notification = {
    id: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender?: { name?: string | null; email?: string | null } | null;
    order?: { id: string; status: string } | null;
};

const DeliveryHome = () => {
    const { user } = useUser();
    const [stats, setStats] = useState<Stats | null>(null);
    const [ongoingOrders, setOngoingOrders] = useState<Order[]>([]);
    const [upcomingOrders, setUpcomingOrders] = useState<Order[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isAvailable, setIsAvailable] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch availability status
    useEffect(() => {
        if (!user) return;

        async function fetchAvailability() {
            try {
                const response = await fetch('/api/delivery-home/profile');
                const data = await response.json();
                if (data.profile) {
                    setIsAvailable(data.profile.isAvailable || false);
                }
            } catch (error) {
                console.error('Error fetching availability:', error);
            }
        }

        fetchAvailability();
    }, [user]);

    async function toggleAvailability() {
        if (profileLoading) return;
        
        try {
            setProfileLoading(true);
            const newAvailability = !isAvailable;
            
            const response = await fetch('/api/delivery-home/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: { isAvailable: newAvailability },
                    timeSlots: []
                }),
            });
            
            if (response.ok) {
                setIsAvailable(newAvailability);
            }
        } catch (error) {
            console.error('Error updating availability:', error);
        } finally {
            setProfileLoading(false);
        }
    }

    useEffect(() => {
        if (!user) return;

        async function fetchData() {
            try {
                setLoading(true);
                
                // Ensure DeliveryPerson record exists before fetching data
                await fetch("/api/delivery-person/manage");
                
                const [statsRes, ongoingRes, upcomingRes, notificationsRes] = await Promise.all([
                    fetch("/api/delivery-home/stats"),
                    fetch("/api/delivery-home/ongoing-orders"),
                    fetch("/api/delivery-home/upcoming-orders"),
                    fetch("/api/delivery-home/notifications"),
                ]);

                const [statsData, ongoingData, upcomingData, notificationsData] = await Promise.all([
                    statsRes.json(),
                    ongoingRes.json(),
                    upcomingRes.json(),
                    notificationsRes.json(),
                ]);

                setStats(statsData);
                setOngoingOrders(ongoingData.orders || []);
                setUpcomingOrders(upcomingData.orders || []);
                setNotifications(notificationsData.notifications || []);
                setUnreadCount(notificationsData.unreadCount || 0);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    async function takeOrder(orderId: string) {
        try {
            const res = await fetch("/api/delivery-home/upcoming-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            
            if (res.ok) {
                // Refresh data after taking order
                const [ongoingRes, upcomingRes, notificationsRes] = await Promise.all([
                    fetch("/api/delivery-home/ongoing-orders"),
                    fetch("/api/delivery-home/upcoming-orders"),
                    fetch("/api/delivery-home/notifications"),
                ]);
                
                const [ongoingData, upcomingData, notificationsData] = await Promise.all([
                    ongoingRes.json(),
                    upcomingRes.json(),
                    notificationsRes.json(),
                ]);
                
                setOngoingOrders(ongoingData.orders || []);
                setUpcomingOrders(upcomingData.orders || []);
                setNotifications(notificationsData.notifications || []);
                setUnreadCount(notificationsData.unreadCount || 0);
            }
        } catch (error) {
            console.error("Error taking order:", error);
        }
    }

    async function markNotificationAsRead(notificationId: string) {
        try {
            await fetch("/api/delivery-home/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId }),
            });
            
            // Update local state
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    }

    async function markAllNotificationsAsRead() {
        try {
            await fetch("/api/delivery-home/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllAsRead: true }),
            });
            
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    }

    if (!user) {
        return <div>Please sign in</div>;
    }

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="pt-10">
            {/* Header with Clock and Availability Toggle */}
            <div className="bg-white/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20 mx-10 mb-6">
                <div className="flex items-center justify-between">
                    {/* Real-time Clock */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-8 h-8 text-orange-500" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Current Time</h3>
                                <p className="text-2xl font-bold text-gray-900 font-mono">
                                    {currentTime.toLocaleTimeString([], {
                                        hour12: true,
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {currentTime.toLocaleDateString([], {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <h3 className="text-lg font-semibold text-gray-800">Delivery Status</h3>
                            <p className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                {isAvailable ? 'Available for deliveries' : 'Currently offline'}
                            </p>
                        </div>
                        <button
                            onClick={toggleAvailability}
                            disabled={profileLoading}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                isAvailable 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                            } ${profileLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {profileLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isAvailable ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                                    <span>{isAvailable ? 'GO OFFLINE' : 'GO ONLINE'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="flex justify-between p-4 bg-white/70 backdrop-blur-md rounded-lg shadow-lg border border-white/20 mx-10">
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm shadow-lg p-4 rounded-lg border border-white/30">
                    <ArrowUpDown className="border-2 rounded-full border-orange-500 text-orange-500 h-16 w-16 p-2" />
                    <div>
                        <h2 className="text-gray-700 font-medium">Total Orders</h2>
                        <h1 className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm shadow-lg p-4 rounded-lg border border-white/30">
                    <Wallet className="border-2 rounded-full border-orange-500 text-orange-500 h-16 w-16 p-2" />
                    <div>
                        <h2 className="text-gray-700 font-medium">Total Collections</h2>
                        <h1 className="text-2xl font-bold text-gray-800">৳{stats?.totalCollections || 0}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm shadow-lg p-4 rounded-lg border border-white/30">
                    <HandCoins className="border-2 rounded-full border-orange-500 text-orange-500 h-16 w-16 p-2" />
                    <div>
                        <h2 className="text-gray-700 font-medium">Total Profit</h2>
                        <h1 className="text-2xl font-bold text-gray-800">৳{Math.round(stats?.totalProfit || 0)}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm shadow-lg p-4 rounded-lg border border-white/30">
                    <Ban className="border-2 rounded-full border-orange-500 text-orange-500 h-16 w-16 p-2" />
                    <div>
                        <h2 className="text-gray-700 font-medium">Order Cancelled</h2>
                        <h1 className="text-2xl font-bold text-gray-800">{stats?.cancelledOrders || 0}</h1>
                    </div>
                </div>
            </div>

            {/* Orders Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mx-10">
                {/* Recent Ongoing Orders */}
                <div className="bg-white/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Recent Ongoing Orders
                        </h2>
                        <div className="flex items-center gap-2">
                            <button className="text-gray-600 hover:text-gray-800">
                                All
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {ongoingOrders.length === 0 ? (
                        <div className="text-gray-600 text-center py-8">No ongoing orders</div>
                    ) : (
                        ongoingOrders.map((order, index) => {
                            const customerName = order.customer?.user?.name || "Unknown Customer";
                            const canteenNames = [...new Set(order.foodItems.map(item => item.canteen.name))].join(", ");
                            const timeAgo = new Date(order.createdAt);
                            const hoursAgo = Math.floor((Date.now() - timeAgo.getTime()) / (1000 * 60 * 60));
                            
                            return (
                                <div 
                                    key={order.id} 
                                    className={`border rounded-lg p-4 mb-4 bg-white/40 backdrop-blur-sm ${
                                        index === 0 ? 'border-2 border-orange-400' : 'border border-white/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            index === 0 ? 'bg-orange-100' : 'bg-gray-100'
                                        }`}>
                                            <Package className={`w-6 h-6 ${
                                                index === 0 ? 'text-orange-600' : 'text-gray-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold ${
                                                index === 0 ? 'text-orange-600' : 'text-gray-800'
                                            }`}>
                                                Delivery Food to {customerName}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{hoursAgo}h ago</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{canteenNames}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Upcoming Orders */}
                <div className="bg-white/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        Upcoming Orders
                    </h2>

                    {upcomingOrders.length === 0 ? (
                        <div className="text-gray-600 text-center py-8">No upcoming orders available</div>
                    ) : (
                        upcomingOrders.map((order) => {
                            const customerName = order.customer?.user?.name || "Unknown Customer";
                            const canteenNames = [...new Set(order.foodItems.map(item => item.canteen.name))].join(", ");
                            const orderTime = new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            
                            return (
                                <div key={order.id} className="flex items-center justify-between p-4 border border-white/30 bg-white/40 backdrop-blur-sm rounded-lg mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Settings className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {canteenNames} - {customerName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {orderTime} • ৳{order.totalPrice}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => takeOrder(order.id)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                                    >
                                        Take
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Notifications & Alerts */}
            <div className="bg-white/70 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20 mt-6 mx-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Notifications & Alerts
                        </h2>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="text-gray-600 text-center py-8">No notifications</div>
                    ) : (
                        notifications.slice(0, 10).map((notification, index) => {
                            const timeAgo = new Date(notification.createdAt);
                            const hoursAgo = Math.floor((Date.now() - timeAgo.getTime()) / (1000 * 60 * 60));
                            const displayTime = hoursAgo < 1 ? 'Just now' : 
                                               hoursAgo < 24 ? `${hoursAgo}h ago` : 
                                               timeAgo.toLocaleDateString();

                            return (
                                <div 
                                    key={notification.id}
                                    className={`flex items-start gap-3 p-3 rounded cursor-pointer transition-colors backdrop-blur-sm ${
                                        notification.isRead ? 'bg-white/30 hover:bg-white/40' : 'bg-blue-100/60 hover:bg-blue-100/80 border border-blue-200/50'
                                    }`}
                                    onClick={() => !notification.isRead && markNotificationAsRead(notification.id)}
                                >
                                    <span className="text-sm text-gray-600 font-medium min-w-5">
                                        {index + 1}.
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <p className={`text-sm ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                                                <span className="font-medium">{notification.title}</span>
                                            </p>
                                            <span className="text-xs text-gray-500 ml-2">{displayTime}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{notification.content}</p>
                                        {notification.order && (
                                            <p className="text-xs text-blue-600 mt-1">Order #{notification.order.id.slice(0, 8)}</p>
                                        )}
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryHome;
