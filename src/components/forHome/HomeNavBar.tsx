import Link from "next/link";
import React from "react";
import Image from "next/image";

// Notification Icon add
import { BellIcon } from "@heroicons/react/24/outline";
import {
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";

const HomeNavBar = () => {
    return (
        <header className="flex items-center justify-between px-6 bg-[#f79256] h-20 border-b border-black/70">
            {/* <Link href="/"> */}
                <Image
                    src="/UniCanteen_L.png"
                    alt="UniCanteen Logo"
                    className="object-cover h-20"
                    width={300}
                    height={5}
                />
            {/* </Link> */}

            <nav className="flex items-center">
                <BellIcon className="text-red-700 mr-4 border rounded-full h-10 w-10 p-1 " />
                <ul className="flex gap-4">
                    <li>
                        <SignedOut>
                            <Link href="/sign-in">
                                <button className="signBtn">Sign In</button>
                            </Link>
                        </SignedOut>
                    </li>
                    <li>
                        <SignedOut>
                            <Link href="/sign-up">
                                <button className="signBtn">Sign Up</button>
                            </Link>
                        </SignedOut>
                    </li>
                    <li>
                        <SignedIn>
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "h-48 w-48",
                                    },
                                }}
                                showName={true}
                            />
                        </SignedIn>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default HomeNavBar;
