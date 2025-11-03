"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Question {
  _id: string;
  questionText: string;
  difficulty?: string;
  answerText?: string;
}

interface AnswerResponse {
  message: string;
  nextQuestion: Question | null;
  completed: boolean;
  error?: string;
}

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionIdQuery = searchParams.get("sessionId");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1);
  const [answerText, setAnswerText] = useState<string>("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionIdQuery) {
      router.push("/");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      // Save session ID for after login
      localStorage.setItem("sessionId", sessionIdQuery);
      router.push("/auth");
      return;
    }

    setSessionId(sessionIdQuery);
    localStorage.setItem("sessionId", sessionIdQuery);

    const firstQStr = localStorage.getItem("firstQuestion");
    const totalQ = localStorage.getItem("totalQuestions");

    if (firstQStr) {
      try {
        const firstQuestion = JSON.parse(firstQStr);
        setCurrentQuestion(firstQuestion);
      } catch {
        setError("Failed to parse first question data");
      }
    }
    if (totalQ) {
      setTotalQuestions(Number(totalQ));
    }
  }, [sessionIdQuery, router]);

  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentQuestion) return;
    if (!answerText.trim()) {
      setError("Please enter your answer");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to submit an answer.");
      return;
    }

    setLoading(true);
    setError(null);



    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion._id,
          answerText,
        }),
      });

      const data: AnswerResponse = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem("token");
          localStorage.setItem("sessionId", sessionId);
          router.push("/auth");
          return;
        }
        setError(data.error || "Failed to save answer");
      } else {
        setAnswerText("");
        if (data.completed) {
          setCompleted(true);
          setCurrentQuestion(null);
        } else if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }
    } catch (err) {
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId || (!currentQuestion && !completed)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">🤔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Interview Session</h2>
            <p className="text-gray-600 mb-6">Please start a new session to begin practicing.</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Start New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Completed!</h2>
              <p className="text-gray-600 mb-8">
                Congratulations! You've successfully completed your interview session.
                Your responses are being analyzed and detailed feedback will be available shortly.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-700 text-sm">Generating personalized feedback...</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push(`/results/${sessionId}`)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  View Detailed Results
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start New Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{currentQuestionIndex} of {totalQuestions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  Q
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentQuestion?.questionText}
                  </h2>
                  {currentQuestion?.difficulty && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <textarea
                rows={8}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your detailed answer here... Be specific and provide examples where possible."
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {answerText.length} characters
                </span>
                <span className="text-xs text-gray-500">
                  Tip: Aim for detailed, structured responses
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Exit Session
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={() => setAnswerText("")}
                  disabled={loading || !answerText.trim()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading || !answerText.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    currentQuestionIndex === totalQuestions ? "Finish Interview" : "Next Question"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
