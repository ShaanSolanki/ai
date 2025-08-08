"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
  const [answerText, setAnswerText] = useState<string>("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On initial load
  useEffect(() => {
    if (!sessionIdQuery) {
      router.push("/");
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
          "Authorization": `Bearer ${token}`, // Send token here
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion._id,
          answerText,
        }),
      });

      const data: AnswerResponse = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save answer");
      } else {
        setAnswerText("");
        if (data.completed) {
          setCompleted(true);
          setCurrentQuestion(null);
        } else if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
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
      <div>
        <h2>No active interview session</h2>
        <p>Please generate a session first.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "1rem auto", fontFamily: "Arial" }}>
      <h1>Interview Session</h1>
      <p>
        Question {completed ? totalQuestions : currentQuestion ? 1 : 0} of {totalQuestions}
      </p>

      {completed ? (
        <div>
          <h2>Interview Completed!</h2>
          <p>Thank you for your answers.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <strong>Q: </strong> {currentQuestion?.questionText}
          </div>

          <textarea
            rows={4}
            style={{ width: "100%" }}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer here..."
            disabled={loading}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button onClick={handleSubmitAnswer} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Saving answer..." : "Submit Answer"}
          </button>
        </>
      )}
    </div>
  );
}
