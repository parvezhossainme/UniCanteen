import type { Metadata } from "next";
import "../globals.css";

// font Exo
import { Exo } from "next/font/google";

// Authenication Middleware
import { ClerkProvider } from "@clerk/nextjs";

// All Components
import HomeNavBar from "../../components/forHome/HomeNavBar";
import HomeSideBar from "@/components/forHome/HomeSideBar";
// Import ContextProvider from its module (update the path if needed)
// Update the import path if the ContextProvider is located elsewhere, for example:

const exo = Exo({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-exo",
});

export const metadata: Metadata = {
    title: "UniCanteen",
    description: "UIU Canteen Management System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" className={exo.variable}>
                <body className={`${exo.className} antialiased`} suppressHydrationWarning>
                    <HomeNavBar />
                    <div className="flex h-[calc(100vh-64px)] relative">
                        {/* Background with blur overlay */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-fixed blur-[2px]"
                            style={{ 
                                backgroundImage: "url('/top-view-thanksgiving-food-border-composition-with-copy-space.jpg')"
                            }}
                        />
                        <div className="absolute inset-0 bg-white/20 dark:bg-black/30" />
                        
                        {/* Content */}
                        <div className="relative z-10 flex w-full">
                            <HomeSideBar />
                            <main className="flex-1 overflow-auto">
                                {children}
                            </main>
                        </div>
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}
