"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

type Food = {
    id: string;
    name: string;
    price: number;
    description?: string;
    image?: string;
    category: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
    POPULAR: "Popular",
    BREAKFAST: "Breakfast",
    LUNCH: "Lunch",
    DINNER: "Dinner",
    FAST_FOOD: "Fast Foods",
    DESSERT: "Dessert",
    BEVERAGE: "Drinks",
    SNACK: "Snacks",
    RICE_ITEMS: "Rice Items",
    DRINKS: "Drinks",
    PACKET_ITEMS: "Packet Items",
    OTHERS: "Others",
    MEAT_ITEMS: "Meat Items",
};

const KhansKitchen = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("ALL");

    useEffect(() => {
        async function fetchFoods() {
            const res = await fetch("/api/home/khanskitchen-foods");
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
                        className="w-full px-6 py-4 pl-14 bg-gradient-to-r from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80 backdrop-blur-md border-2 border-orange-200/60 dark:border-orange-700/60 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-lg font-medium shadow-sm hover:shadow-md transition-all duration-300"
                    />
                </div>
            </div>

            {/* Cafe Title */}
            <h1 className="text-4xl font-bold text-center mb-4 font-serif">
                Khans Kitchen
            </h1>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-full border-2 font-semibold transition-all duration-300 shadow-md ${
                            activeCategory === cat
                                ? "bg-linear-to-r from-orange-500 to-amber-500 text-white border-orange-600 shadow-lg shadow-orange-500/50 scale-105"
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

            {/* Food Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-400 border-b-4 mb-4"></div>
                    <p className="text-lg text-gray-500">Loading foods...</p>
                </div>
            ) : filteredFoods.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    No foods found in this category.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFoods.map((food) => (
                        <div
                            key={food.id}
                            className="group bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-orange-500 hover:border-orange-600"
                        >
                            <div className="relative w-full h-56 overflow-hidden">
                                <Image
                                    src={food.image || "/default-food.jpg"}
                                    alt={food.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3">
                                    <span className="bg-orange-500 text-white px-4 py-1.5 text-lg font-bold shadow-lg">
                                        ৳{food.price}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                    {food.name}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                                    {food.description}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    {food.category.slice(0, 3).map((cat) => (
                                        <span
                                            key={cat}
                                            className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 text-xs font-medium border border-orange-200 dark:border-orange-700/50"
                                        >
                                            {CATEGORY_LABELS[cat] ||
                                                cat.replace(/_/g, " ")}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KhansKitchen;
