"use client";

import { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";
import avatarAnimation from "../../../public/avatar.json";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { saveQuizToFirestore, subscribeToQuizzes, deleteQuizFromFirestore } from "../../lib/firestoreUtils";

function QuizPanel({ quizData, onClose, speakText, isTalking, voiceEnabled, timerSetting, reviewMode }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(reviewMode ? quizData.userAnswers[0] : null);
  const [answered, setAnswered] = useState(reviewMode ? true : false);
  const [score, setScore] = useState(reviewMode ? quizData.score : 0);
  const [finished, setFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState(reviewMode ? quizData.userAnswers : []);
  const [hasSaved, setHasSaved] = useState(false);

  const initialTime = timerSetting === "none" ? null : parseInt(timerSetting) * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (reviewMode || timeLeft === null || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      if (voiceEnabled) speakText("Time is up! Let's see your results.");
      if (!hasSaved) {
        saveQuizToFirestore(crypto.randomUUID(), quizData, score, userAnswers);
        setHasSaved(true);
      }
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, finished, voiceEnabled, reviewMode, hasSaved, quizData, score, userAnswers]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const questions = quizData.questions;
  const q = questions[currentQ];

  // Auto-speak the question when it is loaded
  useEffect(() => {
    if (q && voiceEnabled && !reviewMode) {
      speakText(`Question ${currentQ + 1}: ${q.question}`);
    }
  }, [currentQ, voiceEnabled, reviewMode]);

  const handleSelect = (idx) => {
    if (answered || reviewMode) return;
    setSelected(idx);
    setAnswered(true);
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQ] = idx;
    setUserAnswers(newAnswers);
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
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      if (reviewMode) {
        setSelected(userAnswers[nextQ]);
        setAnswered(true);
      } else {
        setSelected(null);
        setAnswered(false);
      }
    } else {
      if (reviewMode) {
        onClose();
        return;
      }
      setFinished(true);
      if (!hasSaved) {
        saveQuizToFirestore(crypto.randomUUID(), quizData, score, userAnswers);
        setHasSaved(true);
      }
      const percent = Math.round((score / questions.length) * 100);
      if (voiceEnabled) {
        speakText(`Quiz complete! You scored ${score} out of ${questions.length}. That is ${percent} percent.`);
      }
    }
  };

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    let emoji = <i className="fa-solid fa-trophy text-yellow-500"></i>;
    let message = "Excellent work! You've mastered this chapter.";
    if (percent < 40) {
      emoji = <i className="fa-solid fa-book-open text-blue-500"></i>;
      message = "Keep studying, you'll get there! Practice makes perfect.";
    } else if (percent < 70) {
      emoji = <i className="fa-solid fa-thumbs-up text-green-500"></i>;
      message = "Good effort! Let's review the tricky ones and try again.";
    } else if (percent < 100) {
      emoji = <i className="fa-solid fa-star text-yellow-400"></i>;
      message = "Great job! Almost perfect.";
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-[#0b1c30]/10 flex flex-col gap-6 shadow-sm">
        <div className="quiz-results">
          <div className="quiz-results-emoji">{emoji}</div>
          <h2 className="text-xl font-bold text-[#0b1c30]">Quiz Complete!</h2>
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
    <div className="bg-white p-6 rounded-2xl border border-[#0b1c30]/10 flex flex-col gap-6 shadow-sm">
      <div className="quiz-header flex justify-between items-center">
        <div>
          <span className="quiz-topic text-lg font-bold text-[#0b1c30]">{quizData.topic}</span>
          <span className="quiz-progress text-xs font-semibold px-3 py-1 bg-[#0b1c30]/5 rounded-full ml-3">
            Question {currentQ + 1} of {questions.length}
          </span>
        </div>
        {timeLeft !== null && !finished && (
          <div className={`quiz-timer text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white border border-[#0b1c30]/10 text-[#0b1c30]'}`}>
            <i className="fa-regular fa-clock"></i> {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-question flex justify-between items-start gap-4">
        <span className="flex-1 font-semibold text-base md:text-lg text-[#0b1c30]">{q.question}</span>
        <button
          className="btn-secondary cursor-pointer"
          onClick={() => speakText(`Question ${currentQ + 1}: ${q.question}`)}
          style={{ padding: "6px 12px", fontSize: "0.85rem", borderRadius: "15px", flexShrink: 0 }}
        >
          <i className="fa-solid fa-volume-high"></i> Speak
        </button>
      </div>

      {q.image && (
        <div className="quiz-question-image rounded-2xl overflow-hidden border border-[#0b1c30]/10 shadow-sm max-w-2xl bg-white relative mt-2 mb-4">
          <a href={q.image} target="_blank" rel="noopener noreferrer" className="block w-full">
            <img src={q.image} alt="Question Visual Context" className="w-full h-auto object-contain max-h-80 bg-[#0b1c30]/5 transition-transform duration-300 hover:scale-[1.01]" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 hover:opacity-100 transition-opacity flex justify-between items-center pointer-events-none">
               <p className="text-xs text-white font-medium flex items-center gap-2"><i className="fa-brands fa-wikipedia-w"></i> Wikipedia Context</p>
            </div>
          </a>
        </div>
      )}

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
                  <span className="quiz-option-badge"><i className="fa-solid fa-circle-check text-green-500"></i></span>
                )}
                {answered && idx === selected && idx !== q.answer && (
                  <span className="quiz-option-badge"><i className="fa-solid fa-circle-xmark text-red-500"></i></span>
                )}
              </div>
              {answered && idx === q.answer && q.explanation && (
                <div className="quiz-option-explanation text-xs md:text-sm">
                  <i className="fa-solid fa-lightbulb text-yellow-500 mr-1.5"></i> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answered && (
        <button className="btn-primary quiz-next-btn cursor-pointer self-end flex items-center gap-2" onClick={handleNext}>
          {currentQ < questions.length - 1 ? "Next Question →" : (reviewMode ? <><i className="fa-solid fa-check"></i> Finish Review</> : <><i className="fa-solid fa-trophy"></i> See Results</>)}
        </button>
      )}
    </div>
  );
}

export default function Quiz() {
  const [instructions, setInstructions] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [language, setLanguage] = useState("English");
  const [timer, setTimer] = useState("none");
  const [quizData, setQuizData] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [pastQuizzes, setPastQuizzes] = useState([]);

  const [isTalking, setIsTalking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [questsLoading, setQuestsLoading] = useState(false);
  const [questsList, setQuestsList] = useState([]);

  const currentAudioRef = useRef(null);
  const recognitionRef = useRef(null);
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

  // Subscribe to past quizzes
  useEffect(() => {
    const unsubscribe = subscribeToQuizzes((quizzes) => {
      setPastQuizzes(quizzes);
    });
    return () => unsubscribe();
  }, []);

  // Load chat context if navigating from Tutor page
  useEffect(() => {
    const context = localStorage.getItem("quizContext");
    if (context) {
      setInstructions(context);
      localStorage.removeItem("quizContext");
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setListening(false);
        setInstructions((prev) => prev + (prev ? " " : "") + speechResult);
      };

      recognition.onspeechend = () => {
        recognition.stop();
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (recognitionRef.current) {
      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
        setListening(true);
        recognitionRef.current.start();
      }
    } else {
      alert("Sorry, your browser does not support speech recognition. Please use Chrome.");
    }
  };

  const speakText = async (text) => {
    if (!voiceEnabled) return;
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();

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
      
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      currentAudioRef.current = audio;

      audio.onplay = () => setIsTalking(true);
      audio.onpause = () => setIsTalking(false);
      audio.onended = () => setIsTalking(false);

      audio.play().catch(e => {
        if (e.name !== 'AbortError') console.error("Audio playback error:", e);
      });
    } catch (err) {
      console.error("TTS error:", err);
      // Fallback to browser TTS
      window.speechSynthesis.cancel();
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
          numQuestions: Number(numQuestions),
          language: language
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

  const handleGenerateQuests = async () => {
    let context = "General knowledge";
    if (quizData && quizData.topic) {
      context = "The student just completed a quiz on: " + quizData.topic;
    } else if (instructions) {
      context = "The student is about to take a quiz on: " + instructions;
    } else {
      const stored = localStorage.getItem("quizContext");
      if (stored) context = "The student was learning about: " + stored;
    }

    setShowQuestsModal(true);
    setQuestsLoading(true);

    try {
      const response = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context })
      });
      if (response.ok) {
        const data = await response.json();
        setQuestsList(data.quests || []);
      } else {
        console.error("Failed to fetch quests");
        setQuestsList([]);
      }
    } catch (e) {
      console.error(e);
      setQuestsList([]);
    } finally {
      setQuestsLoading(false);
    }
  };

  const handleCloseQuiz = () => {
    setQuizData(null);
    setReviewMode(false);
    setInstructions("");
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setIsTalking(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4ee] text-[#0b1c30]">
      <Navbar isTalking={isTalking} mobileLottieRef={mobileLottieRef} />

      <main className="flex-1 flex flex-col md:flex-row w-full relative pb-20 md:pb-0">
        <Sidebar handleGenerateQuests={handleGenerateQuests} />
        
        {/* Secondary Sidebar Drawer for Quiz Controls */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-60px)] py-6 px-4 bg-[#0b1c30]/5 backdrop-blur-sm w-[350px] border-r border-[#0b1c30]/10 justify-start">
          <div className="flex flex-col gap-6">
            {/* AI Tutor Avatar Window */}
            <div className="flex flex-col items-center bg-[#0b1c30]/5 rounded-2xl p-4 border border-[#0b1c30]/10 text-center">
              <div className="w-[400px] h-[400px] flex items-center justify-center">
                <Lottie
                  lottieRef={lottieRef}
                  animationData={avatarAnimation}
                  loop={true}
                  autoplay={false}
                  style={{ width: 480, height: 480 }}
                />
              </div>
              <div className="text-sm font-bold mt-2 text-[#0b1c30] flex items-center gap-2 justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${isTalking ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
                {isTalking ? "Speaking..." : "Ready"}
              </div>
            </div>

            {/* Side Navigation */}
            <nav className="flex flex-col gap-2">
              {/* Tutor Voice Toggle */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#0b1c30]/5 rounded-xl border border-[#0b1c30]/10">
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
                  className="cursor-pointer w-4 h-4 rounded text-[#424754] focus:ring-[#424754]"
                />
                <label htmlFor="voiceToggle" className="text-sm font-semibold cursor-pointer text-[#0b1c30]/70">
                  Enable Tutor Voice
                </label>
              </div>

              <div className="h-px bg-[#0b1c30]/10 my-2"></div>
              
              <button 
                onClick={handleCloseQuiz}
                className="flex items-center gap-3 px-4 py-3 text-[#0b1c30]/70 hover:bg-red-500/10 hover:text-red-600 transition-all rounded-xl group w-full text-left cursor-pointer"
              >
                <i className="fa-solid fa-rotate-right text-gray-500 group-hover:text-red-600 w-5 text-center"></i>
                <span className="text-sm font-medium">Reset Quiz</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Blackboard area / main quiz panel */}
        <section className="flex-1 flex flex-col p-6 h-[calc(100vh-60px)] md:h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl w-full mx-auto flex flex-col gap-6 px-8">
            <div className="header text-left">
              <h1 className="text-2xl font-bold text-[#0b1c30]">Practice Quiz</h1>
              <p className="text-sm text-gray-500">Interactive quizzes tailored for Haryana Board students</p>
            </div>

            {quizData ? (
              <QuizPanel
                quizData={quizData}
                onClose={handleCloseQuiz}
                speakText={speakText}
                isTalking={isTalking}
                voiceEnabled={voiceEnabled}
                timerSetting={timer}
                reviewMode={reviewMode}
              />
            ) : (
              <div className="flex flex-col gap-8">
                <div className="bg-white p-6 rounded-2xl border border-[#0b1c30]/10 flex flex-col gap-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#0b1c30] border-b border-gray-100 pb-3 flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-[#424754]"></i> Configure Practice Quiz
                  </h2>
                <p className="text-sm text-gray-600">
                  Tell CDF Guru exactly what subject, topic, or specific textbook chapter you want to practice.
                </p>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#0b1c30]">
                    What should this quiz test you on?
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full p-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:border-[#0b1c30] focus:ring-2 focus:ring-[#0b1c30]/5 text-sm text-[#0b1c30] outline-none transition-all resize-y min-h-[100px]"
                      placeholder="e.g. Chapter 3 of Haryana Board Class 10 Science (Metals and Non-metals), or 8th grade history lesson on Independence."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={handleMicClick}
                      disabled={loading}
                      className={`absolute right-3 bottom-3 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                        listening
                          ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      <i className={`fa-solid ${listening ? "fa-stop" : "fa-microphone"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                  <div className="flex flex-col gap-2 w-full md:w-1/3">
                    <label className="text-sm font-semibold text-[#0b1c30]">Language</label>
                    <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#0b1c30] cursor-pointer outline-none focus:border-[#0b1c30]" value={language} onChange={(e) => setLanguage(e.target.value)} disabled={loading}>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Hinglish">Hinglish</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full md:w-1/3">
                    <label className="text-sm font-semibold text-[#0b1c30]">Time Limit</label>
                    <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#0b1c30] cursor-pointer outline-none focus:border-[#0b1c30]" value={timer} onChange={(e) => setTimer(e.target.value)} disabled={loading}>
                      <option value="none">No Timer</option>
                      <option value="5">5 Minutes</option>
                      <option value="10">10 Minutes</option>
                      <option value="15">15 Minutes</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-1/3">
                    <label className="text-sm font-semibold text-[#0b1c30]">
                      Number of Questions
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#0b1c30] cursor-pointer outline-none focus:border-[#0b1c30]"
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
                    className="w-full md:w-auto px-6 py-3.5 bg-[#424754] hover:bg-[#0b1c30] text-[#f47920] rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-t-transparent border-[#f47920] rounded-full animate-spin"></span>
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

              {/* Community Past Quizzes Gallery */}
              {pastQuizzes.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-[#0b1c30]/10 shadow-sm flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-[#0b1c30] border-b border-gray-100 pb-3 flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-[#424754]"></i> Community Past Quizzes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastQuizzes.map((pq) => {
                      const dateStr = pq.createdAt?.toDate ? pq.createdAt.toDate().toLocaleDateString() : "Recent";
                      return (
                        <div 
                          key={pq.id} 
                          onClick={() => {
                            setReviewMode(true);
                            setQuizData(pq);
                          }}
                          className="p-4 rounded-xl border border-gray-200 hover:border-[#f47920] hover:shadow-md transition-all cursor-pointer bg-gray-50 flex flex-col gap-2 group"
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-[#0b1c30] group-hover:text-[#f47920] transition-colors line-clamp-2 pr-2">{pq.topic}</h3>
                            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-lg flex-shrink-0">
                              {pq.score} / {pq.totalQuestions}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500 font-medium mt-1">
                            <div className="flex items-center gap-3">
                              <span><i className="fa-regular fa-calendar mr-1"></i> {dateStr}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuizFromFirestore(pq.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1 cursor-pointer"
                                title="Delete Quiz"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                            <span className="text-[#f47920]">Review <i className="fa-solid fa-arrow-right ml-1 opacity-0 group-hover:opacity-100 transition-opacity"></i></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </section>
      </main>

      {/* Daily Quests Modal */}
      {showQuestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-[#0b1c30]/10 flex justify-between items-center bg-[#f4f4ee]/20">
              <h2 className="text-xl font-bold text-[#0b1c30] flex items-center gap-2">
                <i className="fa-solid fa-award text-yellow-500"></i> Your Daily Quests
              </h2>
              <button 
                onClick={() => setShowQuestsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0b1c30]/10 text-[#0b1c30]/60 hover:text-[#0b1c30] transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              <p className="text-sm text-gray-600 mb-6 font-medium">
                Complete these personalized, offline activities after school to master what you learned today!
              </p>
              
              {questsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-10 h-10 border-4 border-[#f47920] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-gray-500 animate-pulse">Generating your custom quests...</p>
                </div>
              ) : questsList.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {questsList.map((quest, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-[#0b1c30]/10 shadow-sm flex gap-4 hover:shadow-md transition-shadow group">
                      <div className="w-12 h-12 rounded-xl bg-[#f4f4ee]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <i className={`fa-solid ${quest.icon || 'fa-star'} text-[#424754] text-xl`}></i>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[#0b1c30] text-base leading-tight">{quest.title}</h3>
                          <span className="text-xs font-bold text-[#424754] bg-[#f47920]/50 px-2.5 py-1 rounded-full whitespace-nowrap">
                            <i className="fa-regular fa-clock mr-1"></i> {quest.estimatedTime}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{quest.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">Failed to load quests. Please try again.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}