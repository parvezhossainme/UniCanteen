"use client";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignIn() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        try {
            setLoading(true);
            setError("");

            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!isLoaded) return;

        try {
            setLoading(true);
            setError("");
            
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Failed to sign in with Google");
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-xl max-h-[95vh] overflow-y-auto">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-2xl border-l-4 border-orange-500 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-linear-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-700/80 dark:via-slate-800/80 dark:to-slate-900/80 backdrop-blur-md p-8 border-b-2 border-orange-200 dark:border-orange-700/50">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                Sign in to UniCanteen
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your.email@example.com"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-300"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-300"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-3.5 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wide"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t-2 border-slate-200 dark:border-slate-700"></div>
                            <span className="px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Or
                            </span>
                            <div className="flex-1 border-t-2 border-slate-200 dark:border-slate-700"></div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            type="button"
                            className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 px-6 py-3.5 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-700 text-center">
                            <p className="text-slate-600 dark:text-slate-400">
                                Don't have an account?{" "}
                                <Link
                                    href="/sign-up"
                                    className="text-orange-600 dark:text-orange-400 font-bold hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
