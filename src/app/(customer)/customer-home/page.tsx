// Customer home dashboard with featured items carousel and canteen listings
"use client";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { syncDataToDatabase } from "./dbSync";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Star, Utensils } from "lucide-react";
import { Canteen, FeaturedItem } from "@/types/canteen";


const CustomerHome = () => {
    const { user } = useUser();
    useEffect(() => {
        if (!user) return;
        syncDataToDatabase(user).then((res) => {
            console.log(res);
        });
    }, [user]);

    // Static canteens datas
    const canteens: Canteen[] = [
        {
            name: "Olympia Cafe",
            image: "https://i.ibb.co.com/N29Lm2CS/olympia.png",
            location: "North Campus",
            rating: "4.5",
            href: "/customer-home/olympia-cafe",
            isOpen: true,
        },
        {
            name: "Khans Kitchen",
            image: "https://i.ibb.co.com/00kZFSW/khans.png",
            location: "South Campus",
            rating: "4.3",
            href: "/customer-home/khans-kitchen",
            isOpen: true,
        },
        {
            name: "Neptune Cafe",
            image: "https://i.ibb.co.com/zhHLwb0x/neptune.png",
            location: "East Campus",
            rating: "4.4",
            href: "/customer-home/neptune-cafe",
            isOpen: false,
        },
    ];

    // Carousel setup
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { align: "center", loop: true },
        [
            Autoplay({
                delay: 2000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        ]
    );

    const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);

    useEffect(() => {
        async function fetchFeatured() {
            const res = await fetch("/api/customer-home/featured-items/");
            const data = await res.json();
            setFeaturedItems(data);
        }
        fetchFeatured();
    }, []);

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <div className="flex-1 h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-12 backdrop-blur-sm">

                {/* welcome part */}
                <div className="text-center mb-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl p-8 shadow-xl">
                    <div className="inline-block mb-4">
                        <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider shadow-lg">
                            Campus Dining
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                        Welcome to UniCanteen
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-800 dark:text-slate-200 font-bold max-w-2xl mx-auto">
                        Order from your favorite campus restaurants
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>3 Canteens Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-orange-500" />
                            <span>Fresh & Hot Meals</span>
                        </div>
                    </div>
                </div>

                {/* Featured Items Carousel */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                        <div>
                            <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-lg mb-2">
                                🔥 Featured Specials
                            </h2>
                            <p className="text-slate-800 dark:text-slate-200 text-sm font-bold">Don't miss out on today's amazing deals</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={scrollPrev}
                                className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 dark:from-orange-600 dark:to-amber-700 dark:hover:from-orange-700 dark:hover:to-amber-800 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-orange-400/50"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" strokeWidth={3} />
                            </button>
                            <button
                                onClick={scrollNext}
                                className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 dark:from-orange-600 dark:to-amber-700 dark:hover:from-orange-700 dark:hover:to-amber-800 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-orange-400/50"
                            >
                                <ChevronRight className="w-6 h-6 text-white" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className="overflow-hidden"
                            ref={emblaRef}
                        >
                            <div className="flex">
                                {featuredItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="flex-[0_0_100%] min-w-0 px-2"
                                    >
                                        <div className="relative h-[500px] overflow-hidden group bg-white dark:bg-slate-800 shadow-2xl border-l-[6px] border-orange-500 hover:border-amber-500 transition-all duration-500">
                                            <div className="grid md:grid-cols-[65%_35%] h-full">
                                                {/* Image Side */}
                                                <div className="relative h-full overflow-hidden">
                                                    <Image
                                                        src={
                                                            item.bannerImage ||
                                                            item.food.image ||
                                                            "/images/default.jpg"
                                                        }
                                                        alt={item.food.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                        priority={index === 0}
                                                        sizes="(max-width: 768px) 100vw, 65vw"
                                                    />
                                                </div>
                                                
                                                {/* Content Side */}
                                                <div className="flex flex-col justify-center p-8 md:p-10 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800">
                                                    <div className="space-y-4">
                                                        <div className="inline-block">
                                                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest shadow-lg">
                                                                ⭐ Featured
                                                            </span>
                                                        </div>
                                                        
                                                        <div>
                                                            <p className="text-orange-600 dark:text-orange-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <Utensils className="w-4 h-4" />
                                                                {item.food.shop}
                                                            </p>
                                                            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                                                {item.food.name}
                                                            </h3>
                                                        </div>
                                                        
                                                        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                                                            {item.food.description}
                                                        </p>
                                                        
                                                        <div className="pt-4 space-y-4 border-t-2 border-orange-300 dark:border-orange-600/50">
                                                            <div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-2">
                                                                    Special Price
                                                                </p>
                                                                <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                                                                    ৳{item.food.price}
                                                                </p>
                                                            </div>
                                                            <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-orange-600 dark:to-amber-600 dark:hover:from-orange-700 dark:hover:to-amber-700 text-white px-8 py-3.5 font-extrabold text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 uppercase tracking-wider">
                                                                🛒 Order Now
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Canteens List Section Here */}
                <div>
                    <div className="mb-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                        <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-lg mb-2">
                            🍽️ Our Canteens
                        </h2>
                        <p className="text-slate-800 dark:text-slate-200 text-sm font-bold">Browse and order from all available campus restaurants</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {canteens.map((canteen) => (
                        <Link
                            href={canteen.href}
                            key={canteen.name}
                            className="block group"
                        >
                            <div className="bg-white dark:bg-gray-800 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-l-[6px] border-orange-500 hover:border-amber-500 hover:-translate-y-2">
                                <div className="relative h-64 w-full overflow-hidden">
                                    <Image
                                        src={canteen.image}
                                        alt={canteen.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/60 transition-all duration-300" />
                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        <span
                                            className={`px-4 py-1.5 text-sm font-bold shadow-xl backdrop-blur-sm ${
                                                canteen.isOpen
                                                    ? "bg-green-500 text-white"
                                                    : "bg-red-500 text-white"
                                            }`}
                                        >
                                            {canteen.isOpen ? "🟢 Open Now" : "🔴 Closed"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:translate-x-1 transition-transform duration-200">
                                            {canteen.name}
                                        </h3>
                                        <div className="flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 shadow-lg">
                                            <Star
                                                size={16}
                                                className="mr-1 fill-white"
                                            />
                                            <span className="text-base font-bold">
                                                {canteen.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-slate-700 dark:text-slate-300 text-base font-medium">
                                        <Utensils size={18} className="mr-2 text-orange-500" />
                                        <span>{canteen.location}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerHome;
