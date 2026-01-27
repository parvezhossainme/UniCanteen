// Shopping cart page with item management and checkout functionality
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CartItem } from "@/types/cart-types";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
    const { decrementCartCount, refreshCartCount } = useCart();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    const handleImageError = (foodId: string) => {
        setImageErrors((prev) => new Set(prev).add(foodId));
    };

    const getImageSrc = (item: CartItem) => {
        if (imageErrors.has(item.id) || !item.food?.image) {
            return "/default-food.jpg";
        }

        // Check if the image URL is valid
        const imageUrl = item.food.image;
        if (!imageUrl || imageUrl === "" || imageUrl.includes("undefined")) {
            return "/default-food.jpg";
        }

        return imageUrl;
    };

    useEffect(() => {
        async function fetchCart() {
            setLoading(true);
            const res = await fetch("/api/cart/get-cart-items");
            const data = await res.json();
            setCartItems(data.items || []);
            setLoading(false);
        }
        fetchCart();
    }, []);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.food?.price || 0) * item.quantity,
        0,
    );
    const deliveryFee = cartItems.length > 0 ? 20 : 0;
    const discount = 0; // Can be calculated based on vouchers/promotions
    const total = subtotal + deliveryFee - discount;

    async function updateQuantity(cartItemId: string, nextQty: number) {
        // optimistic update
        const prev = cartItems;
        const currentItem = cartItems.find((item) => item.id === cartItemId);
        const wasRemoved = nextQty === 0;

        setUpdatingId(cartItemId);
        setCartItems((items) =>
            items
                .map((it) =>
                    it.id === cartItemId ? { ...it, quantity: nextQty } : it,
                )
                .filter((it) => it.quantity > 0),
        );
        try {
            const res = await fetch("/api/cart/update-quantity", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartItemId, quantity: nextQty }),
            });
            if (!res.ok) {
                throw new Error((await res.json()).error || "Failed to update");
            } else {
                // If item was removed (quantity set to 0), update cart count
                if (wasRemoved) {
                    decrementCartCount();
                }
            }
        } catch (e) {
            // rollback
            setCartItems(prev);
        } finally {
            setUpdatingId(null);
        }
    }

    async function removeItem(cartItemId: string) {
        const prev = cartItems;
        setUpdatingId(cartItemId);
        setCartItems((items) => items.filter((it) => it.id !== cartItemId));
        try {
            const res = await fetch(
                `/api/cart/remove-item?cartItemId=${cartItemId}`,
                {
                    method: "DELETE",
                },
            );
            if (!res.ok) {
                throw new Error((await res.json()).error || "Failed to remove");
            } else {
                // Update cart count in navbar
                decrementCartCount();
            }
        } catch (e) {
            setCartItems(prev);
        } finally {
            setUpdatingId(null);
        }
    }
    // order creating parvezhossainme
    async function checkout() {
        if (updatingId) return;
        setUpdatingId("checkout");
        try {
            const res = await fetch("/api/orders/create", { method: "POST" });
            if (!res.ok)
                throw new Error((await res.json()).error || "Checkout failed");
            const { order } = await res.json();
            // Clear UI cart
            setCartItems([]);
            // Reset cart count in navbar
            refreshCartCount();
            // Optionally navigate to an order summary page later
            // router.push(`/orders/${order.id}`)
        } catch (e) {
            // noop or show toast
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-6 backdrop-blur-sm">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 p-8 mb-8">
                <div className="flex items-center">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl shadow-lg mr-4">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            Your Cart
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mt-1">
                            Review items and checkout
                        </p>
                    </div>
                </div>
            </div>

            {loading ?
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border-l-[6px] border-orange-500">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
                            <div>
                                <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                                    Loading Cart
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Fetching your items...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            : cartItems.length === 0 ?
                <div className="flex items-center justify-center min-h-[500px] px-4">
                    <div className="w-full ">
                        <div className="text-center py-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-2xl border-l-[6px] border-orange-500 px-6 sm:px-12">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-32 h-32 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                            <svg
                                className="w-16 h-16 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Your Cart is Empty
                        </h3>
                        
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 px-4">
                            <a
                                href="/customer-home"
                                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Browse Menu
                            </a>
                            <a
                                href="/customer-home/orders/ongoing"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-extrabold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-orange-300 hover:border-orange-400"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                View Orders
                            </a>
                        </div>
                        
                    </div>
                    </div>
                </div>
            :   <div className="lg:flex lg:gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-xl overflow-hidden border-l-4 border-orange-500 transition-all duration-300 hover:shadow-2xl"
                            >
                                <div className="p-4 bg-gradient-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80">
                                    <div className="flex gap-4">
                                        <div className="relative w-32 h-32 shrink-0">
                                            <Image
                                                src={getImageSrc(item)}
                                                alt={
                                                    item.food?.name ||
                                                    "Food Image"
                                                }
                                                fill
                                                sizes="128px"
                                                className="object-cover"
                                                onError={() =>
                                                    handleImageError(item.id)
                                                }
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                                                        {item.food?.name}
                                                    </h2>
                                                    {item.food?.canteen
                                                        ?.name && (
                                                        <span className="text-xs bg-orange-500 text-white px-2 py-1 font-medium whitespace-nowrap">
                                                            {item.food.canteen.name.replace(
                                                                /_/g,
                                                                " ",
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                                    {item.food?.description ||
                                                        ""}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        aria-label="Decrease quantity"
                                                        disabled={
                                                            updatingId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity -
                                                                    1,
                                                            )
                                                        }
                                                        className="w-8 h-8 border-2 border-orange-500 flex items-center justify-center text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 disabled:opacity-50 font-bold"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="min-w-8 text-center font-bold text-slate-900 dark:text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        aria-label="Increase quantity"
                                                        disabled={
                                                            updatingId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                item.quantity +
                                                                    1,
                                                            )
                                                        }
                                                        className="w-8 h-8 border-2 border-orange-500 flex items-center justify-center text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 disabled:opacity-50 font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="text-xs text-slate-600 dark:text-slate-400">
                                                            ৳{item.food?.price}{" "}
                                                            × {item.quantity}
                                                        </div>
                                                        <div className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                                                            ৳
                                                            {(item.food
                                                                ?.price || 0) *
                                                                item.quantity}
                                                        </div>
                                                    </div>
                                                    <button
                                                        aria-label="Remove item"
                                                        disabled={
                                                            updatingId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            removeItem(item.id)
                                                        }
                                                        className="text-red-500 hover:text-red-600 text-2xl font-bold transition disabled:opacity-50"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 lg:mt-0 lg:w-96 shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 p-6 sticky top-6 h-fit">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg mr-3">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                Order Summary
                            </h2>
                        </div>

                        {/* Items Count */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 mb-4 border-l-4 border-orange-400">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg
                                        className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                        />
                                    </svg>
                                    <span className="text-gray-700 dark:text-gray-200 font-semibold">
                                        Items in Cart
                                    </span>
                                </div>
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-extrabold">
                                    {cartItems.length}
                                </span>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                    Subtotal
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                    ৳{subtotal}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                                        />
                                    </svg>
                                    <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                        Delivery Fee
                                    </span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                    ৳{deliveryFee}
                                </span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <svg
                                            className="w-4 h-4 text-green-500 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                            />
                                        </svg>
                                        <span className="text-green-600 dark:text-green-400 font-semibold">
                                            Discount
                                        </span>
                                    </div>
                                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                                        -৳{discount}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-orange-200 dark:border-orange-800 my-4"></div>

                        {/* Total */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 mb-6 shadow-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-white font-extrabold text-xl">
                                    Total
                                </span>
                                <span className="text-white font-extrabold text-2xl">
                                    ৳{total}
                                </span>
                            </div>
                        </div>

                        {/* Savings Info */}
                        {deliveryFee === 20 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4 border-l-4 border-blue-400">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                                        Standard delivery fee applies. Order
                                        more to unlock free delivery!
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={checkout}
                            disabled={updatingId === "checkout"}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 text-white font-extrabold py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 disabled:transform-none flex items-center justify-center"
                        >
                            {updatingId === "checkout" ?
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Placing order...
                                </>
                            :   <>
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    Proceed to Checkout
                                </>
                            }
                        </button>

                        {/* Payment Info */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Cash on delivery • Secure checkout
                            </p>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

// export default CartPage;
