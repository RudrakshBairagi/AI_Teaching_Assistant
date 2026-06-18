"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Lottie from "lottie-react";
import avatarAnimation from "../../public/avatar.json";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { saveSessionToFirestore, getSessionById } from "../lib/firestoreUtils";

function HomeContent() {
  const { user } = useAuth();
  const { t, appLanguage } = useLanguage();
  const [sessionId, setSessionId] = useState(null);

  const [conversationHistory, setConversationHistory] = useState([
    {
      role: "assistant",
      content: "Namaste! I'm your AI Tutor. What are we exploring today? Whether it's a tricky math problem or a history mystery, I'm here to help!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
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
  const chatEndRef = useRef(null);
  const activeChatId = useRef(null);
  const handleSendRef = useRef(null);

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = async (event) => {
        const speechResult = event.results[0][0].transcript;
        setListening(false);
        if (handleSendRef.current) {
          handleSendRef.current(speechResult);
        }
      };

      recognition.onspeechend = () => {
        recognition.stop();
        setListening(false);
      };

      recognition.onerror = (event) => {
        setListening(false);
        console.error("Speech recognition error:", event.error);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Control both Lottie instances (desktop and mobile)
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

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationHistory, loading]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const searchParams = useSearchParams();
  const sid = searchParams.get("sessionId");

  // Initialize session or load from URL
  useEffect(() => {
    async function loadSession() {
      if (sid && user) {
        const data = await getSessionById(sid);
        if (data && data.conversationHistory) {
          setConversationHistory(data.conversationHistory);
          activeChatId.current = sid;
          setSessionId(sid);
        }
      } else if (!sid) {
        const newSid = crypto.randomUUID();
        setConversationHistory([{ role: "assistant", content: "Namaste! I'm your AI Tutor. What are we exploring today?" }]);
        activeChatId.current = newSid;
        setSessionId(newSid);
      }
    }
    loadSession();
  }, [user, sid]); // re-run if user logs in or sid changes

  // Save active session to localStorage so we can redirect back to it
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("lastActiveSessionId", sessionId);
    }
  }, [sessionId]);

  // Save conversation history to Firestore
  useEffect(() => {
    if (user && sessionId && activeChatId.current === sessionId && conversationHistory.length > 1) {
      saveSessionToFirestore(sessionId, conversationHistory);
    }
  }, [conversationHistory, user, sessionId]);

  const handleMicClick = () => {
    if (recognitionRef.current) {
      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
        setListening(true);
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          setIsTalking(false);
        }
        recognitionRef.current.start();
      }
    } else {
      alert("Sorry, your browser does not support speech recognition. Please use Chrome.");
    }
  };

  const handleSend = async (textToProcess) => {
    const text = typeof textToProcess === "string" ? textToProcess : inputValue.trim();
    if (!text) return;

    setInputValue("");
    setLoading(true);
    setIsTalking(false);

    // Add user message to history
    const updatedHistory = [...conversationHistory, { role: "user", content: text }];
    setConversationHistory(updatedHistory);

    try {
      const systemPrompt = `You are "EduMate AI" — an AI teaching assistant built by Connecting Dreams Foundation for students of the Haryana Board.
IDENTITY & ROLE:
- You are a patient, encouraging, and friendly teacher who makes learning fun.
- Use analogies that relate to everyday life in Haryana and India.

FORMAT RULES (STRICT):
1. Respond ONLY and EXCLUSIVELY in the following language: ${appLanguage}. (If Hinglish, use conversational Hindi written in English script).
2. Provide detailed, comprehensive explanations (around 150-300 words). Break down complex topics into easy-to-understand parts, using clear step-by-step logic.
3. Do NOT use markdown formatting (no **, no ##). Plain text only.
4. AT THE VERY END OF YOUR RESPONSE, you MUST include an image search keyword in this exact format: [IMAGE: keyword]. 
For example: 
"Photosynthesis is how plants make food using sunlight. [IMAGE: photosynthesis]"
"Mahatma Gandhi was a great leader of India. [IMAGE: Mahatma Gandhi]"
"Gravity pulls things down to Earth. [IMAGE: gravity]"
If no image makes sense, use a general relevant keyword.`;

      // Filter messages to API to exclude image fields to keep payload standard
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...updatedHistory.map(m => ({ role: m.role, content: m.content }))
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      let aiText = data.choices[0].message.content.trim();

      // Parse and remove [IMAGE: keyword]
      let keyword = null;
      const imageRegex = /\[IMAGE:\s*(.+?)\]/i;
      const match = aiText.match(imageRegex);
      if (match) {
        keyword = match[1].trim();
        aiText = aiText.replace(imageRegex, "").trim();
      }

      // Add assistant response to history
      const finalHistory = [...updatedHistory, { role: "assistant", content: aiText, image: null }];
      setConversationHistory(finalHistory);

      // Fetch Image from Wikipedia asynchronously
      if (keyword) {
        fetchWikipediaImage(keyword);
      }

      // Generate Voice
      if (voiceEnabled) {
        await speakText(aiText);
      }

    } catch (error) {
      console.error(error);
      setConversationHistory(prev => [
        ...prev,
        { role: "assistant", content: "Error reaching AI: " + error.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWikipediaImage = async (keyword) => {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.thumbnail && data.thumbnail.source) {
        setConversationHistory(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].role === "assistant") {
              updated[i].image = data.thumbnail.source;
              break;
            }
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Image fetch error:", error);
    }
  };

  const speakText = async (text) => {
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

      audio.onplay = () => {
        setIsTalking(true);
      };
      
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

  const clearChat = () => {
    setConversationHistory([
      {
        role: "assistant",
        content: "Chat cleared! What shall we learn today? Ask me anything!"
      }
    ]);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setIsTalking(false);
    
    // Create a new session instead of clearing the current one
    const newSessionId = crypto.randomUUID();
    activeChatId.current = newSessionId;
    setSessionId(newSessionId);
    
    // Clear URL if it had a sessionId
    window.history.pushState({}, '', '/');
  };

  const handleCreateQuiz = () => {
    let chatContext = conversationHistory
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => (m.role === "user" ? "Student asked: " : "Tutor taught: ") + m.content)
      .join("\n");
      
    if (!chatContext || chatContext.length < 10) {
      chatContext = "Generate a general knowledge quiz on what we just discussed.";
    } else {
      chatContext = "Create a quiz testing me on the concepts we just discussed:\n\n" + chatContext;
    }
    
    localStorage.setItem("quizContext", chatContext);
    window.location.href = "/quiz";
  };

  const handleGenerateQuests = async () => {
    let chatContext = conversationHistory
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => (m.role === "user" ? "Student asked: " : "Tutor taught: ") + m.content)
      .join("\n");
      
    if (!chatContext || chatContext.length < 10) {
      chatContext = "General knowledge and study habits.";
    }

    setShowQuestsModal(true);
    setQuestsLoading(true);

    try {
      const response = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: chatContext })
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

  const activeVisualAid = conversationHistory.slice().reverse().find(m => m.role === "assistant" && m.image)?.image || null;

  return (
    <div className="h-screen flex flex-col bg-theme-bg text-theme-text antialiased overflow-hidden">
      <Navbar isTalking={isTalking} mobileLottieRef={mobileLottieRef} />

      <main className="flex-1 flex flex-col md:flex-row w-full relative">
        <Sidebar 
          handleGenerateQuests={handleGenerateQuests} 
          clearChat={clearChat} 
          handleCreateQuiz={handleCreateQuiz} 
        />

        {/* Chat Canvas */}
        <section className="flex-1 flex flex-col relative h-[calc(100vh-60px)] md:h-[calc(100vh-60px)]">
          
          {/* AI Avatar Header (Desktop & Large screens) */}
          <div className={`hidden md:flex items-center py-4 border-b border-theme-border bg-theme-bg/80 backdrop-blur-md z-10 sticky top-0 shrink-0 transition-all duration-700 ease-in-out ${activeVisualAid ? 'justify-between px-16' : 'justify-center'}`}>
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center transition-all duration-700 ease-in-out">
              <div className="w-80 h-80 flex items-center justify-center overflow-hidden bg-theme-card rounded-full border border-theme-border shadow-sm transition-all duration-700">
                <Lottie
                  lottieRef={lottieRef}
                  animationData={avatarAnimation}
                  loop={true}
                  autoplay={false}
                  style={{ width: 400, height: 400 }}
                />
              </div>
              <p className="text-xs font-bold text-theme-text mt-2 tracking-wide uppercase transition-all duration-700">
                {isTalking ? "Speaking..." : "Ready to Help"}
              </p>
            </div>

            {/* Visual Aid Section */}
            <div className={`transition-all duration-700 ease-in-out flex-shrink-0 flex items-center justify-center ${activeVisualAid ? 'opacity-100 scale-100 translate-x-0 w-[400px] max-w-sm' : 'opacity-0 scale-90 translate-x-10 w-0 overflow-hidden'}`}>
              {activeVisualAid && (
                <div className="rounded-3xl overflow-hidden border border-theme-border shadow-lg bg-theme-card relative group w-full">
                  <a href={activeVisualAid} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    <img src={activeVisualAid} alt="Visual Aid" className="w-full h-auto object-contain max-h-72 bg-theme-sidebar/5 group-hover:scale-[1.02] transition-transform duration-500" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                       <p className="text-sm text-white font-medium flex items-center gap-2"><i className="fa-brands fa-wikipedia-w"></i> Wikipedia</p>
                       <i className="fa-solid fa-expand text-white text-sm"></i>
                    </div>
                  </a>
                </div>
              )}
            </div>

          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar flex flex-col gap-6" id="chat-container">
            {conversationHistory.map((message, idx) => {
              if (message.role === "assistant") {
                return (
                  <div key={idx} className="flex gap-3 max-w-[85%] md:max-w-[70%] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-10 h-10 rounded-xl bg-[#f47920] text-theme-bg flex-shrink-0 flex items-center justify-center shadow-sm">
                      <i className="fa-solid fa-robot"></i>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="bg-theme-card p-4 rounded-2xl shadow-sm border border-theme-border rounded-tl-none relative group">
                        <p className="text-sm text-theme-text leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        
                        <button 
                          onClick={() => speakText(message.content)}
                          className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-theme-card border border-theme-border text-theme-text/50 hover:text-[#f47920] shadow-sm flex items-center justify-center cursor-pointer"
                          title="Replay Audio"
                        >
                          <i className="fa-solid fa-volume-high text-xs"></i>
                        </button>
                      </div>
                      
                      {/* Visual aid moved to header */}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={idx} className="flex flex-row-reverse gap-3 max-w-[85%] md:max-w-[70%] self-end animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#121410] shadow-sm flex-shrink-0">
                      <img
                        alt="School Logo"
                        className="w-full h-full object-cover"
                        src="/school_logo.png"
                      />
                    </div>
                    <div className="bg-[#f47920] p-4 rounded-2xl shadow-sm rounded-tr-none">
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                );
              }
            })}

            {loading && (
              <div className="flex gap-3 max-w-[85%] md:max-w-[70%] animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-[#f47920] text-theme-bg flex-shrink-0 flex items-center justify-center shadow-sm">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <div className="bg-theme-card p-4 rounded-2xl shadow-sm border border-theme-border rounded-tl-none">
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Interaction Area */}
          <div className="bg-theme-bg/80 backdrop-blur-md px-4 py-4 border-t border-theme-border sticky bottom-0 z-40">
            {/* Quick Ask Chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar">
              {[
                "Explain photosynthesis",
                "Solve x² + 2x + 1 = 0",
                "History of Rome",
                "Periodic Table quiz"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="flex-shrink-0 px-4 py-1.5 bg-[#424754] hover:bg-[#727785] text-gray-200 rounded-full text-xs font-medium transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2 bg-theme-card p-1.5 rounded-full border border-theme-border focus-within:border-theme-border focus-within:ring-2 focus-within:ring-[#0b1c30]/5 transition-all shadow-inner">
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                className={`w-9 h-9 flex items-center justify-center transition-colors rounded-full cursor-pointer ${voiceEnabled ? 'text-[#f47920] hover:bg-theme-sidebar/10' : 'text-theme-text/40 hover:text-theme-text hover:bg-theme-sidebar/10'}`}
              >
                <i className={`fa-solid ${voiceEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
              </button>
              
              <button 
                onClick={clearChat}
                title="New Chat"
                className="w-9 h-9 flex items-center justify-center text-theme-text/60 hover:text-theme-text transition-colors rounded-full hover:bg-theme-sidebar/10 cursor-pointer"
              >
                <i className="fa-solid fa-rotate-right"></i>
              </button>
              
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-theme-text py-2 px-2 placeholder-gray-500 outline-none"
                placeholder={listening ? t("chat.voice.listening") : t("chat.placeholder")}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
              />
              
              <div className="flex items-center gap-1 pr-1">
                <button
                  onClick={handleMicClick}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    listening
                      ? "animate-pulse bg-danger/20 text-danger"
                      : "bg-[#424754] text-gray-400 hover:bg-[#727785] hover:text-white"
                  }`}
                  id="voice-btn"
                  disabled={loading}
                  title={listening ? "Stop Listening" : "Start Voice Input"}
                >
                  <i className="fa-solid fa-microphone"></i>
                </button>
                
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !inputValue.trim()}
                  className="w-9 h-9 rounded-full bg-[#f47920] text-theme-bg flex items-center justify-center shadow-md hover:bg-[#e06312] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Daily Quests Modal */}
      {showQuestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-sidebar/60 backdrop-blur-sm transition-opacity">
          <div className="bg-theme-card rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-bg/20">
              <h2 className="text-xl font-bold text-theme-text flex items-center gap-2">
                <i className="fa-solid fa-award text-yellow-500"></i> Your Daily Quests
              </h2>
              <button 
                onClick={() => setShowQuestsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-sidebar/10 text-theme-text/60 hover:text-theme-text transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-theme-card/50">
              <p className="text-sm text-theme-text-muted mb-6 font-medium">
                Complete these personalized, offline activities after school to master what you learned today!
              </p>
              
              {questsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-10 h-10 border-4 border-[#f47920] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-theme-text-muted animate-pulse">Generating your custom quests...</p>
                </div>
              ) : questsList.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {questsList.map((quest, idx) => (
                    <div key={idx} className="bg-theme-card p-5 rounded-2xl border border-theme-border shadow-sm flex gap-4 hover:shadow-md transition-shadow group">
                      <div className="w-12 h-12 rounded-xl bg-theme-bg/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <i className={`fa-solid ${quest.icon || 'fa-star'} text-[#424754] text-xl`}></i>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-theme-text text-base leading-tight">{quest.title}</h3>
                          <span className="text-xs font-bold text-[#424754] bg-[#f47920]/50 px-2.5 py-1 rounded-full whitespace-nowrap">
                            <i className="fa-regular fa-clock mr-1"></i> {quest.estimatedTime}
                          </span>
                        </div>
                        <p className="text-sm text-theme-text-muted leading-relaxed">{quest.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-theme-text-muted text-sm">Failed to load quests. Please try again.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-theme-bg">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
