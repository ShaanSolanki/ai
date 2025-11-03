"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Question {
  _id: string;
  questionText: string;
  difficulty?: string;
}

interface GenerateResponse {
  sessionId: string;
  question: Question;
  totalQuestions: number;
  message?: string;
  error?: string;
}

interface SessionGeneratorProps {
  onSessionCreated: (sessionId: string, firstQuestion: Question, totalQuestions: number) => void;
}

const popularTopics = [
  { name: "JavaScript", icon: "🟨", color: "bg-yellow-100 text-yellow-800" },
  { name: "React", icon: "⚛️", color: "bg-blue-100 text-blue-800" },
  { name: "Node.js", icon: "🟢", color: "bg-green-100 text-green-800" },
  { name: "Python", icon: "🐍", color: "bg-blue-100 text-blue-800" },
  { name: "System Design", icon: "🏗️", color: "bg-purple-100 text-purple-800" },
  { name: "Data Structures", icon: "📊", color: "bg-indigo-100 text-indigo-800" },
  { name: "Algorithms", icon: "🧮", color: "bg-red-100 text-red-800" },
  { name: "SQL", icon: "🗄️", color: "bg-gray-100 text-gray-800" },
];

const difficultyOptions = [
  { label: "Beginner", value: "easy", description: "Perfect for getting started", color: "bg-green-50 border-green-200 text-green-800" },
  { label: "Intermediate", value: "intermediate", description: "For experienced developers", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  { label: "Advanced", value: "advanced", description: "Challenge yourself", color: "bg-red-50 border-red-200 text-red-800" },
];

const questionTypes = [
  { name: "Technical", description: "Code problems and technical concepts", icon: "💻" },
  { name: "Behavioral", description: "Soft skills and experience questions", icon: "🤝" },
  { name: "Mixed", description: "Combination of technical and behavioral", icon: "🎯" },
];

export default function SessionGenerator({ onSessionCreated }: SessionGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionType, setQuestionType] = useState("Mixed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const router = useRouter();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please select or enter a topic");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      // Save session data for after login
      localStorage.setItem("pendingSession", JSON.stringify({
        topic,
        numberOfQuestions,
        difficulty,
        questionType,
        creative: true
      }));
      router.push("/auth");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/interview/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          topic,
          numberOfQuestions,
          difficulty,
          questionType,
          creative: true, // Enable creative question generation
        }),
      });

      const data: GenerateResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate session");
        return;
      }

      onSessionCreated(data.sessionId, data.question, data.totalQuestions);

      // Clear any old session data
      localStorage.removeItem("sessionId");
      localStorage.setItem("interviewSessionId", data.sessionId);
      localStorage.setItem("firstQuestion", JSON.stringify(data.question));
      localStorage.setItem("totalQuestions", data.totalQuestions.toString());

      router.push(`/interview?sessionId=${data.sessionId}`);
    } catch (err) {
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Interview Session</h2>
          <p className="text-gray-600">Customize your practice session with AI-powered questions</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNum
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 mx-2 ${step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Topic</h3>

              {/* Popular Topics */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Popular topics:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularTopics.map((topicItem) => (
                    <button
                      key={topicItem.name}
                      onClick={() => setTopic(topicItem.name)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${topic === topicItem.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="text-2xl mb-1">{topicItem.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{topicItem.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter a custom topic:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Machine Learning, DevOps, Mobile Development..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!topic.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Configure Your Session</h3>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Difficulty Level:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDifficulty(option.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${difficulty === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Question Type:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {questionTypes.map((type) => (
                    <button
                      key={type.name}
                      onClick={() => setQuestionType(type.name)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${questionType === type.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium text-gray-900">{type.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions: {numberOfQuestions}
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3 questions</span>
                  <span>15 questions</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review & Start</h3>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium text-gray-900">{topic}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium text-gray-900 capitalize">{difficulty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Question Type:</span>
                  <span className="font-medium text-gray-900">{questionType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Number of Questions:</span>
                  <span className="font-medium text-gray-900">{numberOfQuestions}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-500 mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">AI-Powered Questions</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Our AI will generate unique, creative questions tailored to your preferences.
                      Each session is different to keep your practice fresh and challenging.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Questions...
                  </div>
                ) : (
                  "Start Interview Session"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}