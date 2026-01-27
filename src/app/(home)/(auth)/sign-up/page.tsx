"use client";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateUserRole } from "@/actions/auth/update-user-role";

export default function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DEFAULT");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError("");

      // Create the sign-up with unsafe metadata
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: {
          role: role
        }
      });

      // Start email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setShowVerification(true);

    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError("");

      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        // Set the active session first
        await setActive({ session: result.createdSessionId });

        // Update the user's role in public metadata
        const roleUpdateResult = await updateUserRole(role);
        
        if (roleUpdateResult.error) {
          console.error("Error updating role:", roleUpdateResult.error);
        }

        // Determine redirect path based on role
        const redirectPath = role === "CUSTOMER" 
          ? "/customer-home"
          : role === "CANTEEN_OWNER" 
            ? "/canteen-home" 
            : role === "DELIVERY_PERSON" 
              ? "/delivery-home"
              : "/";

        // Small delay to ensure metadata is updated
        setTimeout(() => {
          router.replace(redirectPath);
        }, 500);

      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-xl max-h-[95vh] overflow-y-auto">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-2xl border-l-4 border-orange-500 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-orange-50/80 via-amber-50/80 to-yellow-50/80 dark:from-slate-700/80 dark:via-slate-800/80 dark:to-slate-900/80 backdrop-blur-md p-8 border-b-2 border-orange-200 dark:border-orange-700/50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {showVerification ? "Verify Email" : "Join UniCanteen"}
              </h1>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {showVerification ? "Enter the code sent to your email" : "Create your account to get started"}
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

            {!showVerification ? (
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

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide"
                  >
                    Account Type
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white transition-all duration-300"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="CANTEEN_OWNER">Canteen Owner</option>
                    <option value="DELIVERY_PERSON">Delivery Person</option>
                  </select>
                </div>

                <div id="clerk-captcha" className="mt-4" />

                <button
                  type="submit"
                  disabled={loading || !isLoaded}
                  className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-3.5 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wide"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerification} className="space-y-5">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide"
                  >
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-center text-2xl tracking-widest font-bold transition-all duration-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !isLoaded}
                  className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-3.5 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wide"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </form>
            )}

            {!showVerification && (
              <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-700 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <a
                    href="/sign-in"
                    className="text-orange-600 dark:text-orange-400 font-bold hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    Sign In
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}