"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FOOD_CATEGORIES = [
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

export default function AddFoodPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      // Get all selected categories as an array
      const categories = formData.getAll("category");

      const foodData = {
        name: formData.get("name"),
        price: parseFloat(formData.get("price") as string),
        description: formData.get("description"),
        image: formData.get("image"),
        rating: 0,
        stocks: parseInt(formData.get("stocks") as string),
        availability: formData.get("availability") === "true",
        category: categories, // array for multi-select
      };

      const response = await fetch("/api/canteen-home/add-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(foodData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      router.push("/canteen-home/food-items/current-foods");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add food item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto p-6 ">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10"></div>
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border-l-[6px] border-orange-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Add New Food Item</h1>
          <p className="text-gray-800 dark:text-gray-200 text-sm md:text-base font-semibold mt-2">Fill in the details to add a new item to your menu</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl opacity-10"></div>
          <div className="relative bg-white dark:bg-slate-800 border-l-[6px] border-red-500 rounded-2xl p-4 shadow-lg">
            <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl opacity-5"></div>
        <div className="relative bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border-l-[6px] border-orange-500">
          <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            Food Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
            placeholder="Enter food name"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            Price (৳) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            min="0"
            required
            className="w-full px-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
            placeholder="Enter food description"
          ></textarea>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            Image URL
          </label>
          <input
            type="url"
            id="image"
            name="image"
            className="w-full px-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label htmlFor="stocks" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            Initial Stock *
          </label>
          <input
            type="number"
            id="stocks"
            name="stocks"
            min="0"
            defaultValue="10"
            required
            className="w-full px-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
            Food Category *
          </label>
          <select
            id="category"
            name="category"
            multiple
            required
            className="w-full px-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
            style={{ height: "160px" }}
          >
            {FOOD_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-2">
            Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Availability</label>
          <div className="flex gap-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="true"
                defaultChecked
                className="form-radio h-5 w-5 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span className="ml-2 font-semibold text-gray-800 dark:text-gray-200">Available</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="false"
                className="form-radio h-5 w-5 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span className="ml-2 font-semibold text-gray-800 dark:text-gray-200">Not Available</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Adding..." : "Add Food Item"}
        </button>
          </form>
        </div>
      </div>
    </div>
  );
}