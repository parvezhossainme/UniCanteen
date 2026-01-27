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
                    <div className="flex h-[calc(100vh-64px)]">
                        <HomeSideBar />
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
