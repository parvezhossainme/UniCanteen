// Navigation configuration and menu items for all user roles
import { usePathname } from "next/navigation";
import {
    Home,
    Settings,
    User,
    FileText,
    Languages,
    Star,
    Utensils,
    Users,
    UserPlus,
    ScrollText,
    Salad,
    Receipt,
    MessageCircle,
    Gift,
    Package2,
    PackageCheck,
    DollarSign
} from "lucide-react";

export const HomeNavItems = () => {
    const pathname = usePathname();

    function isNavItemActive(pathname: string, nav: string) {
        if (!pathname) return false; // Prevent errors during SSR
        return pathname.includes(nav);
    }

    return [
        {
            section: "DASHBOARD",
            items: [
                {
                    name: "Canteens",
                    href: "/",
                    icon: <Home size={20} />,
                    active: pathname === "/",
                    subItems: [
                        {
                            name: "OlympiaCafe",
                            href: "/olympia-cafe",
                            icon: <Utensils size={18} />,
                            active: isNavItemActive(pathname, "/olympia-cafe"),
                        },
                        {
                            name: "KhansKitchen",
                            href: "/khans-kitchen",
                            icon: <Utensils size={18} />,
                            active: isNavItemActive(pathname, "/khans-kitchen"),
                        },
                        {
                            name: "NeptuneCafe",
                            href: "/neptune-cafe",
                            icon: <Utensils size={18} />,
                            active: isNavItemActive(pathname, "/neptune-cafe"),
                        },
                    ],
                },
                {
                    name: "Reports",
                    href: "/reports",
                    icon: <FileText size={20} />,
                    active: isNavItemActive(pathname, "/reports"),
                },
            ],
        },
        {
            section: "COMMUNICATION",
            items: [
                {
                    name: "Top Snacks",
                    href: "/snacks",
                    icon: <Star size={20} />,
                    active: isNavItemActive(pathname, "/snacks"),
                },
                {
                    name: "Reviews",
                    href: "/reviews",
                    icon: <User size={20} />,
                    active: isNavItemActive(pathname, "/reviews"),
                },
            ],
        },
        // {
        //     section: "SETTINGS",
        //     items: [
        //         {
        //             name: "Language",
        //             href: "/language",
        //             icon: <Languages size={20} />,
        //             active: isNavItemActive(pathname, "/language"),
        //         },
        //         {
        //             name: "Settings",
        //             href: "/settings",
        //             icon: <Settings size={20} />,
        //             active: isNavItemActive(pathname, "/settings"),
        //         },
        //     ],
        // },
    ];
};

// Delivery SideBar Items
export const DeliSideItems = () => {
    const pathname = usePathname();
    function isNavItemActive(pathname: string, nav: string) {
        if (!pathname) return false; // Prevent errors during SSR
        return pathname.includes(nav);
    }

    return [
        {
            section: "DASHBOARD",
            items: [
                {
                    name: "Home",
                    href: "/delivery-home",
                    icon: <Home size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home"),
                }
            ],
        },
        {
            section: "Deliveries",
            items: [
                {
                    name: "Ongoing Deliveries",
                    href: "/delivery-home/ongoing-deliveries",
                    icon: <Package2 size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home/ongoing-deliveries"),
                },
                {
                    name: "Completed Deliveries",
                    href: "/delivery-home/completed-deliveries",
                    icon: <PackageCheck size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home/completed-deliveries"),
                },
            ],
        },
        {
            section : "Others",
            items : [
                {
                    name: "Earnings",
                    href: "/delivery-home/earnings",
                    icon: <DollarSign size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home/earnings"),
                },
                {
                    name: "Messages",
                    href: "/delivery-home/messages",
                    icon: <MessageCircle size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home/messages"),
                },
                {
                    name: "Reviews",
                    href: "/delivery-home/reviews",
                    icon: <User size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home/reviews"),
                },
                {
                    name: "Reports",
                    href: "/delivery-home/reports",
                    icon: <FileText size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home/reports"),
                }
            ]
        },
        {
            section: "SETTINGS",
            items: [
                {
                    name: "Language",
                    href: "/delivery-home/language",
                    icon: <Languages size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home/language"),
                },
                {
                    name: "Settings",
                    href: "/delivery-home/settings",
                    icon: <Settings size={20} />,
                    active: isNavItemActive(pathname, "/delivery-home/settings"),
                },
            ],
        },
    ];
};
// Customer SideBar Items
export const CustomerSideItems = () => {
    const pathname = usePathname();
    function isNavItemActive(pathname: string, nav: string) {
        if (!pathname) return false; // Prevent errors during SSR
        return pathname.includes(nav);
    }

    return [
        {
            section: "DASHBOARD",
            items: [
                {
                    name: "Home",
                    href: "/customer-home/",
                    icon: <Home size={20} />,
                    active: pathname === "/customer-home/",
                },
                {
                    name: "Reviews",
                    href: "/customer-home/reviews",
                    icon: <User size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/reviews"),
                }
            ],
        },
        {
            section : "Canteens",
            items : [
                {
                    name: "Olympia Cafe",
                    href: "/customer-home/olympia-cafe",
                    icon: <Home size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/olympia-cafe"),
                },
                {
                    name: "Khans Kitchen",
                    href: "/customer-home/khans-kitchen",
                    icon: <Home size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/khans-kitchen"),
                },
                {
                    name: "Neptune Cafe",
                    href: "/customer-home/neptune-cafe",
                    icon: <Home size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/neptune-cafe"),
                }
            ]
        },
        {
            section: "Orders",
            items: [
                {
                    name: "Ongoing Orders",
                    href: "/customer-home/orders/ongoing",
                    icon: <Utensils size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/orders/ongoing"),
                },
                {
                    name: "Completed Orders",
                    href: "/customer-home/orders/completed",
                    icon: <Utensils size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/orders/completed"),
                },
            ],
        },
        {
            section : "Others",
            items: [
                {
                    name: "Messages",
                    href: "/customer-home/messages",
                    icon: <MessageCircle size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/messages"),
                },
                {
                    name: "Vouchers",
                    href: "/customer-home/vouchers",
                    icon: <Gift size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/vouchers"),
                },
                {
                    name: "Reports",
                    href: "/customer-home/reports",
                    icon: <FileText size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/reports"),
                }
            ]
        },
        {
            section: "SETTINGS",
            items: [
                {
                    name: "Language",
                    href: "/customer-home/language",
                    icon: <Languages size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/language"),
                },
                {
                    name: "Settings",
                    href: "/customer-home/settings",
                    icon: <Settings size={20} />,
                    active: isNavItemActive(pathname, "/customer-home/settings"),
                },
            ],
        },
    ];
};


// Canteen SideBar Items
export const CanSideItems = () => {
    const pathname = usePathname();

    function isNavItemActive(pathname: string, nav: string) {
        if (!pathname) return false; // Prevent errors during SSR
        return pathname.includes(nav);
    }

    return [
        {
            section: "DASHBOARD",
            items: [
                {
                    name: "Home",
                    href: "/canteen-home",
                    icon: <Home size={20} />,
                    active: pathname === "/canteen-home",
                },
                {
                    name: "Reviews",
                    href: "/canteen-home/reviews",
                    icon: <User size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/reviews"),
                }
            ],
        },
        {
            section : "Food Items",
            items : [
                {
                    name: "Current Foods",
                    href: "/canteen-home/food-items/current-foods",
                    icon: <Salad size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/food-items/current-foods"),
                },
                {
                    name: "Add Food",
                    href: "/canteen-home/food-items/add-food",
                    icon: <Salad size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/food-items/add-food"),
                },
                {
                    name: "Delete/Modify Foods",
                    href: "/canteen-home/food-items/delete-modify-foods",
                    icon: <Salad size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/food-items/delete-modify-foods"),
                },
                {
                    name: "Food Availability",
                    href: "/canteen-home/food-items/food-availability",
                    icon: <Salad size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/food-items/food-availability"),
                }
            ]
        },
        {
            section: "Orders",
            items: [
                // {
                //     name: "All Orders",
                //     href: "/canteen-home/orders",
                //     icon: <ScrollText size={20} />,
                //     active: isNavItemActive(pathname, "/canteen-home/orders"),
                // },
                {
                    name: "Pending Orders",
                    href: "/canteen-home/orders/pending",
                    icon: <ScrollText size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/orders/pending"),
                },
                {
                    name: "Completed Orders",
                    href: "/canteen-home/orders/completed",
                    icon: <ScrollText size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/orders/completed"),
                },
            ],
        },
        // {
        //     section: "Staff Management",
        //     items: [
        //         {
        //             name: "Staffs List",
        //             href: "/canteen-home/staffs",
        //             icon: <Users size={20} />,
        //             active: isNavItemActive(pathname, "/canteen-home/staffs"),
        //         },
        //         {
        //             name: "Add Staff",
        //             href: "/canteen-home/staffs/add-staffs",
        //             icon: <UserPlus size={20} />,
        //             active: isNavItemActive(pathname, "/canteen-home/staffs/add-staffs"),
        //         }
        //     ]

        // },
        {
            section: "Others",
            items: [
                {
                    name: "Delivery-Persons",
                    href: "/canteen-home/delivery-persons",
                    icon: <Users size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/delivery-persons"),
                },
                {
                    name: "Reports",
                    href: "/canteen-home/reports",
                    icon: <Receipt size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/reports"),
                },
                {
                    name: "Messages",
                    href: "/canteen-home/messages",
                    icon: <MessageCircle size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/messages"),
                }
            ]
        },
        {
            section: "SETTINGS",
            items: [
                {
                    name: "Language",
                    href: "/canteen-home/language",
                    icon: <Languages size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/language"),
                },
                {
                    name: "Settings",
                    href: "/canteen-home/settings",
                    icon: <Settings size={20} />,
                    active: isNavItemActive(pathname, "/canteen-home/settings"),
                },
            ],
        },
    ];
}
