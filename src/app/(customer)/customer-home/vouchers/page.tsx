"use client";
import React, { useEffect, useState } from "react";
import { Ticket, Gift, TrendingUp, Loader2, AlertCircle, Sparkles } from "lucide-react";

type Voucher = {
    id: string;
    customerId: string;
    discount: number; // 0.1 => 10%
    usageLimit: number | null;
    usedCount: number;
    createdAt: string;
};

type VoucherResponse = {
    numOfOrder: number;
    voucher: Voucher | null;
    error?: string;
};

export default function VoucherPage() {
    const [data, setData] = useState<VoucherResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        async function fetchVoucher() {
            try {
                setLoading(true);
                const res = await fetch("/api/customer-home/vouchers", {
                    cache: "no-store",
                });
                const json = (await res.json()) as VoucherResponse;
                if (!res.ok)
                    throw new Error(json?.error || "Failed to fetch voucher");
                if (mounted) setData(json);
            } catch (e) {
                if (mounted)
                    setError(
                        e instanceof Error
                            ? e.message
                            : "Failed to fetch voucher"
                    );
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchVoucher();
        return () => {
            mounted = false;
        };
    }, []);

    const content = (() => {
        if (loading)
            return (
                <div className="flex items-center justify-center p-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500">
                    <div className="flex items-center">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mr-4" />
                        <div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">Loading Voucher</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Checking your rewards...</p>
                        </div>
                    </div>
                </div>
            );
        if (error) return (
            <div className="bg-red-50/70 dark:bg-red-900/30 backdrop-blur-md border-l-[6px] border-red-500 p-8 shadow-2xl">
                <div className="flex items-start">
                    <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400 mr-4 shrink-0" />
                    <div>
                        <h2 className="text-2xl font-extrabold text-red-800 dark:text-red-300 mb-2">Error</h2>
                        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        );
        if (!data) return (
            <div className="bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md border-l-[6px] border-slate-500 p-8 shadow-2xl">
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No data available.</p>
            </div>
        );

        const orders = data.numOfOrder;
        const v = data.voucher;
        if (!v) {
            return (
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500 overflow-hidden">
                    <div className="p-8 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-slate-800/90">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 shadow-xl mr-4">
                                <Ticket className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    No Voucher Yet
                                </h2>
                                <p className="text-lg text-slate-700 dark:text-slate-300 mt-1">
                                    Keep ordering to unlock rewards!
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-800/80 p-6 border-l-4 border-orange-500 mb-6">
                            <div className="flex items-center mb-3">
                                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    Your Progress: {orders} orders
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-4">🎯 Unlock Rewards:
                            </p>
                            <div className="bg-green-50 dark:bg-green-900/30 p-4 border-l-4 border-green-500">
                                <div className="flex items-center">
                                    <Gift className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                                    <p className="text-base font-bold text-slate-900 dark:text-white">
                                        5+ orders: <span className="text-green-600 dark:text-green-400">10% off</span>
                                    </p>
                                </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 border-l-4 border-blue-500">
                                <div className="flex items-center">
                                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                                    <p className="text-base font-bold text-slate-900 dark:text-white">
                                        10+ orders: <span className="text-blue-600 dark:text-blue-400">20% off</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const percent = Math.round(v.discount);
        const remaining =
            v.usageLimit == null
                ? Infinity
                : Math.max(v.usageLimit - v.usedCount, 0);
        return (
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500 overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-slate-800/90">
                    <div className="flex items-center mb-6">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 shadow-xl mr-4">
                            <Ticket className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Your Voucher</h2>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 mb-6 shadow-2xl text-center">
                        <div className="text-7xl font-extrabold text-white mb-2 drop-shadow-lg">
                            {percent}%
                        </div>
                        <div className="text-2xl font-bold text-white uppercase tracking-wider">OFF</div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-800 p-6 border-l-4 border-orange-500 shadow-lg">
                            <div className="flex items-center mb-2">
                                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Orders Placed</span>
                            </div>
                            <span className="text-3xl text-slate-900 dark:text-white font-extrabold">{orders}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 border-l-4 border-green-500 shadow-lg">
                            <div className="flex items-center mb-2">
                                <Gift className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Uses Remaining</span>
                            </div>
                            <span className="text-3xl text-slate-900 dark:text-white font-extrabold">
                                {v.usageLimit == null ? "Unlimited" : remaining}
                            </span>
                        </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 border-l-4 border-slate-500">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Issued: {new Date(v.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 p-6 border-l-4 border-orange-500">
                        <p className="text-base text-slate-800 dark:text-slate-200 font-medium flex items-start">
                            <Sparkles className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                            <span>🎉 <strong>Tip:</strong> Your voucher is applied automatically at checkout when eligible.</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    })();

    return (
        <div className="max-w-7xl mx-auto p-6 backdrop-blur-sm space-y-6">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-2xl border-l-[6px] border-orange-500 p-8">
                <div className="flex items-center">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 shadow-xl mr-4">
                        <Ticket className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white drop-shadow-lg">Vouchers</h1>
                        <p className="text-slate-700 dark:text-slate-300 text-lg font-medium mt-1">Your exclusive rewards and discounts</p>
                    </div>
                </div>
            </div>
            {content}
        </div>
    );
}
