"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HomeNavItems } from "@/config";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeSideBar() {
    const navSections = HomeNavItems();
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

    // Shared styles for both SSR and Hydrated states
    const sidebarClasses = cn(
        "border-r border-orange-200/30 dark:border-orange-900/30 transition-all duration-300 ease-in-out transform hidden sm:flex h-full",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg",
        isSidebarExpanded ? "w-[260px]" : "w-[68px]"
    );

    // Prevent hydration mismatch by waiting for client-side rendering
    if (!isClient) {
        return (
            <div className="pr-4 h-full">
                <div className={cn(sidebarClasses, "w-[260px]")}>
                    <aside className="flex h-full flex-col w-full px-4">
                        <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded mb-2 mt-4 w-1/2"></div>
                            <div className="space-y-4 mt-6">
                                <div className="h-8 bg-muted rounded"></div>
                                <div className="h-8 bg-muted rounded"></div>
                                <div className="h-8 bg-muted rounded"></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div className="pr-4 h-full">
            <div className={sidebarClasses}>
                <aside className="flex h-full flex-col w-full break-words px-4">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-4">
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-2 mt-6 tracking-widest h-4">
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
                                        {item.subItems && isSidebarExpanded && (
                                            <div className="ml-6 mt-1 flex flex-col space-y-1 border-l border-muted/50">
                                                {item.subItems.map((sub, subIdx) => (
                                                    <SideNavItem
                                                        key={subIdx}
                                                        label={sub.name}
                                                        icon={sub.icon}
                                                        path={sub.href}
                                                        active={sub.active}
                                                        isSidebarExpanded={isSidebarExpanded}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </aside>

                {/* Toggle Button Container */}
                <div className="relative">
                    <button
                        type="button"
                        className="absolute bottom-20 right-[-12px] flex h-6 w-6 items-center justify-center border border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors z-50"
                        onClick={toggleSidebar}
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
    const activeClasses = active
        ? "bg-orange-100/80 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 font-medium shadow-sm border border-orange-200/50 dark:border-orange-800/50"
        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-orange-700 dark:hover:text-orange-300";

    const commonClasses = cn(
        "relative flex items-center whitespace-nowrap rounded-md transition-all duration-200",
        activeClasses
    );

    if (!isSidebarExpanded) {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={path} className={cn(commonClasses, "justify-center p-2")}>
                            {icon}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={15}>
                        {label}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Link href={path} className={cn(commonClasses, "px-2 py-1.5")}>
            <div className="flex flex-row items-center space-x-3">
                <span className={cn("transition-colors", active ? "text-orange-600 dark:text-orange-400" : "")}>
                    {icon}
                </span>
                <span className="text-base truncate">{label}</span>
            </div>
        </Link>
    );
};