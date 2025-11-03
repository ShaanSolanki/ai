"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface User {
    name: string;
    email: string;
    joinedAt?: string;
    plan?: string;
}

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && (payload.name || payload.email)) {
                const userData = {
                    name: payload.name || 'User',
                    email: payload.email || '',
                    joinedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
                    plan: "Free" // Default plan
                };
                setUser(userData);
                setFormData({ name: userData.name, email: userData.email });
            } else {
                console.error("Invalid token payload");
                localStorage.removeItem("token");
                router.push("/auth");
            }
        } catch (error) {
            console.error("Invalid token");
            localStorage.removeItem("token");
            router.push("/auth");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/user/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setUser({ ...user!, ...formData });
                setMessage("Profile updated successfully!");
                setIsEditing(false);

                // Update token if needed
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to update profile");
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/user/profile", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("interviewSessionId");
                localStorage.removeItem("firstQuestion");
                localStorage.removeItem("totalQuestions");
                router.push("/");
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to delete account");
            }
        } catch (err) {
            setError("Network error occurred");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
                        <button
                            onClick={() => router.push("/auth")}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12">
                        <div className="flex items-center">
                            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            </div>
                            <div className="ml-6">
                                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                                <p className="text-blue-100">{user.email}</p>
                                <p className="text-blue-200 text-sm mt-1">
                                    Member since {user.joinedAt ? formatDate(user.joinedAt) : 'Recently'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Account Information */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {message && (
                                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800 text-sm">{message}</p>
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2">{user.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900 py-2">{user.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Plan
                                    </label>
                                    <div className="flex items-center">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {user.plan || 'Free'}
                                        </span>
                                        <button
                                            onClick={() => router.push("/pricing")}
                                            className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Upgrade
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Member Since
                                    </label>
                                    <p className="text-gray-900 py-2">
                                        {user.joinedAt ? formatDate(user.joinedAt) : 'Recently'}
                                    </p>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end space-x-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: user.name, email: user.email });
                                            setError(null);
                                            setMessage(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => router.push("/")}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="text-2xl mb-2">🚀</div>
                                    <h4 className="font-medium text-gray-900">Start New Session</h4>
                                    <p className="text-sm text-gray-600">Begin a new interview practice</p>
                                </button>

                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="text-2xl mb-2">📊</div>
                                    <h4 className="font-medium text-gray-900">View Dashboard</h4>
                                    <p className="text-sm text-gray-600">Check your progress</p>
                                </button>

                                <button
                                    onClick={() => router.push("/pricing")}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="text-2xl mb-2">⭐</div>
                                    <h4 className="font-medium text-gray-900">Upgrade Plan</h4>
                                    <p className="text-sm text-gray-600">Unlock premium features</p>
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                                <p className="text-red-700 text-sm mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}