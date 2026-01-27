"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Star, 
  MessageSquare, 
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Award,
  Users,
  TrendingUp,
  Send
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface CustomerReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  canteen: {
    id: string;
    name: string;
    canteen_image: string;
  };
}

interface Canteen {
  id: string;
  name: string;
  canteen_image: string;
}

const CustomerReviews = () => {
  const { user } = useUser();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedCanteenId, setSelectedCanteenId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch('/api/customer-home/customer-reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCanteens = useCallback(async () => {
    try {
      const response = await fetch('/api/canteens');
      if (response.ok) {
        const data = await response.json();
        setCanteens(data.canteens || []);
      }
    } catch (error) {
      console.error('Error fetching canteens:', error);
    }
  }, []);

  useEffect(() => {
    fetchCanteens();
    fetchReviews();
  }, [fetchCanteens, fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const endpoint = editingReview 
        ? '/api/customer-home/customer-reviews'
        : '/api/customer-home/customer-reviews';
      
      const method = editingReview ? 'PUT' : 'POST';
      
      const body = editingReview
        ? { reviewId: editingReview.id, rating, comment }
        : { canteenId: selectedCanteenId, rating, comment };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchReviews();
        resetForm();
        setShowAddReview(false);
        setEditingReview(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/customer-home/customer-reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchReviews();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleEditReview = (review: CustomerReview) => {
    setEditingReview(review);
    setSelectedCanteenId(review.canteen.id);
    setRating(review.rating);
    setComment(review.comment);
    setShowAddReview(true);
  };

  const resetForm = () => {
    setSelectedCanteenId('');
    setRating(5);
    setComment('');
  };

  const renderStars = (currentRating: number, interactive: boolean = false, onStarClick?: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < currentRating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onStarClick && onStarClick(i + 1)}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReviewStats = () => {
    if (reviews.length === 0) return { avg: 0, total: 0, thisMonth: 0 };
    
    const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const thisMonth = reviews.filter(review => 
      new Date(review.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      avg: parseFloat(avg.toFixed(1)),
      total: reviews.length,
      thisMonth
    };
  };

  const stats = getReviewStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
        <span className="ml-3 text-lg font-medium text-slate-700 dark:text-slate-300">Loading your reviews...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 shadow-xl">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white drop-shadow-lg">My Reviews</h1>
              <p className="text-slate-700 dark:text-slate-300 text-lg font-medium mt-1">Share your experience with our canteens</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingReview(null);
              setShowAddReview(true);
            }}
            className="flex items-center px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl hover:shadow-2xl font-bold transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Review
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 p-6 border-l-4 border-orange-500 shadow-lg">
            <div className="flex items-center mb-2">
              <MessageSquare className="w-6 h-6 mr-2 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Reviews</span>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 p-6 border-l-4 border-amber-500 shadow-lg">
            <div className="flex items-center mb-2">
              <Star className="w-6 h-6 mr-2 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Avg Rating</span>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{stats.avg}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 p-6 border-l-4 border-yellow-500 shadow-lg">
            <div className="flex items-center mb-2">
              <Award className="w-6 h-6 mr-2 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Canteens Reviewed</span>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
              {new Set(reviews.map(r => r.canteen.id)).size}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 p-6 border-l-4 border-green-500 shadow-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">This Month</span>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{stats.thisMonth}</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Review Form */}
      {showAddReview && (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl border-l-[6px] border-orange-500 p-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
            {editingReview ? '✏️ Edit Review' : '➕ Add New Review'}
          </h2>
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {!editingReview && (
              <div>
                <label className="block text-base font-bold text-slate-800 dark:text-slate-200 mb-3">
                  Select Canteen *
                </label>
                <select
                  value={selectedCanteenId}
                  onChange={(e) => setSelectedCanteenId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-base"
                >
                  <option value="">Choose a canteen...</option>
                  {canteens.map((canteen) => (
                    <option key={canteen.id} value={canteen.id}>
                      {canteen.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-base font-bold text-slate-800 dark:text-slate-200 mb-3">
                Rating *
              </label>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 p-4 border-l-4 border-orange-500">
                {renderStars(rating, true, setRating)}
                <span className="ml-3 text-lg font-bold text-slate-900 dark:text-white">({rating}/5)</span>
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-slate-800 dark:text-slate-200 mb-3">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience with this canteen..."
                className="w-full px-4 py-3 border-2 border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={submitting || (!editingReview && !selectedCanteenId)}
                className="flex items-center px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-400 disabled:to-slate-500 text-white shadow-xl hover:shadow-2xl font-bold transition-all duration-300 hover:scale-105"
              >
                <Send className="w-5 h-5 mr-2" />
                {submitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddReview(false);
                  setEditingReview(null);
                  resetForm();
                }}
                className="px-8 py-3.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors shadow-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl border-l-[6px] border-orange-500 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start space-x-6">
                {/* Canteen Image */}
                <div className="shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden border-4 border-orange-500 shadow-lg">
                    {review.canteen.canteen_image ? (
                      <Image
                        src={review.canteen.canteen_image}
                        alt={review.canteen.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{review.canteen.name}</h3>
                      <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(review.createdAt)}</span>
                        {review.createdAt !== review.updatedAt && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">• Edited</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 shadow-lg">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-base font-bold text-white">
                          {review.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          title="Edit review"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                          title="Delete review"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 p-4 border-l-4 border-orange-500 mt-3">
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-base">{review.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl border-l-[6px] border-orange-500 p-12">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-xl">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">No Reviews Yet</h3>
            <p className="text-slate-700 dark:text-slate-300 text-lg font-medium mb-6 max-w-md mx-auto">
              Start sharing your experience by reviewing canteens you've visited!
            </p>
            <button
              onClick={() => {
                resetForm();
                setEditingReview(null);
                setShowAddReview(true);
              }}
              className="flex items-center mx-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl hover:shadow-2xl font-bold transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Write Your First Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;