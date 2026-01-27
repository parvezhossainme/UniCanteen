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
                        "w-[260px]",
                        "border-r border-orange-200/50 dark:border-orange-900/50 hidden sm:flex h-full bg-gradient-to-b from-orange-50/90 to-amber-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-md shadow-lg"
                    )}
                >
                    <aside className="flex h-full flex-col w-full px-3 py-4 overflow-x-hidden">
                        <div className="animate-pulse space-y-4">
                            <div className="h-3 bg-muted rounded w-20 mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-10 bg-muted/50 rounded-lg"></div>
                                <div className="h-10 bg-muted/50 rounded-lg"></div>
                                <div className="h-10 bg-muted/50 rounded-lg"></div>
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
                    isSidebarExpanded ? "w-[260px]" : "w-[68px]",
                    "border-r border-orange-200/50 dark:border-orange-900/50 transition-all duration-300 ease-in-out hidden sm:flex h-full bg-gradient-to-b from-orange-50/90 to-amber-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-md shadow-lg"
                )}
            >
                <aside className="flex h-full flex-col w-full px-3 py-4 overflow-x-hidden">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-6">
                            {isSidebarExpanded && (
                                <div className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase mb-2 mt-6 tracking-widest">
                                    {section.section}
                                </div>
                            )}
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
                    <div className="mt-auto mb-2">
                        <ThemeToggle isDropDown={true} />
                    </div>
                </aside>
                <div className="relative">
                    <button
                        type="button"
                        className="absolute bottom-20 right-[-12px] flex h-6 w-6 items-center justify-center border border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors z-50"
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        {isSidebarExpanded ? (
                            <ChevronLeft size={14} className="text-foreground" />
                        ) : (
                            <ChevronRight size={14} className="text-foreground" />
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
                    className={cn(
                        "relative flex items-center whitespace-nowrap rounded-md px-2 py-1.5 transition-all duration-200",
                        active
                            ? "bg-orange-100/80 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 font-medium shadow-sm border border-orange-200/50 dark:border-orange-800/50"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-orange-700 dark:hover:text-orange-300"
                    )}
                >
                    <div className="flex flex-row items-center space-x-3">
                        <span className={cn("transition-colors", active ? "text-orange-600 dark:text-orange-400" : "")}>
                            {icon}
                        </span>
                        <span className="text-base truncate">{label}</span>
                    </div>
                </Link>
            ) : (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={path}
                                className={cn(
                                    "relative flex items-center justify-center whitespace-nowrap rounded-md p-2 transition-all duration-200",
                                    active
                                        ? "bg-orange-100/80 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 font-medium shadow-sm border border-orange-200/50 dark:border-orange-800/50"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-orange-700 dark:hover:text-orange-300"
                                )}
                            >
                                {icon}
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={15}>
                            {label}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </>
    );
};