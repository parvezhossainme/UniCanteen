// Canteen owner reviews dashboard with rating filters and sorting
"use client";

import { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  Reply,
  Filter,
  Search,
  TrendingUp,
  Users,
  Calendar,
  MoreVertical,
} from "lucide-react";

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    user: {
      name: string | null;
    };
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
  recentReviews: ReviewData[];
}

export default function ReviewsPage() {
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRating) params.append('rating', filterRating.toString());
      if (searchTerm) params.append('search', searchTerm);
      params.append('sort', sortBy);

      const response = await fetch(`/api/canteen-home/reviews?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReviewStats(data.stats);
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterRating, searchTerm, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderStars = (rating: number, size = "w-4 h-4") => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10 -left-4 -right-4"></div>
          <h1 className="relative text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Customer Reviews</h1>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-xl border-l-4 border-blue-400">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-blue-700">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border-l-[6px] border-blue-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-bold">Average Rating</p>
                <p className="text-4xl font-extrabold text-gray-900">
                  {reviewStats?.averageRating.toFixed(1) || "0.0"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {renderStars(Math.round(reviewStats?.averageRating || 0), "w-4 h-4")}
              <span className="ml-2 text-sm font-semibold text-blue-600">
                ({reviewStats?.totalReviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border-l-[6px] border-green-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-bold">Total Reviews</p>
                <p className="text-4xl font-extrabold text-gray-900">{reviewStats?.totalReviews || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-3 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-sm font-semibold text-green-600">+12% this month</span>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border-l-[6px] border-purple-500 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-bold">Happy Customers</p>
                <p className="text-4xl font-extrabold text-gray-900">
                  {reviewStats?.ratingDistribution
                    ?.filter(r => r.rating >= 4)
                    ?.reduce((acc, r) => acc + r.count, 0) || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm font-semibold text-purple-600">
                {reviewStats?.ratingDistribution
                  ?.filter(r => r.rating >= 4)
                  ?.reduce((acc, r) => acc + r.percentage, 0)
                  ?.toFixed(0) || 0}% satisfaction rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {reviewStats?.ratingDistribution && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {reviewStats.ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{item.rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {item.count} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
        </div>
        
        {reviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterRating 
                ? "Try adjusting your filters to see more reviews." 
                : "You haven't received any reviews yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.customer.user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.customer.user.name || "Anonymous User"}
                      </h4>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                          {review.rating}.0
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {review.comment && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}