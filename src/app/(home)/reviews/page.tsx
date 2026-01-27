"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
    Star,
    MessageSquare,
    Filter,
    Calendar,
    TrendingUp,
    Users,
    Award,
    Search,
} from "lucide-react";

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    canteen: {
        id: string;
        name: string;
        canteen_image: string;
    };
    customer: {
        user: {
            name: string;
            email: string;
        };
        uiuId: string;
    };
}

interface Canteen {
    id: string;
    name: string;
    canteen_image: string;
    _count: {
        reviews: number;
    };
}

interface ReviewStats {
    totalReviews: number;
    averageRating: number;
}

interface RatingDistribution {
    rating: number;
    _count: {
        rating: number;
    };
}

const ReviewsPage = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [canteens, setCanteens] = useState<Canteen[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCanteen, setSelectedCanteen] = useState("all");
    const [selectedRating, setSelectedRating] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [stats, setStats] = useState<ReviewStats>({
        totalReviews: 0,
        averageRating: 0,
    });
    const [ratingDistribution, setRatingDistribution] = useState<
        RatingDistribution[]
    >([]);

    const fetchReviews = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                canteenId: selectedCanteen,
                rating: selectedRating,
                sortBy,
            });

            const response = await fetch(`/api/reviews?${params}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews || []);
                setStats(data.stats || { totalReviews: 0, averageRating: 0 });
                setRatingDistribution(data.ratingDistribution || []);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedCanteen, selectedRating, sortBy]);

    const fetchCanteens = useCallback(async () => {
        try {
            const response = await fetch("/api/canteens");
            if (response.ok) {
                const data = await response.json();
                setCanteens(data.canteens || []);
            }
        } catch (error) {
            console.error("Error fetching canteens:", error);
        }
    }, []);

    useEffect(() => {
        fetchCanteens();
        fetchReviews();
    }, [fetchCanteens, fetchReviews]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                }`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2">Loading reviews...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-orange-600 to-red-400 rounded-lg shadow-lg text-white p-8">
                <div className="flex items-center space-x-4">
                    <MessageSquare className="w-12 h-12" />
                    <div>
                        <h1 className="text-3xl font-bold">Canteen Reviews</h1>
                        <p className="text-blue-100 text-lg">
                            See what students are saying about our canteens
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-center">
                            <Users className="w-6 h-6 mr-2" />
                            <span className="text-sm">Total Reviews</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                            {stats.totalReviews}
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-center">
                            <Star className="w-6 h-6 mr-2" />
                            <span className="text-sm">Avg Rating</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                            {stats.averageRating}
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-center">
                            <Award className="w-6 h-6 mr-2" />
                            <span className="text-sm">Canteens</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                            {canteens.length}
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-center">
                            <TrendingUp className="w-6 h-6 mr-2" />
                            <span className="text-sm">This Month</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                            {
                                reviews.filter(
                                    (r) =>
                                        new Date(r.createdAt) >
                                        new Date(
                                            Date.now() -
                                                30 * 24 * 60 * 60 * 1000
                                        )
                                ).length
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filter Reviews
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Canteen
                        </label>
                        <select
                            value={selectedCanteen}
                            onChange={(e) => setSelectedCanteen(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Canteens</option>
                            {canteens.map((canteen) => (
                                <option key={canteen.id} value={canteen.id}>
                                    {canteen.name} ({canteen._count.reviews}{" "}
                                    reviews)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                        </label>
                        <select
                            value={selectedRating}
                            onChange={(e) => setSelectedRating(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="rating_high">Highest Rating</option>
                            <option value="rating_low">Lowest Rating</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Rating Distribution */}
            {ratingDistribution.length > 0 && (
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Rating Distribution
                    </h2>
                    <div className="space-y-2">
                        {ratingDistribution.map((dist) => (
                            <div
                                key={dist.rating}
                                className="flex items-center space-x-3"
                            >
                                <div className="flex items-center space-x-1 w-20">
                                    <span className="text-sm font-medium">
                                        {dist.rating}
                                    </span>
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{
                                            width: `${
                                                (dist._count.rating /
                                                    stats.totalReviews) *
                                                100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-12">
                                    {dist._count.rating}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/50 p-6"
                        >
                            <div className="flex items-start space-x-4">
                                {/* Canteen Image */}
                                <div className="shrink-0">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                                        {review.canteen.canteen_image ? (
                                            <Image
                                                src={
                                                    review.canteen.canteen_image
                                                }
                                                alt={review.canteen.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-brrom-blue-400 to-purple-500 flex items-center justify-center">
                                                <MessageSquare className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {review.canteen.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                by{" "}
                                                {review.customer.user.name ||
                                                    "Anonymous"}{" "}
                                                • {formatDate(review.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {renderStars(review.rating)}
                                            <span className="ml-1 text-sm font-medium text-gray-700">
                                                {review.rating}/5
                                            </span>
                                        </div>
                                    </div>

                                    {review.comment && (
                                        <p className="text-gray-700 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-8">
                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Reviews Found
                        </h3>
                        <p className="text-gray-600">
                            {selectedCanteen !== "all" ||
                            selectedRating !== "all"
                                ? "Try adjusting your filters to see more reviews"
                                : "Be the first to leave a review for our canteens!"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsPage;
