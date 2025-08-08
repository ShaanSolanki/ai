"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js (v13 app dir routing)

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

export default function SessionGenerator({ onSessionCreated }: SessionGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const difficultyOptions = [
    { label: "Easy", value: "easy" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Topic is required");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/interview/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          numberOfQuestions,
          difficulty,
          email: email.trim() || undefined,
          name: name.trim() || undefined,
        }),
      });

      const data: GenerateResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate session");
        return;
      }

      onSessionCreated(data.sessionId, data.question, data.totalQuestions);

      // Save first question data to localStorage (or use context)
      localStorage.setItem("interviewSessionId", data.sessionId);
      localStorage.setItem("firstQuestion", JSON.stringify(data.question));
      localStorage.setItem("totalQuestions", data.totalQuestions.toString());

      // Redirect to interview page with sessionId as query param
      router.push(`/interview?sessionId=${data.sessionId}`);
    } catch (err) {
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid gray", padding: 16, maxWidth: 500, margin: "1rem auto", borderRadius: 8 }}>
      <h2>Create New Interview Session</h2>

      <label style={{ display: "block", marginBottom: 8 }}>
        Topic:
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          style={{ marginLeft: 8, width: "70%" }}
          placeholder="e.g. JavaScript, Databases"
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Difficulty:
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ marginLeft: 8 }}>
          {difficultyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Number of Questions:
        <input
          type="number"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(Math.min(Math.max(Number(e.target.value), 1), 20))}
          min={1}
          max={20}
          style={{ marginLeft: 8, width: 60 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Email (optional):
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginLeft: 8, width: "70%" }}
          placeholder="Your email"
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Name (optional):
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginLeft: 8, width: "70%" }}
          placeholder="Your name"
        />
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleGenerate} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? "Generating..." : "Generate Session"}
      </button>
    </div>
  );
}
