"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  Filter,
  Search,
  Star,
  MapPin,
  Utensils,
  Truck,
  Shield,
  DollarSign,
  MoreHorizontal,
  Calendar,
  User,
  Send,
  Loader2
} from 'lucide-react';

// Types based on your Prisma schema
type ReportType = 'FOOD_QUALITY' | 'SERVICE' | 'HYGIENE' | 'DELIVERY' | 'PRICING' | 'OTHER';
type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type CanteenName = 'Khans_Kitchen' | 'Olympia_Cafe' | 'Neptune_Cafe';

interface CustomerReport {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  status: ReportStatus;
  priority: ReportPriority;
  rating?: number;
  response?: string;
  customerId: string;
  canteenId: string;
  orderId?: string;
  foodItemId?: string;
  deliveryPersonId?: string;
  createdAt: string;
  updatedAt: string;
  canteen?: {
    name: CanteenName;
    canteen_image?: string;
  };
  order?: {
    id: string;
    totalPrice: number;
  };
  foodItem?: {
    name: string;
  };
}

interface NewReport {
  type: ReportType;
  title: string;
  description: string;
  priority: ReportPriority;
  canteenId: string;
  orderId?: string;
  foodItemId?: string;
  rating?: number;
}

const REPORT_TYPES = [
  { value: 'FOOD_QUALITY', label: 'Food Quality', icon: Utensils, color: 'bg-red-500' },
  { value: 'SERVICE', label: 'Service', icon: User, color: 'bg-orange-500' },
  { value: 'HYGIENE', label: 'Hygiene', icon: Shield, color: 'bg-green-500' },
  { value: 'DELIVERY', label: 'Delivery', icon: Truck, color: 'bg-yellow-500' },
  { value: 'PRICING', label: 'Pricing', icon: DollarSign, color: 'bg-purple-500' },
  { value: 'OTHER', label: 'Other', icon: MoreHorizontal, color: 'bg-gray-500' },
] as const;

interface Canteen {
  id: string;
  name: CanteenName;
  canteen_image?: string;
  owner?: {
    name: string;
  };
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-orange-100 text-orange-800', icon: MessageSquare },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

const getCanteenDisplayName = (name: string): string => {
  switch (name) {
    case 'Khans_Kitchen':
      return "Khan's Kitchen";
    case 'Olympia_Cafe':
      return 'Olympia Cafe';
    case 'Neptune_Cafe':
      return 'Neptune Cafe';
    default:
      return name.replace('_', ' ');
  }
};

const CustomerReportsPage = () => {
  const { user } = useUser();
  const [reports, setReports] = useState<CustomerReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CustomerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'ALL'>('ALL');
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);

  const [newReport, setNewReport] = useState<NewReport>({
    type: 'FOOD_QUALITY',
    title: '',
    description: '',
    priority: 'MEDIUM',
    canteenId: '',
    orderId: '',
    foodItemId: '',
    rating: undefined,
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch('/api/customer-home/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        showNotification('error', 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showNotification('error', 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchRecentOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/customer-home/orders?limit=10');
      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  }, []);

  const fetchCanteens = useCallback(async () => {
    try {
      const response = await fetch('/api/customer-home/canteens');
      if (response.ok) {
        const data = await response.json();
        setCanteens(data.canteens || []);
      }
    } catch (error) {
      console.error('Error fetching canteens:', error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchRecentOrders();
    fetchCanteens();
  }, [fetchReports, fetchRecentOrders, fetchCanteens]);

  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(
        report =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.canteen?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, typeFilter]);

  const handleSubmitReport = async () => {
    if (!newReport.title.trim()) {
      showNotification('error', 'Please enter a report title');
      return;
    }

    if (!newReport.canteenId) {
      showNotification('error', 'Please select a canteen');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/customer-home/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });

      if (response.ok) {
        showNotification('success', 'Report submitted successfully');
        setShowNewReportForm(false);
        setNewReport({
          type: 'FOOD_QUALITY',
          title: '',
          description: '',
          priority: 'MEDIUM',
          canteenId: '',
          orderId: '',
          foodItemId: '',
          rating: undefined,
        });
        fetchReports();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      showNotification('error', 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const getReportTypeIcon = (type: ReportType) => {
    const config = REPORT_TYPES.find(t => t.value === type);
    return config ? config.icon : MoreHorizontal;
  };

  const getReportTypeColor = (type: ReportType) => {
    const config = REPORT_TYPES.find(t => t.value === type);
    return config ? config.color : 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen backdrop-blur-sm">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border-l-[6px] border-orange-500 max-w-md">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">Loading Reports</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Fetching your reports data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 backdrop-blur-sm">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-2 backdrop-blur-md ${
          notification.type === 'success' 
            ? 'bg-green-100/90 text-green-800 border-l-4 border-green-500' 
            : 'bg-red-100/90 text-red-800 border-l-4 border-red-500'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                My Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-lg">Submit and track your feedback</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewReportForm(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-extrabold flex items-center space-x-2 shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = reports.filter(r => r.status === status).length;
          const Icon = config.icon;
          const borderColors = {
            PENDING: 'border-yellow-500',
            IN_PROGRESS: 'border-orange-500',
            RESOLVED: 'border-green-500',
            REJECTED: 'border-red-500'
          };
          return (
            <div key={status} className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-xl shadow-xl border-l-[6px] ${borderColors[status as keyof typeof borderColors]} p-6 hover:scale-105 transition-transform duration-200`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${status === 'PENDING' ? 'from-yellow-400 to-amber-400' : status === 'IN_PROGRESS' ? 'from-orange-500 to-amber-500' : status === 'RESOLVED' ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{config.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm font-semibold"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'ALL')}
            className="px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm font-semibold"
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>{config.label}</option>
            ))}
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ReportType | 'ALL')}
            className="px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm font-semibold"
          >
            <option value="ALL">All Types</option>
            {REPORT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </div>
      </div>

      {/* New Report Form Modal */}
      {showNewReportForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-600">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Submit New Report</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type *
                  </label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value as ReportType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {REPORT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newReport.priority}
                    onChange={(e) => setNewReport(prev => ({ ...prev, priority: e.target.value as ReportPriority }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                      <option key={priority} value={priority}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canteen *
                </label>
                <select
                  value={newReport.canteenId}
                  onChange={(e) => setNewReport(prev => ({ ...prev, canteenId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a canteen</option>
                  {canteens.map((canteen: Canteen) => (
                    <option key={canteen.id} value={canteen.id}>
                      {getCanteenDisplayName(canteen.name)}
                    </option>
                  ))}
                </select>
              </div>

              {recentOrders.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Order (optional)
                  </label>
                  <select
                    value={newReport.orderId || ''}
                    onChange={(e) => setNewReport(prev => ({ ...prev, orderId: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">No specific order</option>
                    {recentOrders.map(order => (
                      <option key={order.id} value={order.id}>
                        Order #{order.id.slice(-6)} - ৳{order.totalPrice} ({new Date(order.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief summary of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Detailed description of the issue..."
                />
              </div>

              {(newReport.type === 'FOOD_QUALITY' || newReport.type === 'SERVICE') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReport(prev => ({ ...prev, rating: star }))}
                        className={`p-1 ${
                          newReport.rating && star <= newReport.rating
                            ? 'text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex space-x-3">
              <button
                onClick={handleSubmitReport}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-extrabold flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                <span>Submit Report</span>
              </button>
              <button
                onClick={() => setShowNewReportForm(false)}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-extrabold disabled:opacity-50 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => {
            const TypeIcon = getReportTypeIcon(report.type);
            const StatusIcon = STATUS_CONFIG[report.status].icon;
            
            return (
              <div key={report.id} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 p-6 hover:scale-[1.02] transition-transform duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${getReportTypeColor(report.type).replace('bg-', 'bg-gradient-to-br from-')} to-orange-600 text-white shrink-0 shadow-lg`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{report.title}</h3>
                          <span className={`px-3 py-1 rounded-xl text-sm font-extrabold ${STATUS_CONFIG[report.status].color} shadow-sm`}>
                            {STATUS_CONFIG[report.status].label}
                          </span>
                          <span className={`px-3 py-1 rounded-xl text-sm font-extrabold ${PRIORITY_CONFIG[report.priority].color} shadow-sm`}>
                            {PRIORITY_CONFIG[report.priority].label}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4 text-base">{report.description}</p>
                        
                        <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 gap-4 mb-4">
                          <span className="flex items-center font-semibold">
                            <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                            {getCanteenDisplayName(report.canteen?.name || '')}
                          </span>
                          <span className="flex items-center font-semibold">
                            <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          {report.rating && (
                            <span className="flex items-center font-semibold">
                              <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
                              {report.rating}/5
                            </span>
                          )}
                          {report.order && (
                            <span className="flex items-center font-semibold">
                              <FileText className="w-5 h-5 mr-2 text-orange-500" />
                              Order #{report.order.id.slice(-6)}
                            </span>
                          )}
                        </div>

                        {report.response && (
                          <div className="mt-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500 shadow-md">
                            <div className="flex items-center mb-3">
                              <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                              <span className="font-extrabold text-gray-900 dark:text-white">Official Response</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 font-semibold">{report.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-8 flex items-center">
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                      <StatusIcon className={`w-8 h-8 ${STATUS_CONFIG[report.status].color.split(' ')[1]}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-6 rounded-2xl shadow-lg w-20 h-20 mx-auto flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">No reports found</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Try adjusting your filters to see more reports.'
                : "You haven't submitted any reports yet."}
            </p>
            {!searchTerm && statusFilter === 'ALL' && typeFilter === 'ALL' && (
              <div className="mt-8">
                <button
                  onClick={() => setShowNewReportForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-4 rounded-xl font-extrabold flex items-center space-x-2 shadow-xl transform hover:scale-105 transition-all duration-200 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Submit Your First Report</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReportsPage;