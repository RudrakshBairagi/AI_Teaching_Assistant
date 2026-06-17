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
      <div className="bg-white p-6 rounded-2xl border border-[#1a1c18]/10 flex flex-col gap-6 shadow-sm">
        <div className="quiz-results">
          <div className="quiz-results-emoji">{emoji}</div>
          <h2 className="text-xl font-bold text-[#1a1c18]">Quiz Complete!</h2>
          <div className="quiz-score-big mt-2">{score} / {questions.length}</div>
          <div className="quiz-score-percent font-semibold">{percent}%</div>
          <p style={{ marginTop: 10, color: "var(--text-muted)" }}>{message}</p>
          <button className="btn-primary mt-6 cursor-pointer" onClick={onClose}>
            Try Another Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1a1c18]/10 flex flex-col gap-6 shadow-sm">
      <div className="quiz-header">
        <span className="quiz-topic text-lg font-bold text-[#1a1c18]">{quizData.topic}</span>
        <span className="quiz-progress text-xs font-semibold px-3 py-1 bg-[#1a1c18]/5 rounded-full">
          Question {currentQ + 1} of {questions.length}
        </span>
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-question flex justify-between items-start gap-4">
        <span className="flex-1 font-semibold text-base md:text-lg text-[#1a1c18]">{q.question}</span>
        <button
          className="btn-secondary cursor-pointer"
          onClick={() => speakText(`Question ${currentQ + 1}: ${q.question}`)}
          style={{ padding: "6px 12px", fontSize: "0.85rem", borderRadius: "15px", flexShrink: 0 }}
        >
          🔊 Speak
        </button>
      </div>

      <div className="quiz-options flex flex-col gap-3">
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
                <span className="quiz-option-text font-medium">{opt}</span>
                {answered && idx === q.answer && (
                  <span className="quiz-option-badge">✅</span>
                )}
                {answered && idx === selected && idx !== q.answer && (
                  <span className="quiz-option-badge">❌</span>
                )}
              </div>
              {answered && idx === q.answer && q.explanation && (
                <div className="quiz-option-explanation text-xs md:text-sm">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answered && (
        <button className="btn-primary quiz-next-btn cursor-pointer self-end" onClick={handleNext}>
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
  const mobileLottieRef = useRef(null);

  // Control Lottie animations
  useEffect(() => {
    if (lottieRef.current) {
      if (isTalking) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
    if (mobileLottieRef.current) {
      if (isTalking) {
        mobileLottieRef.current.play();
      } else {
        mobileLottieRef.current.pause();
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
    <div className="min-h-screen flex flex-col bg-[#dfd5bb] text-[#1a1c18]">
      <Navbar isTalking={isTalking} mobileLottieRef={mobileLottieRef} />

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full relative pb-20 md:pb-0">
        {/* Sidebar Drawer */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-60px)] py-6 px-4 bg-[#1a1c18]/5 backdrop-blur-sm w-80 border-r border-[#1a1c18]/10 justify-between">
          <div className="flex flex-col gap-6">
            {/* Student Profile Card */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#383a35]">
                <img
                  alt="Student profile picture"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLLV308CfVHdM4Tl4QiujlO8M_nEsuUcx381PJz3xZ3f5yZ5fAskIsPvUjB6bmkRv2h_J5dG7sYRYw3jQKic_4oS55H1GyKwd0pBXRDlpVE2HosX8byA_LkAiXMbYtPb5znDFwhgGeNJQYUuuHuubsHcRV4ijx1bopZmFP3aSB15bmhouliA5jKygE0YGIKoGeDA9w-OT38-YoIIO_cf0EHWfnLL-BX4Wc2S5KUENExDeGdmadh3_wTaFDf5pPGtRw0hWyFSFXsaM"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-[#1a1c18]">Alex Johnson</p>
                <p className="text-xs font-medium text-gray-500">Grade 10 • Gold League</p>
              </div>
            </div>

            {/* AI Tutor Avatar Window */}
            <div className="flex flex-col items-center bg-[#1a1c18]/5 rounded-2xl p-4 border border-[#1a1c18]/10 text-center">
              <div className="w-28 h-28 flex items-center justify-center">
                <Lottie
                  lottieRef={lottieRef}
                  animationData={avatarAnimation}
                  loop={true}
                  autoplay={false}
                  style={{ width: 110, height: 110 }}
                />
              </div>
              <div className="text-sm font-bold mt-2 text-[#1a1c18] flex items-center gap-2 justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${isTalking ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
                {isTalking ? "Speaking..." : "Ready"}
              </div>
            </div>

            {/* Side Navigation */}
            <nav className="flex flex-col gap-2">
              {/* Tutor Voice Toggle */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1c18]/5 rounded-xl border border-[#1a1c18]/10">
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
                  className="cursor-pointer w-4 h-4 rounded text-[#292b27] focus:ring-[#292b27]"
                />
                <label htmlFor="voiceToggle" className="text-sm font-semibold cursor-pointer text-[#1a1c18]/70">
                  Enable Tutor Voice
                </label>
              </div>

              <div className="h-px bg-[#1a1c18]/10 my-2"></div>
              
              <button 
                onClick={handleCloseQuiz}
                className="flex items-center gap-3 px-4 py-3 text-[#1a1c18]/70 hover:bg-red-500/10 hover:text-red-600 transition-all rounded-xl group w-full text-left cursor-pointer"
              >
                <i className="fa-solid fa-rotate-right text-gray-500 group-hover:text-red-600 w-5 text-center"></i>
                <span className="text-sm font-medium">Reset Quiz</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Blackboard area / main quiz panel */}
        <section className="flex-1 flex flex-col p-6 h-[calc(100vh-60px)] md:h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
            <div className="header text-left">
              <h1 className="text-2xl font-bold text-[#1a1c18]">Practice Quiz</h1>
              <p className="text-sm text-gray-500">Interactive quizzes tailored for Haryana Board students</p>
            </div>

            {quizData ? (
              <QuizPanel
                quizData={quizData}
                onClose={handleCloseQuiz}
                speakText={speakText}
                isTalking={isTalking}
                voiceEnabled={voiceEnabled}
              />
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-[#1a1c18]/10 flex flex-col gap-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#1a1c18] border-b border-gray-100 pb-3 flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-[#292b27]"></i> Configure Practice Quiz
                </h2>
                <p className="text-sm text-gray-600">
                  Tell CDF Guru exactly what subject, topic, or specific textbook chapter you want to practice.
                </p>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1a1c18]">
                    What should this quiz test you on?
                  </label>
                  <textarea
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#1a1c18] focus:ring-2 focus:ring-[#1a1c18]/5 text-sm text-[#1a1c18] outline-none transition-all resize-y min-h-[100px]"
                    placeholder="e.g. Chapter 3 of Haryana Board Class 10 Science (Metals and Non-metals), or 8th grade history lesson on Independence."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                  <div className="flex flex-col gap-2 w-full md:w-1/2">
                    <label className="text-sm font-semibold text-[#1a1c18]">
                      Number of Questions
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a1c18] cursor-pointer outline-none focus:border-[#1a1c18]"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
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
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-3.5 bg-[#292b27] hover:bg-[#1a1c18] text-[#d4ff33] rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-t-transparent border-[#d4ff33] rounded-full animate-spin"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Quiz <i className="fa-solid fa-rocket"></i>
                      </>
                    )}
                  </button>
                </div>

                {errorMsg && (
                  <div className="text-red-500 text-sm mt-2 flex items-center gap-1.5 font-medium">
                    <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}