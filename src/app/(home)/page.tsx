"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Star, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";

import { Canteen, FeaturedItem } from "@/types/canteen";

const Home = () => {
    const router = useRouter();

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const res = await fetch("/api/clerk/role");
                const data = await res.json();
                const role = data.role;
                if (role === "CUSTOMER") router.push("/customer-home");
                else if (role === "CANTEEN_OWNER") router.push("/canteen-home");
                else if (role === "DELIVERY_PERSON")
                    router.push("/delivery-home");
                else if (role === "ADMIN") router.push("/admin-home");
            } catch (error) {
                console.error("Error checking role:", error);
            }
        };
        handleRedirect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Dynamic featured items
    const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
    useEffect(() => {
        async function fetchFeatured() {
            const res = await fetch("/api/customer-home/featured-items/");
            const data = await res.json();
            setFeaturedItems(data);
        }
        fetchFeatured();
    }, []);

    // Carousel
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { align: "center", loop: true },
        [
            Autoplay({
                delay: 2500,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        ]
    );
    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);
    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    // Static canteens datas
    const canteens: Canteen[] = [
        {
            name: "Olympia Cafe",
            image: "https://i.ibb.co.com/N29Lm2CS/olympia.png",
            location: "North Campus",
            rating: "4.5",
            href: "/olympia-cafe",
            isOpen: true,
        },
        {
            name: "Khans Kitchen",
            image: "https://i.ibb.co.com/00kZFSW/khans.png",
            location: "South Campus",
            rating: "4.3",
            href: "/khans-kitchen",
            isOpen: true,
        },
        {
            name: "Neptune Cafe",
            image: "https://i.ibb.co.com/zhHLwb0x/neptune.png",
            location: "East Campus",
            rating: "4.4",
            href: "/neptune-cafe",
            isOpen: false,
        },
    ];

    return (
        <div className="flex-1 h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 dark:border-slate-700/50">
                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 drop-shadow-lg">
                        Welcome to UniCanteen
                    </h1>
                    <p className="text-xl text-slate-800 dark:text-slate-100 font-medium">
                        Order from your favorite campus restaurants
                    </p>
                </div>

                {/* Featured Items Carousel */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-md">
                            🔥 Featured Specials
                        </h2>
                        <div className="flex gap-3">
                            <button
                                onClick={scrollPrev}
                                className="w-11 h-11 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                            >
                                <ChevronLeft className="w-5 h-5 text-white" strokeWidth={3} />
                            </button>
                            <button
                                onClick={scrollNext}
                                className="w-11 h-11 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                            >
                                <ChevronRight className="w-5 h-5 text-white" strokeWidth={3} />
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
                                        <div className="relative h-[450px] overflow-hidden group bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-2xl border-l-4 border-orange-500">
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
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 dark:to-slate-800/20" />
                                                </div>
                                                
                                                {/* Content Side */}
                                                <div className="flex flex-col justify-center p-6 md:p-8 bg-gradient-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-slate-800/80 backdrop-blur-md">
                                                    <div className="space-y-3">
                                                        <div className="inline-block">
                                                            <span className="bg-orange-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-md">
                                                                Featured
                                                            </span>
                                                        </div>
                                                        
                                                        <div>
                                                            <p className="text-orange-600 dark:text-orange-400 font-semibold text-sm uppercase tracking-wide mb-1">
                                                                {item.food.shop}
                                                            </p>
                                                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                                                {item.food.name}
                                                            </h3>
                                                        </div>
                                                        
                                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                                                            {item.food.description}
                                                        </p>
                                                        
                                                        <div className="pt-3 space-y-3 border-t-2 border-orange-200 dark:border-orange-700/50">
                                                            <div>
                                                                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">
                                                                    Price
                                                                </p>
                                                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                                                    ৳{item.food.price}
                                                                </p>
                                                            </div>
                                                            <button className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-2.5 font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                                                Order Now
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {canteens.map((canteen) => (
                        <Link
                            href={canteen.href}
                            key={canteen.name}
                            className="block group"
                        >
                            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border-l-4 border-orange-500 hover:border-orange-600 hover:translate-x-1">
                                <div className="relative h-56 w-full overflow-hidden">
                                    <Image
                                        src={canteen.image}
                                        alt={canteen.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        priority
                                        sizes="(max-width: 768px) 100vw,(max-width: 1200px) 50vw,33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="absolute top-0 right-0">
                                        <span
                                            className={`px-4 py-2 text-sm font-bold shadow-lg ${
                                                canteen.isOpen
                                                    ? "bg-green-500 text-white"
                                                    : "bg-red-500 text-white"
                                            }`}
                                        >
                                            {canteen.isOpen ? "● OPEN" : "● CLOSED"}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-700/80 dark:via-slate-800/80 dark:to-slate-900/80 backdrop-blur-md p-5 border-t-2 border-orange-200 dark:border-orange-700/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {canteen.name}
                                        </h3>
                                        <div className="flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 shadow-md">
                                            <Star
                                                size={16}
                                                className="fill-white"
                                            />
                                            <span className="text-sm font-bold">
                                                {canteen.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-slate-700 dark:text-slate-300 text-sm font-semibold">
                                        <Utensils size={16} className="mr-2 text-orange-600 dark:text-orange-400" />
                                        <span>{canteen.location}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Developed by @parvezhossainme
        </div> */}
            </div>
        </div>
    );
};

export default Home;
