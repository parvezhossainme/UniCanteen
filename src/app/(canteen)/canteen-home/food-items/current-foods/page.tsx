"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Package,
  AlertTriangle,
  Star,
  TrendingUp
} from "lucide-react";
import { CanteenFood } from "@/types/food";

type EditingFood = CanteenFood & {
  originalPrice?: number;
  originalStocks?: number;
  originalAvailability?: boolean;
};

const FoodItems = () => {
  const [foods, setFoods] = useState<CanteenFood[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<CanteenFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [editingFood, setEditingFood] = useState<EditingFood | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch("/api/canteen-home/all-foods/");
        const data: CanteenFood[] = await res.json();
        setFoods(data);
        setFilteredFoods(data);
      } catch (err) {
        console.error("Failed to fetch foods:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Filter foods based on search and filters
  useEffect(() => {
    let filtered = foods.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || food.category.includes(filterCategory as any);
      const matchesAvailability = filterAvailability === "all" || 
        (filterAvailability === "available" && food.availability) ||
        (filterAvailability === "unavailable" && !food.availability);
      
      return matchesSearch && matchesCategory && matchesAvailability;
    });
    
    setFilteredFoods(filtered);
  }, [foods, searchTerm, filterCategory, filterAvailability]);

  const toggleAvailability = async (food: CanteenFood) => {
    setUpdating(food.id);
    try {
      const response = await fetch(`/api/canteen-home/foods/${food.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: !food.availability })
      });

      if (response.ok) {
        const updatedFood = await response.json();
        setFoods(prev => prev.map(f => f.id === food.id ? updatedFood : f));
      }
    } catch (error) {
      console.error('Failed to update availability:', error);
    } finally {
      setUpdating(null);
    }
  };

  const updateQuickEdit = async (food: EditingFood, field: string, value: any) => {
    setUpdating(food.id);
    try {
      const response = await fetch(`/api/canteen-home/foods/${food.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (response.ok) {
        const updatedFood = await response.json();
        setFoods(prev => prev.map(f => f.id === food.id ? updatedFood : f));
        setEditingFood(null);
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      setUpdating(null);
    }
  };

  const deleteFood = async (foodId: string) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    
    setUpdating(foodId);
    try {
      const response = await fetch(`/api/canteen-home/foods/${foodId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFoods(prev => prev.filter(f => f.id !== foodId));
      }
    } catch (error) {
      console.error('Failed to delete food:', error);
    } finally {
      setUpdating(null);
    }
  };

  const startEditing = (food: CanteenFood) => {
    setEditingFood({
      ...food,
      originalPrice: food.price,
      originalStocks: food.stocks,
      originalAvailability: food.availability
    });
  };

  const cancelEditing = () => {
    if (editingFood) {
      setFoods(prev => prev.map(f => f.id === editingFood.id ? {
        ...f,
        price: editingFood.originalPrice || f.price,
        stocks: editingFood.originalStocks || f.stocks,
        availability: editingFood.originalAvailability ?? f.availability
      } : f));
    }
    setEditingFood(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                  Loading Foods
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Please wait...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10"></div>
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border-l-[6px] border-orange-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Food Items Management</h1>
              <p className="text-gray-800 dark:text-gray-200 text-sm md:text-base font-semibold mt-2">Manage your menu items, pricing, and availability</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link 
                href="/canteen-home/food-items/add-food"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Food
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl border-l-[6px] border-blue-500 hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl mr-3">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Total Items</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{foods.length}</p>
            </div>
          </div>
        </div>
        <div className="relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl border-l-[6px] border-green-500 hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl mr-3">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Available</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{foods.filter(f => f.availability).length}</p>
            </div>
          </div>
        </div>
        <div className="relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl border-l-[6px] border-yellow-500 hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-xl mr-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Low Stock</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{foods.filter(f => f.stocks < 5).length}</p>
            </div>
          </div>
        </div>
        <div className="relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl border-l-[6px] border-purple-500 hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl mr-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Avg Rating</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{(foods.reduce((acc, f) => acc + f.rating, 0) / foods.length || 0).toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl opacity-5"></div>
        <div className="relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl border-l-[6px] border-orange-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
              />
            </div>
            
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
            >
              <option value="all">All Categories</option>
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snacks</option>
              <option value="BEVERAGE">Beverages</option>
              <option value="DESSERT">Desserts</option>
            </select>
            
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="px-4 py-3 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm font-semibold"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredFoods.length} of {foods.length} items
            </div>
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      {filteredFoods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food) => {
            const isEditing = editingFood?.id === food.id;
            const isUpdating = updating === food.id;
            
            return (
              <div
                key={food.id}
                className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={food.image || "/default-food.jpg"}
                    alt={food.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {food.stocks < 5 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Low Stock
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      food.availability 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {food.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{food.name}</h3>
                  {food.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={food.price}
                          onChange={(e) => setFoods(prev => prev.map(f => 
                            f.id === food.id ? {...f, price: parseFloat(e.target.value) || 0} : f
                          ))}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-lg font-bold text-green-600">৳{food.price}</span>
                      )}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm">{food.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Stock:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={food.stocks}
                          onChange={(e) => setFoods(prev => prev.map(f => 
                            f.id === food.id ? {...f, stocks: parseInt(e.target.value) || 0} : f
                          ))}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <span className={`font-medium ${
                          food.stocks < 5 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {food.stocks}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Categories:</span>
                      <span className="text-xs text-blue-600">
                        {Array.isArray(food.category) ? food.category.slice(0, 2).join(', ') : 'None'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    {isEditing ? (
                      <div className="flex space-x-2 w-full">
                        <button
                          onClick={() => updateQuickEdit(editingFood, 'price', food.price)}
                          disabled={isUpdating}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-2 rounded disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isUpdating}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-1 px-2 rounded disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 w-full">
                        <button
                          onClick={() => toggleAvailability(food)}
                          disabled={isUpdating}
                          className={`flex items-center px-2 py-1 rounded text-sm ${
                            food.availability 
                              ? 'bg-red-100 hover:bg-red-200 text-red-700'
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          } disabled:opacity-50`}
                        >
                          {food.availability ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                          {food.availability ? 'Hide' : 'Show'}
                        </button>
                        
                        <button
                          onClick={() => startEditing(food)}
                          disabled={isUpdating}
                          className="flex items-center px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm disabled:opacity-50"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => deleteFood(food.id)}
                          disabled={isUpdating}
                          className="flex items-center px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isUpdating && (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                      <span className="ml-2 text-sm text-gray-600">Updating...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No food items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterCategory !== 'all' || filterAvailability !== 'all' 
              ? 'Try adjusting your filters or search term.'
              : 'Get started by adding a new food item.'}
          </p>
          {!searchTerm && filterCategory === 'all' && filterAvailability === 'all' && (
            <div className="mt-6">
              <Link
                href="/canteen-home/food-items/add-food"
                className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Food Item
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodItems;
