"use client";

import { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";
import avatarAnimation from "../../../public/avatar.json";
import Navbar from "../../components/Navbar";

function QuizPanel({ quizData, onClose, speakText, isTalking, voiceEnabled }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = quizData.questions;
  const q = questions[currentQ];

  // Auto-speak the question when it is loaded
  useEffect(() => {
    if (q && voiceEnabled) {
      speakText(`Question ${currentQ + 1}: ${q.question}`);
    }
  }, [currentQ, voiceEnabled]);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    let newScore = score;
    if (idx === q.answer) {
      newScore = score + 1;
      setScore(newScore);
      if (voiceEnabled) {
        speakText("Correct answer! " + (q.explanation || ""));
      }
    } else {
      if (voiceEnabled) {
        speakText("That is incorrect. The correct answer is option " + String.fromCharCode(65 + q.answer) + ". " + (q.explanation || ""));
      }
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      const percent = Math.round((score / questions.length) * 100);
      if (voiceEnabled) {
        speakText(`Quiz complete! You scored ${score} out of ${questions.length}. That is ${percent} percent.`);
      }
    }
  };

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    let emoji = "🎉";
    let message = "Excellent work! You've mastered this chapter.";
    if (percent < 40) {
      emoji = "📚";
      message = "Keep studying, you'll get there! Practice makes perfect.";
    } else if (percent < 70) {
      emoji = "👍";
      message = "Good effort! Let's review the tricky ones and try again.";
    } else if (percent < 100) {
      emoji = "🌟";
      message = "Great job! Almost perfect.";
    }

    return (
      <div className="quiz-panel">
        <div className="quiz-results">
          <div className="quiz-results-emoji">{emoji}</div>
          <h2>Quiz Complete!</h2>
          <div className="quiz-score-big">{score} / {questions.length}</div>
          <div className="quiz-score-percent">{percent}%</div>
          <p style={{ marginTop: 10, color: "var(--text-muted)" }}>{message}</p>
          <button className="btn-primary" onClick={onClose} style={{ marginTop: 20, alignSelf: "center" }}>
            Try Another Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-panel">
      <div className="quiz-header">
        <span className="quiz-topic">{quizData.topic}</span>
        <span className="quiz-progress">
          Question {currentQ + 1} of {questions.length}
        </span>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-question" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15 }}>
        <span style={{ flex: 1 }}>{q.question}</span>
        <button
          className="btn-secondary"
          onClick={() => speakText(`Question ${currentQ + 1}: ${q.question}`)}
          style={{ padding: "6px 12px", fontSize: "0.85rem", borderRadius: "15px", flexShrink: 0 }}
        >
          🔊 Speak
        </button>
      </div>

      <div className="quiz-options">
        {q.options.map((opt, idx) => {
          let optClass = "quiz-option";
          if (answered) {
            if (idx === q.answer) optClass += " correct";
            else if (idx === selected) optClass += " wrong";
            else optClass += " dimmed";
          }
          return (
            <div key={idx} className={optClass} onClick={() => handleSelect(idx)}>
              <div className="quiz-option-row">
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="quiz-option-text">{opt}</span>
                {answered && idx === q.answer && (
                  <span className="quiz-option-badge">✅</span>
                )}
                {answered && idx === selected && idx !== q.answer && (
                  <span className="quiz-option-badge">❌</span>
                )}
              </div>
              {answered && idx === q.answer && q.explanation && (
                <div className="quiz-option-explanation">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answered && (
        <button className="btn-primary quiz-next-btn" onClick={handleNext}>
          {currentQ < questions.length - 1 ? "Next Question →" : "See Results 🏆"}
        </button>
      )}
    </div>
  );
}

export default function Quiz() {
  const [instructions, setInstructions] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isTalking, setIsTalking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const currentAudioRef = useRef(null);
  const lottieRef = useRef(null);

  // Control Lottie animation
  useEffect(() => {
    if (lottieRef.current) {
      if (isTalking) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isTalking]);

  const speakText = async (text) => {
    if (!voiceEnabled) return;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text })
      });

      if (!response.ok) throw new Error("TTS failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => setIsTalking(true);
      audio.onpause = () => setIsTalking(false);
      audio.onended = () => setIsTalking(false);

      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsTalking(true);
      utterance.onend = () => setIsTalking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleGenerateQuiz = async () => {
    const promptText = instructions.trim();
    if (!promptText) {
      setErrorMsg("Please tell CDF Guru what you want to be tested on!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setQuizData(null);
    setIsTalking(false);

    if (voiceEnabled) {
      speakText("Generating your quiz now! Let me prepare the questions.");
    }

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          numQuestions: Number(numQuestions)
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      setQuizData(data);
      if (voiceEnabled) {
        speakText(`Your quiz is ready on ${data.topic || "the requested topic"}! Let's get started.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while generating the quiz.");
      if (voiceEnabled) {
        speakText("I was unable to generate the quiz. Please check your network and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQuiz = () => {
    setQuizData(null);
    setInstructions("");
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setIsTalking(false);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>CDF Guru Practice</h1>
        <p>Interactive Quizzes tailored for Haryana Board Students</p>
      </div>

      <Navbar />

      <div className="main-layout">
        <div className="teacher-area">
          <div className={`avatar ${isTalking ? "talking" : "idle"}`}>
            <Lottie
              lottieRef={lottieRef}
              animationData={avatarAnimation}
              loop={true}
              autoplay={false}
              style={{ width: 200, height: 200 }}
            />
          </div>
          <div style={{ marginTop: "10px", color: "var(--accent)", fontWeight: "bold" }}>
            {isTalking ? "🔊 Speaking..." : "🤖 Ready"}
          </div>

          <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="voiceToggle"
              checked={voiceEnabled}
              onChange={(e) => {
                setVoiceEnabled(e.target.checked);
                if (!e.target.checked && currentAudioRef.current) {
                  currentAudioRef.current.pause();
                  setIsTalking(false);
                }
              }}
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
            />
            <label htmlFor="voiceToggle" style={{ fontSize: "0.9rem", cursor: "pointer", color: "var(--text-muted)" }}>
              Enable Tutor Voice
            </label>
          </div>
        </div>

        <div className="blackboard-area">
          {quizData ? (
            <QuizPanel
              quizData={quizData}
              onClose={handleCloseQuiz}
              speakText={speakText}
              isTalking={isTalking}
              voiceEnabled={voiceEnabled}
            />
          ) : (
            <div className="box" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div className="label">Configure Practice Quiz</div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "5px" }}>
                Tell the AI exactly what subject, topic, or specific textbook chapter you want to practice.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent)" }}>
                  What should this quiz test you on?
                </label>
                <textarea
                  className="input-field"
                  placeholder="e.g. Chapter 3 of Haryana Board Class 10 Science (Metals and Non-metals), or 8th grade history lesson on Independence."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{ minHeight: "100px", borderRadius: "16px", resize: "vertical" }}
                  disabled={loading}
                />
              </div>

              <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap", marginTop: "5px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "150px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent)" }}>
                    Number of Questions
                  </label>
                  <select
                    className="input-field"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    style={{ borderRadius: "30px", width: "100%" }}
                    disabled={loading}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={12}>12 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleGenerateQuiz}
                  disabled={loading}
                  style={{ alignSelf: "flex-end", padding: "15px 30px" }}
                >
                  {loading ? "Generating..." : "Generate Quiz 🚀"}
                </button>
              </div>

              {errorMsg && (
                <div style={{ color: "#ff7675", fontSize: "0.9rem", marginTop: "5px" }}>
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`loader ${loading ? "active" : ""}`}></div>
    </div>
  );
}