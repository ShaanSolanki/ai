"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function Features() {
    const features = [
        {
            icon: "🤖",
            title: "AI-Powered Question Generation",
            description: "Our advanced AI creates unique, contextual questions that adapt to your skill level and learning progress.",
            details: [
                "Dynamic difficulty adjustment",
                "Context-aware follow-up questions",
                "Industry-specific scenarios",
                "Real-world problem simulation"
            ]
        },
        {
            icon: "🎯",
            title: "Personalized Learning Paths",
            description: "Customized interview preparation tailored to your target role, experience level, and areas of improvement.",
            details: [
                "Role-specific question sets",
                "Skill gap analysis",
                "Progressive difficulty scaling",
                "Adaptive learning algorithms"
            ]
        },
        {
            icon: "📊",
            title: "Advanced Analytics & Insights",
            description: "Comprehensive performance tracking with detailed analytics to identify strengths and areas for improvement.",
            details: [
                "Performance trend analysis",
                "Skill-based scoring",
                "Comparative benchmarking",
                "Progress visualization"
            ]
        },
        {
            icon: "💡",
            title: "Instant Feedback & Coaching",
            description: "Receive immediate, constructive feedback on your answers with suggestions for improvement.",
            details: [
                "Real-time answer evaluation",
                "Structured feedback reports",
                "Improvement recommendations",
                "Best practice examples"
            ]
        },
        {
            icon: "🔄",
            title: "Continuous Learning Loop",
            description: "Our system learns from your responses to provide increasingly relevant and challenging questions.",
            details: [
                "Machine learning optimization",
                "Response pattern analysis",
                "Adaptive question selection",
                "Personalized difficulty curves"
            ]
        },
        {
            icon: "🌐",
            title: "Multi-Domain Coverage",
            description: "Comprehensive coverage across technical, behavioral, and industry-specific interview topics.",
            details: [
                "Technical coding challenges",
                "System design scenarios",
                "Behavioral questions",
                "Industry-specific cases"
            ]
        },
        {
            icon: "📱",
            title: "Cross-Platform Accessibility",
            description: "Practice anywhere, anytime with our responsive design that works seamlessly across all devices.",
            details: [
                "Mobile-optimized interface",
                "Offline practice mode",
                "Cloud synchronization",
                "Cross-device continuity"
            ]
        },
        {
            icon: "🔒",
            title: "Privacy & Security",
            description: "Your data is protected with enterprise-grade security and privacy measures.",
            details: [
                "End-to-end encryption",
                "GDPR compliance",
                "Secure data storage",
                "Privacy-first design"
            ]
        }
    ];

    const testimonials = [
        {
            name: "Alex Chen",
            role: "Senior Software Engineer at Microsoft",
            content: "The AI-generated questions were incredibly realistic. I felt fully prepared for my actual interviews.",
            avatar: "AC",
            rating: 5
        },
        {
            name: "Maria Rodriguez",
            role: "Product Manager at Spotify",
            content: "The personalized feedback helped me identify and fix my weak points. Landed my dream job!",
            avatar: "MR",
            rating: 5
        },
        {
            name: "David Kim",
            role: "Data Scientist at Netflix",
            content: "The analytics dashboard showed me exactly where I needed to improve. Game-changing platform!",
            avatar: "DK",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Powerful Features for
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Interview Success</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Discover how our AI-powered platform transforms interview preparation with cutting-edge technology and personalized learning experiences.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-start space-x-4">
                                    <div className="text-4xl">{feature.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                        <p className="text-gray-600 mb-6">{feature.description}</p>
                                        <ul className="space-y-2">
                                            {feature.details.map((detail, detailIndex) => (
                                                <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our intelligent system adapts to your needs and provides personalized interview preparation
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Path</h3>
                            <p className="text-gray-600">
                                Select your target role, experience level, and specific topics you want to focus on.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice & Learn</h3>
                            <p className="text-gray-600">
                                Answer AI-generated questions and receive instant feedback to improve your responses.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
                            <p className="text-gray-600">
                                Monitor your improvement with detailed analytics and personalized recommendations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
                        <p className="text-xl text-gray-600">
                            Join thousands of successful candidates who achieved their career goals
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-xl p-8">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.avatar}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>

                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>

                                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Interview Preparation?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of successful candidates and start your journey today
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.location.href = "/auth"}
                            className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            Start Free Trial
                        </button>
                        <button
                            onClick={() => window.location.href = "/pricing"}
                            className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-medium hover:bg-white hover:text-blue-600 transition-all duration-200"
                        >
                            View Pricing
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}