"use client";
import { changeFoodAvailability } from "@/actions/canteen/canteen.action";
import { Button } from "@/components/ui/button";
import { CanteenFood } from "@/types/food";
import React, { useEffect, useRef, useState } from "react";
import { FoodCategory } from "@/generated/client";
const FOOD_CATEGORIES: FoodCategory[] = [
    "POPULAR",
    "BREAKFAST",
    "LUNCH",
    "DINNER",
    "FAST_FOOD",
    "DESSERT",
    "BEVERAGE",
    "SNACK",
    "RICE_ITEMS",
    "DRINKS",
    "PACKET_ITEMS",
    "OTHERS",
    "MEAT_ITEMS",
];

type FilterType = FoodCategory | "ALL";

const FoodAvailabilityPage = () => {
    const [foods, setFoods] = useState<CanteenFood[]>([]);
    const [loading, setLoading] = useState(true);
    // const [filter, setFilter] = useState<string>("ALL");
    const [filter, setFilter] = useState<FilterType>("ALL");
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const res = await fetch("/api/canteen-home/all-foods/");
                const data: CanteenFood[] = await res.json();
                setFoods(data);
            } catch (err) {
                console.error("Failed to fetch foods:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFoods();
    }, []);

    // Filter foods by selected category
    const filteredFoods =
        filter === "ALL"
            ? foods
            : foods.filter(
                  (food) =>
                      Array.isArray(food.category) &&
                      food.category.includes(filter as FoodCategory)
              );

    return (
        <div className="p-6 mx-auto bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10"></div>
                <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-lg">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">
                        Food Availability
                    </h1>
                    <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg font-semibold text-center">Toggle food item availability</p>
                </div>
            </div>
            <div className="mb-6 flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-2 border-orange-200 dark:border-orange-700">
                <label htmlFor="category-filter" className="font-bold text-gray-900 dark:text-white">
                    Filter by Category:
                </label>
                <select
                    id="category-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
                >
                    <option value="ALL">All</option>
                    {FOOD_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat.replace(/_/g, " ")}
                        </option>
                    ))}
                </select>
            </div>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 absolute top-0 left-0"></div>
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 font-bold mt-4">
                        Loading food items...
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFoods.map((food) => (
                        <form
                            ref={formRef}
                            key={food.id}
                            action={async () => {
                                await changeFoodAvailability(
                                    food.id,
                                    food.canteenId,
                                    food.availability
                                );
                                const res = await fetch(
                                    "/api/canteen-home/all-foods/"
                                );
                                const updatedFoods: CanteenFood[] =
                                    await res.json();
                                setFoods(updatedFoods);
                            }}
                            className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 flex flex-col gap-3 border-2 border-orange-200 dark:border-orange-700 hover:shadow-2xl hover:scale-[1.02] transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                                    {food.name}
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md ${
                                        food.availability
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {food.availability
                                        ? "Available"
                                        : "Not Available"}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 my-2">
                                {Array.isArray(food.category) &&
                                    food.category.map((cat) => (
                                        <span
                                            key={cat}
                                            className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold"
                                        >
                                            {cat.replace(/_/g, " ")}
                                        </span>
                                    ))}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                                <span className="font-extrabold text-gray-900 dark:text-white">Stocks:</span>{" "}
                                {food.stocks}
                            </div>
                            <Button
                                type="submit"
                                className="mt-2 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 rounded-xl shadow-lg hover:scale-105 transition-all"
                            >
                                Toggle Availability
                            </Button>
                        </form>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FoodAvailabilityPage;
