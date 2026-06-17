"use client";

import { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";
import avatarAnimation from "../../public/avatar.json";
import Navbar from "../components/Navbar";

export default function Home() {
  const [conversationHistory, setConversationHistory] = useState([
    {
      role: "assistant",
      content: "Hello Alex! I'm your AI Tutor. What are we exploring today? Whether it's a tricky math problem or a history mystery, I'm here to help!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [listening, setListening] = useState(false);
  
  const currentAudioRef = useRef(null);
  const recognitionRef = useRef(null);
  const lottieRef = useRef(null);
  const mobileLottieRef = useRef(null);
  const chatEndRef = useRef(null);

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
        handleSend(speechResult);
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
      const systemPrompt = `You are "CDF Guru" — an AI teaching assistant built by Connecting Dreams Foundation for students of the Haryana Board.
IDENTITY & ROLE:
- You are a patient, encouraging, and friendly teacher who makes learning fun.
- Use analogies that relate to everyday life in Haryana and India.

FORMAT RULES (STRICT):
1. Respond in the same language the user uses (English, Hindi, or Hinglish).
2. Keep responses concise and clear (under 100 words).
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
      await speakText(aiText);

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

      audio.onplay = () => {
        setIsTalking(true);
      };
      
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

  const clearChat = () => {
    setConversationHistory([
      {
        role: "assistant",
        content: "Chat cleared! What shall we learn today, Alex? Ask me anything!"
      }
    ]);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsTalking(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#dfd5bb] text-[#1a1c18] antialiased overflow-hidden">
      <Navbar isTalking={isTalking} mobileLottieRef={mobileLottieRef} />

      <main className="flex-1 flex flex-col md:flex-row w-full relative">
        {/* Sidebar Drawer (Hidden on Mobile) */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-60px)] py-6 px-4 bg-[#1a1c18]/5 backdrop-blur-sm w-80 border-r border-[#1a1c18]/10">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#383a35]">
              <img
                alt="Student profile picture"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLLV308CfVHdM4Tl4QiujlO8M_nEsuUcx381PJz3xZ3f5yZ5fAskIsPvUjB6bmkRv2h_J5dG7sYRYw3jQKic_4oS55H1GyKwd0pBXRDlpVE2HosX8byA_LkAiXMbYtPb5znDFwhgGeNJQYUuuHuubsHcRV4ijx1bopZmFP3aSB15bmhouliA5jKygE0YGIKoGeDA9w-OT38-YoIIO_cf0EHWfnLL-BX4Wc2S5KUENExDeGdmadh3_wTaFDf5pPGtRw0hWyFSFXsaM"
              />
            </div>
            <div>
              <p className="text-base font-semibold text-[#1a1c18]">Alex Johnson</p>
              <p className="text-xs font-medium text-[#1a1c18]/60">Grade 10 • Gold League</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-3 text-[#1a1c18]/70 hover:bg-[#1a1c18]/10 hover:text-[#1a1c18] transition-all rounded-xl group cursor-pointer">
              <i className="fa-solid fa-award text-[#1a1c18]/60 group-hover:text-warning w-5 text-center"></i>
              <span className="text-sm font-medium">Daily Quests</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[#1a1c18]/70 hover:bg-[#1a1c18]/10 hover:text-[#1a1c18] transition-all rounded-xl group cursor-pointer">
              <i className="fa-solid fa-users text-[#1a1c18]/60 group-hover:text-success w-5 text-center"></i>
              <span className="text-sm font-medium">Study Groups</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[#1a1c18]/70 hover:bg-[#1a1c18]/10 hover:text-[#1a1c18] transition-all rounded-xl group cursor-pointer">
              <i className="fa-solid fa-medal text-[#1a1c18]/60 group-hover:text-warning w-5 text-center"></i>
              <span className="text-sm font-medium">Achievements</span>
            </button>
            <div className="h-px bg-[#383a35] my-4"></div>
            <button className="flex items-center gap-3 px-4 py-3 text-[#1a1c18]/70 hover:bg-[#1a1c18]/10 hover:text-[#1a1c18] transition-all rounded-xl group cursor-pointer">
              <i className="fa-solid fa-gear text-[#1a1c18]/60 group-hover:text-[#1a1c18] w-5 text-center"></i>
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[#1a1c18]/70 hover:bg-[#1a1c18]/10 hover:text-[#1a1c18] transition-all rounded-xl group cursor-pointer">
              <i className="fa-solid fa-circle-question text-[#1a1c18]/60 group-hover:text-[#1a1c18] w-5 text-center"></i>
              <span className="text-sm font-medium">Help</span>
            </button>
            <button 
              onClick={clearChat}
              className="flex items-center gap-3 px-4 py-3 text-[#1a1c18]/70 hover:bg-red-500/10 hover:text-red-500 transition-all rounded-xl group cursor-pointer"
            >
              <i className="fa-solid fa-rotate-right text-[#1a1c18]/60 group-hover:text-red-500 w-5 text-center"></i>
              <span className="text-sm font-medium">New Chat</span>
            </button>
          </nav>
        </aside>

        {/* Chat Canvas */}
        <section className="flex-1 flex flex-col relative h-[calc(100vh-60px)] md:h-[calc(100vh-60px)]">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar flex flex-col gap-6" id="chat-container">
            {conversationHistory.map((message, idx) => {
              if (message.role === "assistant") {
                return (
                  <div key={idx} className="flex gap-3 max-w-[85%] md:max-w-[70%] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-10 h-10 rounded-xl bg-[#d4ff33] text-[#121410] flex-shrink-0 flex items-center justify-center shadow-sm">
                      <i className="fa-solid fa-robot"></i>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#1a1c18]/10 rounded-tl-none">
                        <p className="text-sm text-[#1a1c18] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Wikipedia Visual Aid Card */}
                      {message.image && (
                        <div className="bg-[#1e201c] rounded-2xl p-3 shadow-card border border-[#292b27] flex items-center gap-3 hover:shadow-md hover:border-[#383a35] transition-all cursor-pointer group w-fit">
                          <div className="w-10 h-10 bg-[#d4ff33]/10 rounded-xl flex items-center justify-center text-[#d4ff33] overflow-hidden">
                            <img src={message.image} alt="Visual" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-[120px]">
                            <p className="text-sm font-semibold text-white">Visual Aid</p>
                            <p className="text-[10px] text-gray-400">Wikipedia image</p>
                          </div>
                          <a href={message.image} target="_blank" rel="noopener noreferrer" className="text-[#d4ff33]">
                            <i className="fa-solid fa-chevron-right text-gray-500 text-xs group-hover:translate-x-1 transition-transform pr-1"></i>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={idx} className="flex flex-row-reverse gap-3 max-w-[85%] md:max-w-[70%] self-end animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#121410] shadow-sm flex-shrink-0">
                      <img
                        alt="Student Profile"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLLV308CfVHdM4Tl4QiujlO8M_nEsuUcx381PJz3xZ3f5yZ5fAskIsPvUjB6bmkRv2h_J5dG7sYRYw3jQKic_4oS55H1GyKwd0pBXRDlpVE2HosX8byA_LkAiXMbYtPb5znDFwhgGeNJQYUuuHuubsHcRV4ijx1bopZmFP3aSB15bmhouliA5jKygE0YGIKoGeDA9w-OT38-YoIIO_cf0EHWfnLL-BX4Wc2S5KUENExDeGdmadh3_wTaFDf5pPGtRw0hWyFSFXsaM"
                      />
                    </div>
                    <div className="bg-[#1a1c18] p-4 rounded-2xl shadow-sm rounded-tr-none">
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                );
              }
            })}

            {loading && (
              <div className="flex gap-3 max-w-[85%] md:max-w-[70%] animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-[#d4ff33] text-[#121410] flex-shrink-0 flex items-center justify-center shadow-sm">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#1a1c18]/10 rounded-tl-none">
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
          <div className="bg-[#dfd5bb]/80 backdrop-blur-md px-4 py-4 border-t border-[#1a1c18]/10 sticky bottom-0 z-40">
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
                  className="flex-shrink-0 px-4 py-1.5 bg-[#292b27] hover:bg-[#383a35] text-gray-200 rounded-full text-xs font-medium transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-[#1a1c18]/10 focus-within:border-[#1a1c18] focus-within:ring-2 focus-within:ring-[#1a1c18]/5 transition-all shadow-inner">
              <button 
                onClick={clearChat}
                title="New Chat"
                className="w-9 h-9 flex items-center justify-center text-[#1a1c18]/60 hover:text-[#1a1c18] transition-colors rounded-full hover:bg-[#1a1c18]/10 cursor-pointer"
              >
                <i className="fa-solid fa-rotate-right"></i>
              </button>
              
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-[#1a1c18] py-2 px-2 placeholder-gray-500 outline-none"
                placeholder="Ask EduMate anything..."
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
                      : "bg-[#292b27] text-gray-400 hover:bg-[#383a35] hover:text-white"
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
                  className="w-9 h-9 rounded-full bg-[#d4ff33] text-[#121410] flex items-center justify-center shadow-md hover:bg-[#bde629] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
