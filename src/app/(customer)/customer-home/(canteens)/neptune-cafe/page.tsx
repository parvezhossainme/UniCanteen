"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Food, CATEGORY_LABELS } from "@/types/canteen";
import { CheckCircle, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const NeptuneCafePage = () => {
    const { incrementCartCount } = useCart();
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("ALL");
    const [addingId, setAddingId] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [addedItemName, setAddedItemName] = useState("");

    useEffect(() => {
        async function fetchFoods() {
            const res = await fetch("/api/customer-home/neptune-foods");
            const data = await res.json();
            setFoods(data);
            setLoading(false);
        }
        fetchFoods();
    }, []);

    // Group foods by category
    const foodsByCategory: Record<string, Food[]> = {};
    foods.forEach((food) => {
        food.category.forEach((cat) => {
            if (!foodsByCategory[cat]) foodsByCategory[cat] = [];
            foodsByCategory[cat].push(food);
        });
    });

    // Filtered categories for tabs (add ALL at the start)
    const categories = ["ALL", ...Object.keys(foodsByCategory)];

    // Filter foods by search and active category
    const filteredFoods =
        activeCategory === "ALL"
            ? foods.filter(
                  (food) =>
                      food.name.toLowerCase().includes(search.toLowerCase()) ||
                      (food.description &&
                          food.description
                              .toLowerCase()
                              .includes(search.toLowerCase()))
              )
            : foodsByCategory[activeCategory]?.filter(
                  (food) =>
                      food.name.toLowerCase().includes(search.toLowerCase()) ||
                      (food.description &&
                          food.description
                              .toLowerCase()
                              .includes(search.toLowerCase()))
              ) || [];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Bar */}
            <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for delicious food..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-6 py-4 pl-14 bg-linear-to-r from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80 backdrop-blur-md border-2 border-orange-200/60 dark:border-orange-700/60 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-lg font-medium shadow-sm hover:shadow-md transition-all duration-300"
                    />
                </div>
            </div>

            {/* Cafe Title */}
            <h1 className="text-4xl font-bold text-center mb-4 font-serif">
                NeptuneCafe
            </h1>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 border-2 font-semibold transition-all duration-300 shadow-md ${
                            activeCategory === cat
                                ? "bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/50 scale-105"
                                : "bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-200 border-orange-200 dark:border-orange-800/50 hover:bg-orange-50 dark:hover:bg-slate-700/90 hover:border-orange-400 hover:scale-105"
                        }`}
                    >
                        {cat === "ALL"
                            ? `All (${foods.length})`
                            : `${
                                  CATEGORY_LABELS[cat] || cat.replace(/_/g, " ")
                              } (${foodsByCategory[cat]?.length || 0})`}
                    </button>
                ))}
            </div>

            {/* Category Section Title */}
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold">
                    {CATEGORY_LABELS[activeCategory] ||
                        activeCategory.replace(/_/g, " ")}
                </h2>
            </div>

            {/* Food Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-400 mb-4"></div>
                    <p className="text-lg text-gray-500">Loading foods...</p>
                </div>
            ) : filteredFoods.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    No foods found in this category.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredFoods.map((food) => (
                        <div
                            key={food.id}
                            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-l-4 border-orange-500 hover:border-orange-600 group"
                        >
                            <div className="relative w-full h-48 overflow-hidden">
                                <Image
                                    src={food.image || "/default-food.jpg"}
                                    alt={food.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                {/* Price Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className="bg-orange-500 text-white px-3 py-1.5 text-sm font-bold shadow-lg">
                                        ৳{food.price}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                    {food.name}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
                                    {food.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {food.category.map((cat) => (
                                        <span
                                            key={cat}
                                            className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 text-xs font-medium border border-orange-200 dark:border-orange-800"
                                        >
                                            {CATEGORY_LABELS[cat] ||
                                                cat.replace(/_/g, " ")}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t-2 border-orange-200 dark:border-orange-700/50">
                                    <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1">
                                        <span className="text-sm">★</span>
                                        <span className="text-sm font-bold">{food.rating ?? "5.0"}</span>
                                    </div>
                                    <button
                                        className="bg-orange-500 text-white px-4 py-1.5 text-sm font-bold hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 duration-300"
                                        disabled={
                                            !food.availability ||
                                            food.stocks === 0 ||
                                            addingId === food.id
                                        }
                                        onClick={async () => {
                                            setAddingId(food.id);
                                            try {
                                                const res = await fetch(
                                                    "/api/cart/add-to-cart",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        foodId: food.id,
                                                        quantity: 1,
                                                    }),
                                                }
                                            );
                                            if (!res.ok) {
                                                const data = await res.json();
                                                alert(
                                                    data.error ||
                                                        "Failed to add to cart"
                                                );
                                            } else {
                                                // Show success popup
                                                setAddedItemName(food.name);
                                                setShowSuccessPopup(true);
                                                
                                                // Update cart count in navbar
                                                incrementCartCount();
                                                
                                                // Hide popup after 3 seconds
                                                setTimeout(() => {
                                                    setShowSuccessPopup(false);
                                                }, 3000);
                                            }
                                        } catch (err) {
                                            alert("Failed to add to cart");
                                        } finally {
                                            setAddingId(null);
                                        }
                                    }}
                                >
                                    {addingId === food.id
                                        ? "Adding..."
                                        : "+ Add Product"}
                                </button>
                            </div>
                        </div>
                        <div className="px-4 pb-3 bg-gradient-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80">
                            <div className="flex justify-between items-center">
                                <span
                                    className={`px-2 py-0.5 text-xs font-medium ${
                                        food.availability
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                    }`}
                                >
                                    {food.availability
                                        ? "Available"
                                        : "Out of Stock"}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                    Stock: {food.stocks}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full transform transition-all border-2 border-orange-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="shrink-0">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Added to Cart!
                                    </h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSuccessPopup(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-gray-900">{addedItemName}</span> has been successfully added to your cart.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowSuccessPopup(false)}
                                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessPopup(false);
                                    // You can add navigation to cart page here
                                    window.location.href = '/customer-home/cart';
                                }}
                                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                            >
                                View Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeptuneCafePage;
