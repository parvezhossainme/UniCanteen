import DeliSideBar from "@/components/forDelivery/DeliSideBar";
import DeliNavBar from "@/components/forDelivery/DeliNavBar";
import { ClerkProvider } from "@clerk/nextjs";

import type { Metadata } from "next";
import "../globals.css";

// font Exo
import { Exo } from "next/font/google";
const exo = Exo({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-exo",
});

export const metadata: Metadata = {
    title: "Delivery | UniCanteen",
    description: "Delivery the Food in Campus",
};



export default function deliveryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" className={exo.variable}>
                <body className={`${exo.className} antialiased`} suppressHydrationWarning>
                    <DeliNavBar />
                    <div className="flex h-[calc(100vh-64px)]">
                        <DeliSideBar />
                        <main 
                            className="flex-1 overflow-auto bg-cover bg-center bg-fixed"
                            style={{ 
                                backgroundImage: "url('/top-view-thanksgiving-food-border-composition-with-copy-space.jpg')"
                            }}
                        >
                            {children}
                        </main>
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}
