"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

interface QuestionResult {
    id: string;
    questionNumber: number;
    questionText: string;
    answerText: string;
    difficulty: string;
    type: string;
    feedback: {
        score: number;
        correct: boolean;
        explanation: string;
        strengths: string[];
        improvements: string[];
    } | null;
}

interface SessionResults {
    sessionInfo: {
        id: string;
        topic: string;
        difficulty: string;
        questionType: string;
        createdAt: string;
        completed: boolean;
        totalQuestions: number;
        answeredQuestions: number;
    };
    overallPerformance: {
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        completionRate: number;
        passRate: string;
    };
    performanceByDifficulty: {
        [key: string]: {
            total: number;
            correct: number;
            avgScore: number;
        };
    };
    sessionFeedback: {
        text: string;
        accuracy: number;
        explanation: string;
    } | null;
    questions: QuestionResult[];
    recommendations: Array<{
        type: string;
        title: string;
        description: string;
    }>;
}

export default function ResultsPage() {
    const [results, setResults] = useState<SessionResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId as string;

    useEffect(() => {
        fetchResults();
    }, [sessionId]);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth");
                return;
            }

            const response = await fetch(`/api/interview/results/${sessionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data);
            } else {
                setError("Failed to load results");
            }
        } catch (err) {
            setError("Error loading results");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case 'success': return '🎉';
            case 'improvement': return '📈';
            case 'critical': return '⚠️';
            default: return '💡';
        }
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

    if (error || !results) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || "Unable to load interview results"}</p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Interview Results</h1>
                            <p className="text-gray-600 mt-2">
                                {results.sessionInfo.topic} • {formatDate(results.sessionInfo.createdAt)}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Overall Performance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average Score</p>
                                <p className="text-2xl font-bold text-gray-900">{results.overallPerformance.averageScore}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                                <p className="text-2xl font-bold text-gray-900">{results.overallPerformance.highestScore}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{results.overallPerformance.completionRate}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${results.overallPerformance.passRate === 'Pass' ? 'bg-green-100' : 'bg-yellow-100'
                                }`}>
                                <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Result</p>
                                <p className={`text-2xl font-bold ${results.overallPerformance.passRate === 'Pass' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                    {results.overallPerformance.passRate}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Session Feedback */}
                        {results.sessionFeedback && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Feedback</h3>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-700 whitespace-pre-line">{results.sessionFeedback.text}</p>
                                </div>
                            </div>
                        )}

                        {/* Question Details */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Question-by-Question Analysis</h3>
                            <div className="space-y-4">
                                {results.questions.map((question, index) => (
                                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-900">
                                                Question {question.questionNumber}
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                        question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {question.difficulty}
                                                </span>
                                                {question.feedback && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(question.feedback.score)}`}>
                                                        {question.feedback.score}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 mb-3">{question.questionText}</p>

                                        <button
                                            onClick={() => setSelectedQuestion(selectedQuestion === index ? null : index)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            {selectedQuestion === index ? 'Hide Details' : 'View Details'}
                                        </button>

                                        {selectedQuestion === index && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="mb-4">
                                                    <h5 className="font-medium text-gray-900 mb-2">Your Answer:</h5>
                                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{question.answerText}</p>
                                                </div>

                                                {question.feedback && (
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 mb-2">Feedback:</h5>
                                                        <p className="text-gray-700 mb-3">{question.feedback.explanation}</p>

                                                        {question.feedback.strengths.length > 0 && (
                                                            <div className="mb-3">
                                                                <h6 className="font-medium text-green-700 mb-1">Strengths:</h6>
                                                                <ul className="list-disc list-inside text-sm text-gray-600">
                                                                    {question.feedback.strengths.map((strength, i) => (
                                                                        <li key={i}>{strength}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {question.feedback.improvements.length > 0 && (
                                                            <div>
                                                                <h6 className="font-medium text-yellow-700 mb-1">Areas for Improvement:</h6>
                                                                <ul className="list-disc list-inside text-sm text-gray-600">
                                                                    {question.feedback.improvements.map((improvement, i) => (
                                                                        <li key={i}>{improvement}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Performance by Difficulty */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Difficulty</h3>
                            <div className="space-y-4">
                                {Object.entries(results.performanceByDifficulty).map(([difficulty, perf]) => (
                                    perf.total > 0 && (
                                        <div key={difficulty}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700 capitalize">{difficulty}</span>
                                                <span className="text-sm text-gray-500">{Math.round(perf.avgScore)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${perf.avgScore >= 80 ? 'bg-green-500' :
                                                            perf.avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${perf.avgScore}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {perf.correct} of {perf.total} questions
                                            </p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
                            <div className="space-y-4">
                                {results.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <span className="text-2xl">{getRecommendationIcon(rec.type)}</span>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{rec.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push("/")}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                                >
                                    Start New Session
                                </button>
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    View All Sessions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}