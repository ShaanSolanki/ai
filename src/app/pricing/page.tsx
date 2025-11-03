"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";

export default function Pricing() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: "Free",
            description: "Perfect for getting started",
            price: { monthly: 0, yearly: 0 },
            features: [
                "5 interview sessions per month",
                "Basic question types",
                "Standard difficulty levels",
                "Basic performance tracking",
                "Email support"
            ],
            limitations: [
                "Limited to 5 questions per session",
                "No advanced analytics",
                "No custom topics"
            ],
            cta: "Get Started",
            popular: false,
            color: "border-gray-200"
        },
        {
            name: "Pro",
            description: "For serious interview preparation",
            price: { monthly: 19, yearly: 190 },
            features: [
                "Unlimited interview sessions",
                "All question types (Technical, Behavioral, Mixed)",
                "Advanced difficulty adaptation",
                "Detailed analytics & insights",
                "Custom topic creation",
                "Performance benchmarking",
                "Priority email support",
                "Progress tracking",
                "Export session data"
            ],
            limitations: [],
            cta: "Start Pro Trial",
            popular: true,
            color: "border-blue-500"
        },
        {
            name: "Enterprise",
            description: "For teams and organizations",
            price: { monthly: 99, yearly: 990 },
            features: [
                "Everything in Pro",
                "Team management dashboard",
                "Bulk user management",
                "Custom branding",
                "Advanced reporting",
                "API access",
                "SSO integration",
                "Dedicated account manager",
                "Custom integrations",
                "24/7 phone support"
            ],
            limitations: [],
            cta: "Contact Sales",
            popular: false,
            color: "border-purple-500"
        }
    ];

    const faqs = [
        {
            question: "How does the AI question generation work?",
            answer: "Our AI uses advanced natural language processing to create unique, contextual questions based on your selected topics, difficulty level, and past performance. Each question is tailored to challenge you appropriately while maintaining relevance to real interview scenarios."
        },
        {
            question: "Can I cancel my subscription anytime?",
            answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period, and you won't be charged for the next cycle."
        },
        {
            question: "Is there a free trial for paid plans?",
            answer: "Yes, we offer a 7-day free trial for the Pro plan. You can explore all premium features without any commitment. No credit card required to start the trial."
        },
        {
            question: "How accurate is the feedback system?",
            answer: "Our AI feedback system is trained on thousands of successful interview responses and is continuously improved. While it provides valuable insights, we recommend using it as a guide alongside other preparation methods."
        },
        {
            question: "Do you offer refunds?",
            answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team for a full refund."
        },
        {
            question: "Can I switch between plans?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences."
        }
    ];

    const getPrice = (plan: typeof plans[0]) => {
        const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
        return price === 0 ? 'Free' : `$${price}`;
    };

    const getSavings = (plan: typeof plans[0]) => {
        if (plan.price.monthly === 0) return null;
        const monthlyCost = plan.price.monthly * 12;
        const yearlyCost = plan.price.yearly;
        const savings = monthlyCost - yearlyCost;
        return Math.round((savings / monthlyCost) * 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar />

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Simple, Transparent
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Pricing</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Choose the perfect plan for your interview preparation journey. All plans include our core AI-powered features.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mb-12">
                        <span className={`mr-3 ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className={`ml-3 ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            Yearly
                        </span>
                        {billingCycle === 'yearly' && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Save up to 20%
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative bg-white rounded-2xl shadow-xl p-8 ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                                    } hover:shadow-2xl transition-all duration-300`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <p className="text-gray-600 mb-4">{plan.description}</p>
                                    <div className="mb-2">
                                        <span className="text-4xl font-bold text-gray-900">{getPrice(plan)}</span>
                                        {plan.price.monthly > 0 && (
                                            <span className="text-gray-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                        )}
                                    </div>
                                    {billingCycle === 'yearly' && getSavings(plan) && (
                                        <p className="text-green-600 text-sm font-medium">
                                            Save {getSavings(plan)}% with yearly billing
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-start">
                                            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}

                                    {plan.limitations.map((limitation, limitationIndex) => (
                                        <div key={limitationIndex} className="flex items-start">
                                            <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-500 text-sm">{limitation}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        if (plan.name === 'Enterprise') {
                                            window.location.href = 'mailto:sales@interviewprep.ai';
                                        } else {
                                            window.location.href = '/auth';
                                        }
                                    }}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${plan.popular
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                            : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Comparison */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Compare Plans</h2>
                        <p className="text-xl text-gray-600">
                            See what's included in each plan to make the best choice for your needs
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-4 px-6 font-medium text-gray-900">Features</th>
                                    <th className="text-center py-4 px-6 font-medium text-gray-900">Free</th>
                                    <th className="text-center py-4 px-6 font-medium text-gray-900">Pro</th>
                                    <th className="text-center py-4 px-6 font-medium text-gray-900">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="py-4 px-6 text-gray-700">Interview Sessions</td>
                                    <td className="py-4 px-6 text-center text-gray-600">5/month</td>
                                    <td className="py-4 px-6 text-center text-green-600">Unlimited</td>
                                    <td className="py-4 px-6 text-center text-green-600">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-700">Questions per Session</td>
                                    <td className="py-4 px-6 text-center text-gray-600">5</td>
                                    <td className="py-4 px-6 text-center text-green-600">Unlimited</td>
                                    <td className="py-4 px-6 text-center text-green-600">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-700">AI-Powered Questions</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-700">Advanced Analytics</td>
                                    <td className="py-4 px-6 text-center">✗</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-700">Custom Topics</td>
                                    <td className="py-4 px-6 text-center">✗</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-700">Team Management</td>
                                    <td className="py-4 px-6 text-center">✗</td>
                                    <td className="py-4 px-6 text-center">✗</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-700">API Access</td>
                                    <td className="py-4 px-6 text-center">✗</td>
                                    <td className="py-4 px-6 text-center">✗</td>
                                    <td className="py-4 px-6 text-center">✓</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-700">Support</td>
                                    <td className="py-4 px-6 text-center text-gray-600">Email</td>
                                    <td className="py-4 px-6 text-center text-gray-600">Priority Email</td>
                                    <td className="py-4 px-6 text-center text-gray-600">24/7 Phone</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-gray-600">
                            Got questions? We've got answers.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of successful candidates and land your dream job
                    </p>
                    <button
                        onClick={() => window.location.href = "/auth"}
                        className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Start Free Trial
                    </button>
                </div>
            </section>
        </div>
    );
}