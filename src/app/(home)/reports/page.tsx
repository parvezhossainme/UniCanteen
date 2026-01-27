"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Eye
} from 'lucide-react';

interface ReportSummary {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  canteenName: string;
  priority: string;
}

interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  avgResolutionTime: number;
  mostReportedCanteen: string;
  commonIssueType: string;
}

const HomeReportsPage = () => {
  const { user } = useUser();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30'); // days
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(`/api/reports/summary?days=${timeFilter}&status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [timeFilter, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports Overview</h1>
            <p className="text-gray-600">System-wide reports and analytics</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-xl font-bold text-purple-600">{stats.avgResolutionTime}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Top Canteen</p>
                <p className="text-sm font-bold text-orange-600">{stats.mostReportedCanteen}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Common Issue</p>
                <p className="text-sm font-bold text-red-600">{stats.commonIssueType}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex space-x-4">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50">
        <div className="p-6 border-b border-orange-100 dark:border-orange-900/50">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {reports.length > 0 ? (
            reports.slice(0, 10).map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>{report.type}</span>
                      <span>{report.canteenName}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">No reports match your current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeReportsPage;