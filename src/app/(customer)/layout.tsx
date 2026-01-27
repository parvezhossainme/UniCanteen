
import { ClerkProvider } from "@clerk/nextjs";

import type { Metadata } from "next";
import "../globals.css";
import CusNavBar from "@/components/forCustomer/CusNavBar";
import CusSideBar from "@/components/forCustomer/CusSideBar";
import { CartProvider } from "@/contexts/CartContext";

// font Exo
import { Exo } from "next/font/google";
const exo = Exo({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-exo",
});

export const metadata: Metadata = {
    title: "Yummy | UniCanteen",
    description: "Eat Your Fav Foods",
};



export default function customerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" className={exo.variable}>
                <body className={`${exo.className} antialiased`} suppressHydrationWarning>
                    <CartProvider>
                        <CusNavBar />
                        <div 
                            className="flex h-[calc(100vh-64px)] bg-cover bg-center bg-fixed"
                            style={{ 
                                backgroundImage: "url('/top-view-thanksgiving-food-border-composition-with-copy-space.jpg')"
                            }}
                        >
                            <CusSideBar />
                            <main className="flex-1 overflow-auto">
                                {children}
                            </main>
                        </div>
                    </CartProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
