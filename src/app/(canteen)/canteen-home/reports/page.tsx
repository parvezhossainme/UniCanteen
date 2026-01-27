"use client";
import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  Star, 
  Eye, 
  Filter, 
  Search, 
  RefreshCw,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Flag,
  ChevronDown,
  Reply
} from 'lucide-react';

type Report = {
  id: string;
  type: 'FOOD_QUALITY' | 'SERVICE' | 'HYGIENE' | 'DELIVERY' | 'OTHER';
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  rating?: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    user: {
      name: string | null;
      email: string | null;
    };
  };
  order?: {
    id: string;
    createdAt: string;
  };
  foodItem?: {
    food: {
      name: string;
    };
  };
  response?: string;
  respondedAt?: string;
};

const CustomerReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/canteen-home/reports', { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load reports');
      const data = await res.json();
      setReports(data.reports || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const respondToReport = async (reportId: string, responseText: string) => {
    if (!responseText.trim()) return;
    
    setResponding(reportId);
    try {
      const res = await fetch(`/api/canteen-home/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText, status: 'RESOLVED' }),
      });
      
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to respond');
      
      await fetchReports();
      setResponse('');
      setSelectedReport(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to respond to report');
    } finally {
      setResponding(null);
    }
  };

  const updateReportStatus = async (reportId: string, status: Report['status']) => {
    try {
      const res = await fetch(`/api/canteen-home/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update status');
      
      await fetchReports();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports
  useEffect(() => {
    let filtered = reports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
                          report.title.toLowerCase().includes(searchLower) ||
                          report.description.toLowerCase().includes(searchLower) ||
                          report.customer.user.name?.toLowerCase().includes(searchLower) ||
                          false;
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
    
    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
    }
  };

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'FOOD_QUALITY': return <AlertTriangle className="w-4 h-4" />;
      case 'SERVICE': return <User className="w-4 h-4" />;
      case 'HYGIENE': return <AlertCircle className="w-4 h-4" />;
      case 'DELIVERY': return <Clock className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Customer Reports & Complaints</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10 -left-4 -right-4"></div>
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Customer Reports & Complaints</h1>
            <p className="text-gray-700 font-semibold">Manage customer feedback and resolve issues</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/canteen-home/reports/seed', { method: 'POST' });
                if (res.ok) {
                  fetchReports();
                  alert('Sample reports added successfully!');
                } else {
                  const error = await res.json();
                  alert(error.error || 'Failed to seed data');
                }
              } catch (e) {
                alert('Failed to seed data');
              }
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            Add Sample Data
          </button>
          <button
            onClick={fetchReports}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="FOOD_QUALITY">Food Quality</option>
            <option value="SERVICE">Service</option>
            <option value="HYGIENE">Hygiene</option>
            <option value="DELIVERY">Delivery</option>
            <option value="OTHER">Other</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Reports Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'RESOLVED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">
                {reports.filter(r => r.priority === 'URGENT').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Reports & Complaints</h2>
        </div>
        
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No reports found matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        <span className="font-medium text-gray-900">{report.title}</span>
                      </div>
                      
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                      
                      {report.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{report.rating}/5</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{report.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{report.customer.user.name || 'Anonymous'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {report.order && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>Order #{report.order.id.slice(-6)}</span>
                        </div>
                      )}
                      
                      {report.foodItem && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{report.foodItem.food.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {report.response && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Your Response</span>
                        </div>
                        <p className="text-blue-700 text-sm">{report.response}</p>
                        {report.respondedAt && (
                          <p className="text-blue-600 text-xs mt-1">
                            Responded on {new Date(report.respondedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    
                    {report.status === 'PENDING' && (
                      <button
                        onClick={() => updateReportStatus(report.id, 'IN_PROGRESS')}
                        className="flex items-center px-3 py-1 text-yellow-600 hover:bg-yellow-50 rounded-lg text-sm"
                      >
                        In Progress
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedReport.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                      {selectedReport.priority}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedReport.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                  <p className="text-gray-600">{selectedReport.customer.user.name || 'Anonymous'}</p>
                  {selectedReport.customer.user.email && (
                    <p className="text-gray-500 text-sm">{selectedReport.customer.user.email}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Report Details</h4>
                  <p className="text-gray-600 text-sm">Type: {selectedReport.type.replace('_', ' ')}</p>
                  <p className="text-gray-600 text-sm">Created: {new Date(selectedReport.createdAt).toLocaleString()}</p>
                  {selectedReport.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-gray-600 text-sm">Rating:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedReport.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {!selectedReport.response && selectedReport.status !== 'RESOLVED' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Respond to Report</h4>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response to the customer..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      onClick={() => updateReportStatus(selectedReport.id, 'REJECTED')}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Mark as Rejected
                    </button>
                    <button
                      onClick={() => respondToReport(selectedReport.id, response)}
                      disabled={!response.trim() || responding === selectedReport.id}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {responding === selectedReport.id ? 'Responding...' : 'Send Response & Resolve'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReports;