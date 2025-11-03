"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Session {
    _id: string;
    topic: string;
    difficulty: string;
    totalQuestions: number;
    completedQuestions: number;
    createdAt: string;
    status: 'completed' | 'in-progress';
    score?: number;
}

interface Stats {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    totalQuestions: number;
    favoriteTopics: string[];
}

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
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
                setUser({
                    name: payload.name || 'User',
                    email: payload.email || ''
                });
                fetchDashboardData();
            } else {
                console.error("Invalid token payload");
                localStorage.removeItem("token");
                router.push("/auth");
            }
        } catch (error) {
            console.error("Invalid token");
            localStorage.removeItem("token");
            router.push("/auth");
        }
    }, [router]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");
            const [sessionsRes, statsRes] = await Promise.all([
                fetch("/api/user/sessions", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch("/api/user/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (sessionsRes.ok) {
                const sessionsData = await sessionsRes.json();
                setSessions(sessionsData.sessions || []);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.stats || {
                    totalSessions: 0,
                    completedSessions: 0,
                    averageScore: 0,
                    totalQuestions: 0,
                    favoriteTopics: []
                });
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            // Set default stats if API fails
            setStats({
                totalSessions: 0,
                completedSessions: 0,
                averageScore: 0,
                totalQuestions: 0,
                favoriteTopics: []
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const viewSessionResults = (sessionId: string) => {
        router.push(`/results/${sessionId}`);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Track your progress and continue your interview preparation journey
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Start New Session
                        </button>
                        <button
                            onClick={() => router.push("/features")}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Explore Features
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Questions Answered</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Recent Sessions
                            </button>
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'progress'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Progress
                            </button>
                            <button
                                onClick={() => setActiveTab('topics')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'topics'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Topics
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="bg-white rounded-xl shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Interview Sessions</h3>
                        </div>
                        <div className="p-6">
                            {sessions.length > 0 ? (
                                <div className="space-y-4">
                                    {sessions.slice(0, 10).map((session) => (
                                        <div key={session._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-3 h-3 rounded-full ${session.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}></div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{session.topic}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {session.completedQuestions} of {session.totalQuestions} questions • {formatDate(session.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${session.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                    session.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {session.difficulty}
                                                </span>
                                                {session.score !== undefined && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(session.score)}`}>
                                                        {session.score}%
                                                    </span>
                                                )}
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {session.status === 'completed' ? 'Completed' : 'In Progress'}
                                                </span>
                                                {session.status === 'completed' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            viewSessionResults(session._id);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        View Results
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                                    <p className="text-gray-600 mb-6">Start your first interview session to see your progress here</p>
                                    <button
                                        onClick={() => router.push("/")}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                                    >
                                        Start First Session
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Your Progress</h3>

                        {stats && stats.totalSessions > 0 ? (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                                        <span className="text-sm text-gray-500">
                                            {Math.round((stats.completedSessions / stats.totalSessions) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                                            style={{ width: `${(stats.completedSessions / stats.totalSessions) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                                        <div className="text-sm text-gray-600">Total Sessions</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{stats.completedSessions}</div>
                                        <div className="text-sm text-gray-600">Completed</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
                                        <div className="text-sm text-gray-600">Average Score</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📊</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data yet</h3>
                                <p className="text-gray-600">Complete some interview sessions to see your progress analytics</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'topics' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Your Favorite Topics</h3>

                        {stats && stats.favoriteTopics.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {stats.favoriteTopics.map((topic, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors">
                                        <div className="text-2xl mb-2">
                                            {topic === 'JavaScript' ? '🟨' :
                                                topic === 'React' ? '⚛️' :
                                                    topic === 'Python' ? '🐍' :
                                                        topic === 'Node.js' ? '🟢' :
                                                            topic === 'System Design' ? '🏗️' :
                                                                topic === 'SQL' ? '🗄️' : '💻'}
                                        </div>
                                        <div className="font-medium text-gray-900">{topic}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎯</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite topics yet</h3>
                                <p className="text-gray-600">Practice with different topics to see your preferences here</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}