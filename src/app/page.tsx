"use client";

import React, { useState } from "react";
import SessionGenerator from "@/components/SessionGenerator";
import InterviewPage from "@/app/interview/page"; // import your interview page or move InterviewPage to a component for reuse

interface Question {
  _id: string;
  questionText: string;
  difficulty?: string;
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [firstQuestion, setFirstQuestion] = useState<Question | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // This will receive generated session info from generator component
  const onSessionCreated = (sessionId: string, question: Question, totalQuestions: number) => {
    setSessionId(sessionId);
    setFirstQuestion(question);
    setTotalQuestions(totalQuestions);
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Welcome to Interview Prep</h1>

      {!sessionId ? (
        <SessionGenerator onSessionCreated={onSessionCreated} />
      ) : firstQuestion ? (
        <InterviewWithSession
          sessionId={sessionId}
          firstQuestion={firstQuestion}
          totalQuestions={totalQuestions}
          onExit={() => {
            setSessionId(null);
            setFirstQuestion(null);
            setTotalQuestions(0);
          }}
        />
      ) : null}
    </main>
  );
}

// Wrap InterviewPage functionality in a reusable component to pass props for session start
function InterviewWithSession({
  sessionId,
  firstQuestion,
  totalQuestions,
  onExit,
}: {
  sessionId: string;
  firstQuestion: Question;
  totalQuestions: number;
  onExit: () => void;
}) {
  // This will reuse InterviewPage logic, but adapt it to accept session props
  // For brevity, reuse logic from InterviewPage above, but now controlled inside this component:

  const [currentQuestion, setCurrentQuestion] = useState<Question>(firstQuestion);
  const [answerText, setAnswerText] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      setError("Please enter your answer");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion._id,
          answerText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save answer");
      } else {
        setAnswerText("");
        if (data.completed) {
          setCompleted(true);
          setCurrentQuestion(null as any);
        } else if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
        }
      }
    } catch {
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div>
        <h2>Interview Completed!</h2>
        <p>Thank you for your answers.</p>
        <button onClick={onExit}>New Session</button>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "1rem auto" }}>
      <h2>Interview Session</h2>
      <p>
        Question of {totalQuestions}
      </p>

      <p>
        <strong>Q: </strong>
        {currentQuestion.questionText}
      </p>

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

      <button style={{ marginTop: 16 }} onClick={onExit}>
        Exit Session
      </button>
    </div>
  );
}
