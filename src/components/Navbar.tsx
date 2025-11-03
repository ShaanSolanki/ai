"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAvatarInitial, getDisplayName, decodeJWTPayload } from "@/lib/utils";

interface User {
    name: string;
    email: string;
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const payload = decodeJWTPayload(token);
            if (payload && (payload.name || payload.email)) {
                setUser({
                    name: getDisplayName(payload.name),
                    email: payload.email || ''
                });
            } else {
                console.error("Invalid token payload");
                localStorage.removeItem("token");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("interviewSessionId");
        localStorage.removeItem("firstQuestion");
        localStorage.removeItem("totalQuestions");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("pendingSession");
        setUser(null);
        router.push("/");
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">AI</span>
                            </div>
                            <span className="ml-2 text-xl font-bold text-gray-900">Interview Prep</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => router.push("/")}
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Home
                        </button>
                        {user && (
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Dashboard
                            </button>
                        )}
                        <button
                            onClick={() => router.push("/features")}
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => router.push("/pricing")}
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Pricing
                        </button>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {getAvatarInitial(user.name)}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">{getDisplayName(user.name)}</span>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <button
                                            onClick={() => router.push("/user")}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.push("/auth")}
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign in
                                </button>
                                <button
                                    onClick={() => router.push("/auth")}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-blue-600 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                        <button
                            onClick={() => router.push("/")}
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md w-full text-left"
                        >
                            Home
                        </button>
                        {user && (
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md w-full text-left"
                            >
                                Dashboard
                            </button>
                        )}
                        <button
                            onClick={() => router.push("/features")}
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md w-full text-left"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => router.push("/pricing")}
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md w-full text-left"
                        >
                            Pricing
                        </button>
                        {user ? (
                            <>
                                <button
                                    onClick={() => router.push("/user")}
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md w-full text-left"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md w-full text-left"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push("/auth")}
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md w-full text-left"
                                >
                                    Sign in
                                </button>
                                <button
                                    onClick={() => router.push("/auth")}
                                    className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-md w-full text-left"
                                >
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}