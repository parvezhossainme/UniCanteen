"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeliSideItems } from "@/config";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";

export default function DeliSideBar() {
    const navSections = DeliSideItems();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const saved = window.localStorage.getItem("sidebarExpanded");
        if (saved !== null) {
            setIsSidebarExpanded(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            window.localStorage.setItem(
                "sidebarExpanded",
                JSON.stringify(isSidebarExpanded)
            );
        }
    }, [isSidebarExpanded, isClient]);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    // Prevent hydration mismatch by waiting for client-side rendering
    if (!isClient) {
        return (
            <div className="pr-4">
                <div
                    className={cn(
                        "w-[200px]", // Default expanded width during SSR
                        "border-r border-white/30 transition-all duration-300 ease-in-out transform hidden sm:flex h-full bg-white/5 dark:bg-black/5 backdrop-blur-lg"
                    )}
                >
                    <aside className="flex h-full flex-col w-full break-words px-4 overflow-x-hidden columns-1">
                        {/* Skeleton loading state */}
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2 mt-4"></div>
                            <div className="space-y-2">
                                <div className="h-8 bg-gray-100 rounded"></div>
                                <div className="h-8 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div className="pr-4">
            <div
                className={cn(
                    isSidebarExpanded ? "w-[200px]" : "w-[68px]",
                    "border-r border-white/30 transition-all duration-300 ease-in-out transform hidden sm:flex h-full bg-white/5 dark:bg-black/5 backdrop-blur-lg"
                )}
            >
                <aside className="flex h-full flex-col w-full break-words px-4 overflow-x-hidden columns-1">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-4">
                            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 mt-4 tracking-wide">
                                {isSidebarExpanded ? section.section : ""}
                            </div>
                            <div className="flex flex-col space-y-1">
                                {section.items.map((item, idx) => (
                                    <Fragment key={idx}>
                                        <SideNavItem
                                            label={item.name}
                                            icon={item.icon}
                                            path={item.href}
                                            active={item.active}
                                            isSidebarExpanded={isSidebarExpanded}
                                        />
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="sticky bottom-0 mt-auto whitespace-nowrap mb-4 transition duration-200 block">
                        <ThemeToggle isDropDown={true} />
                    </div>
                </aside>
                <div className="mt-[calc(calc(90vh)-40px)] relative">
                    <button
                        type="button"
                        className="absolute bottom-32 right-[-12px] flex h-6 w-6 items-center justify-center border border-muted-foreground/20 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
                        onClick={toggleSidebar}
                    >
                        {isSidebarExpanded ? (
                            <ChevronLeft size={16} className="stroke-foreground" />
                        ) : (
                            <ChevronRight size={16} className="stroke-foreground" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export const SideNavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    path: string;
    active: boolean;
    isSidebarExpanded: boolean;
}> = ({ label, icon, path, active, isSidebarExpanded }) => {
    return (
        <>
            {isSidebarExpanded ? (
                <Link
                    href={path}
                    className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
                        active
                            ? "font-base text-sm bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-sm text-neutral-700 dark:text-white"
                            : "hover:bg-white/10 hover:backdrop-blur-md hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-black/10 dark:hover:text-white"
                    }`}
                >
                    <div className="relative font-base text-sm py-1.5 px-2 flex flex-row items-center space-x-2 rounded-md duration-100">
                        {icon}
                        <span>{label}</span>
                    </div>
                </Link>
            ) : (
                <TooltipProvider delayDuration={70}>
                    <Tooltip>
                        <TooltipTrigger>
                            <Link
                                href={path}
                                className={`h-full relative flex items-center whitespace-nowrap rounded-md ${
                                    active
                                        ? "font-base text-sm bg-white/20 dark:bg-black/20 backdrop-blur-md text-neutral-700 dark:text-white"
                                        : "hover:bg-white/10 hover:backdrop-blur-md hover:text-neutral-700 text-neutral-500 dark:text-neutral-400 dark:hover:bg-black/10 dark:hover:text-white"
                                }`}
                            >
                                <div className="relative font-base text-sm p-2 flex flex-row items-center space-x-2 rounded-md duration-100">
                                    {icon}
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent
                            side="left"
                            className="px-3 py-1.5 text-xs"
                            sideOffset={10}
                        >
                            <span>{label}</span>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </>
    );
};