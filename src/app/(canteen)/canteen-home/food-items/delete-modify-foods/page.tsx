"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  Save,
  X,
  ArrowLeft,
  CheckCircle,
  XCircle
} from "lucide-react";
import { CanteenFood } from "@/types/food";

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
  "MEAT_ITEMS"
];

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
  MEAT_ITEMS: "Meat Items"
};

type EditingFood = CanteenFood & {
  isEditing?: boolean;
};

const DeleteModifyFoodsPage = () => {
  const [foods, setFoods] = useState<EditingFood[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<EditingFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const fetchFoods = useCallback(async () => {
    try {
      const res = await fetch("/api/canteen-home/all-foods/");
      const data: CanteenFood[] = await res.json();
      setFoods(data.map(food => ({ ...food, isEditing: false })));
    } catch (err) {
      console.error("Failed to fetch foods:", err);
      showNotification('error', 'Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const filterFoods = useCallback(() => {
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

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    filterFoods();
  }, [filterFoods]);

  const startEditing = (foodId: string) => {
    setFoods(prev => prev.map(food => 
      food.id === foodId ? { ...food, isEditing: true } : food
    ));
  };

  const cancelEditing = (foodId: string) => {
    setFoods(prev => prev.map(food => 
      food.id === foodId ? { ...food, isEditing: false } : food
    ));
    // Refresh data to revert any unsaved changes
    fetchFoods();
  };

  const updateFood = async (food: EditingFood) => {
    if (!food.name.trim()) {
      showNotification('error', 'Food name is required');
      return;
    }
    if (food.price <= 0) {
      showNotification('error', 'Price must be greater than 0');
      return;
    }
    if (food.stocks < 0) {
      showNotification('error', 'Stock cannot be negative');
      return;
    }

    setUpdating(food.id);
    try {
      const response = await fetch(`/api/canteen-home/foods/${food.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: food.name,
          price: food.price,
          description: food.description,
          image: food.image,
          availability: food.availability,
          stocks: food.stocks,
          category: food.category
        })
      });

      if (response.ok) {
        const updatedFood = await response.json();
        setFoods(prev => prev.map(f => 
          f.id === food.id ? { ...updatedFood, isEditing: false } : f
        ));
        showNotification('success', 'Food item updated successfully');
      } else {
        const errorData = await response.json();
        showNotification('error', errorData.error || 'Failed to update food item');
      }
    } catch (error) {
      console.error('Failed to update food:', error);
      showNotification('error', 'Failed to update food item');
    } finally {
      setUpdating(null);
    }
  };

  const deleteFood = async (foodId: string) => {
    setUpdating(foodId);
    try {
      const response = await fetch(`/api/canteen-home/foods/${foodId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFoods(prev => prev.filter(f => f.id !== foodId));
        showNotification('success', 'Food item deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification('error', errorData.error || 'Failed to delete food item');
      }
    } catch (error) {
      console.error('Failed to delete food:', error);
      showNotification('error', 'Failed to delete food item');
    } finally {
      setUpdating(null);
      setShowDeleteConfirm(null);
    }
  };

  const toggleAvailability = async (food: EditingFood) => {
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
        showNotification('success', `Food item ${updatedFood.availability ? 'enabled' : 'disabled'}`);
      } else {
        showNotification('error', 'Failed to update availability');
      }
    } catch (error) {
      console.error('Failed to update availability:', error);
      showNotification('error', 'Failed to update availability');
    } finally {
      setUpdating(null);
    }
  };

  const handleInputChange = (foodId: string, field: string, value: any) => {
    setFoods(prev => prev.map(food => 
      food.id === foodId ? { ...food, [field]: value } : food
    ));
  };

  const handleCategoryChange = (foodId: string, category: string, checked: boolean) => {
    setFoods(prev => prev.map(food => {
      if (food.id === foodId) {
        let newCategories = [...food.category];
        if (checked) {
          if (!newCategories.includes(category as any)) {
            newCategories.push(category as any);
          }
        } else {
          newCategories = newCategories.filter(cat => cat !== category);
        }
        return { ...food, category: newCategories };
      }
      return food;
    }));
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
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-2 border-l-[6px] ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-500' 
            : 'bg-gradient-to-r from-red-500/90 to-rose-500/90 border-red-500'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <XCircle className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-bold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-10"></div>
        <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Link 
                  href="/canteen-home/food-items/current-foods"
                  className="mr-4 p-2 hover:bg-orange-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                </Link>
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Delete & Modify Food Items</h1>
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-base font-semibold ml-14">Edit or remove food items from your menu</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link 
                href="/canteen-home/food-items/add-food"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Food
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-l-[6px] border-blue-500 hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl mr-2">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Total Items</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{foods.length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-l-[6px] border-green-500 hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-xl mr-2">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Available</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{foods.filter(f => f.availability).length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-l-[6px] border-yellow-500 hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="shrink-0 bg-gradient-to-br from-yellow-500 to-orange-500 p-2 rounded-xl mr-2">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Low Stock</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{foods.filter(f => f.stocks < 5).length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-l-[6px] border-purple-500 hover:scale-105 transition-transform">
            <div className="flex items-center">
              <div className="shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl mr-2">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Being Edited</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{foods.filter(f => f.isEditing).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-orange-200 dark:border-orange-700 mb-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
            />
          </div>
          
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
          >
            <option value="all">All Categories</option>
            {FOOD_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-4 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold flex items-center">
            Showing {filteredFoods.length} of {foods.length} items
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      {filteredFoods.length > 0 ? (
        <div className="space-y-6">
          {filteredFoods.map((food) => {
            const isUpdating = updating === food.id;
            
            return (
              <div
                key={food.id}
                className={`bg-white dark:bg-slate-800 border-2 rounded-2xl shadow-xl p-6 transition hover:scale-[1.01] ${
                  food.isEditing ? 'border-blue-500 shadow-2xl' : 'border-orange-200 dark:border-orange-700'
                }`}
              >
                {food.isEditing ? (
                  // Edit Mode
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Image and Basic Info */}
                    <div className="space-y-4">
                      <div className="relative w-full h-48">
                        <Image
                          src={food.image || "/default-food.jpg"}
                          alt={food.name}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Food Name *
                        </label>
                        <input
                          type="text"
                          value={food.name}
                          onChange={(e) => handleInputChange(food.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
                          placeholder="Enter food name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={food.image || ''}
                          onChange={(e) => handleInputChange(food.id, 'image', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
                          placeholder="Enter image URL"
                        />
                      </div>
                    </div>

                    {/* Details and Pricing */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={food.description || ''}
                          onChange={(e) => handleInputChange(food.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
                          placeholder="Enter food description"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Price (৳) *
                          </label>
                          <input
                            type="number"
                            value={food.price}
                            onChange={(e) => handleInputChange(food.id, 'price', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Stock *
                          </label>
                          <input
                            type="number"
                            value={food.stocks}
                            onChange={(e) => handleInputChange(food.id, 'stocks', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 border-2 border-orange-200 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`availability-${food.id}`}
                          checked={food.availability}
                          onChange={(e) => handleInputChange(food.id, 'availability', e.target.checked)}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor={`availability-${food.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                          Available for ordering
                        </label>
                      </div>
                    </div>

                    {/* Categories and Actions */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Categories
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {FOOD_CATEGORIES.map(category => (
                            <label key={category} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={food.category.includes(category as any)}
                                onChange={(e) => handleCategoryChange(food.id, category, e.target.checked)}
                                className="w-3 h-3 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <span className="ml-2 text-xs text-gray-700">
                                {CATEGORY_LABELS[category]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateFood(food)}
                            disabled={isUpdating}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold disabled:opacity-50 shadow-lg hover:scale-105 transition-all"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                          </button>
                          
                          <button
                            onClick={() => cancelEditing(food.id)}
                            disabled={isUpdating}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white rounded-xl font-bold disabled:opacity-50 shadow-lg hover:scale-105 transition-all"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Image */}
                    <div className="relative w-full h-48 lg:h-32">
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
                    
                    {/* Basic Info */}
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{food.name}</h3>
                      {food.description && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2 font-semibold">{food.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-semibold">Price:</span>
                          <span className="ml-2 text-lg font-extrabold text-green-600">৳{food.price}</span>
                        </div>
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-semibold">Stock:</span>
                          <span className={`ml-2 font-extrabold ${
                            food.stocks < 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                          }`}>
                            {food.stocks}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-semibold">Rating:</span>
                          <div className="ml-2 flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-bold text-gray-900 dark:text-white">{food.rating}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-semibold">Categories:</span>
                          <div className="ml-2 flex flex-wrap gap-1">
                            {food.category.slice(0, 2).map(cat => (
                              <span key={cat} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold">
                                {CATEGORY_LABELS[cat] || cat}
                              </span>
                            ))}
                            {food.category.length > 2 && (
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">+{food.category.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => toggleAvailability(food)}
                        disabled={isUpdating}
                        className={`flex items-center justify-center px-3 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all ${
                          food.availability 
                            ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                        } disabled:opacity-50`}
                      >
                        {food.availability ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {food.availability ? 'Hide' : 'Show'}
                      </button>
                      
                      <button
                        onClick={() => startEditing(food.id)}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 shadow-lg hover:scale-105 transition-all"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(food.id)}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 shadow-lg hover:scale-105 transition-all"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
                
                {isUpdating && (
                  <div className="mt-4 flex items-center justify-center py-2 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-sm text-gray-600">Processing...</span>
                  </div>
                )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 border-2 border-orange-200 dark:border-orange-700 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-br from-red-500 to-rose-500 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-extrabold text-gray-900 dark:text-white">Confirm Delete</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold mb-6">
              Are you sure you want to delete this food item? This action cannot be undone.
              If there are pending orders for this item, it cannot be deleted.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => deleteFood(showDeleteConfirm)}
                disabled={updating === showDeleteConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-bold disabled:opacity-50 shadow-lg hover:scale-105 transition-all"
              >
                {updating === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={updating === showDeleteConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white rounded-xl font-bold disabled:opacity-50 shadow-lg hover:scale-105 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteModifyFoodsPage;
