"use client";

import { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";
import avatarAnimation from "../../public/avatar.json";

export default function Home() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("...");
  const [aiResponse, setAiResponse] = useState("...");
  const [imageUrl, setImageUrl] = useState("");
  const [isTalking, setIsTalking] = useState(false);
  const [listening, setListening] = useState(false);
  
  const currentAudioRef = useRef(null);
  const recognitionRef = useRef(null);
  const lottieRef = useRef(null);

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
        setTranscript(speechResult);
        setListening(false);
        handleSend(speechResult);
      };

      recognition.onspeechend = () => {
        recognition.stop();
        setListening(false);
      };

      recognition.onerror = (event) => {
        setListening(false);
        setTranscript("Error: " + event.error);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Control Lottie animation — play only when talking, pause when idle
  useEffect(() => {
    if (lottieRef.current) {
      if (isTalking) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isTalking]);

  const handleMicClick = () => {
    if (recognitionRef.current) {
      setListening(true);
      setTranscript("...");
      setAiResponse("...");
      setImageUrl("");
      recognitionRef.current.start();
    } else {
      alert("Sorry, your browser does not support speech recognition. Please use Chrome.");
    }
  };

  const handleSend = async (textToProcess) => {
    const text = typeof textToProcess === "string" ? textToProcess : inputValue.trim();
    if (!text) return;

    setTranscript(text);
    setInputValue("");
    setLoading(true);
    setAiResponse("...");
    setImageUrl("");
    setIsTalking(false);

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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: text }
          ]
        })
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

      setAiResponse(aiText);

      // Update History
      const newHistory = [...conversationHistory, { role: "user", content: text }, { role: "assistant", content: aiText }];
      if (newHistory.length > 20) newHistory.splice(0, newHistory.length - 20);
      setConversationHistory(newHistory);

      // Fetch Image from Wikipedia asynchronously
      if (keyword) {
        fetchWikipediaImage(keyword);
      }

      // Generate Voice
      await speakText(aiText);

    } catch (error) {
      console.error(error);
      setAiResponse("Error reaching AI: " + error.message);
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
        setImageUrl(data.thumbnail.source);
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
      setAiResponse(prev => prev + "\n\n🔊 Generating voice...");
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
        setAiResponse(text); // Remove "generating voice..."
        setIsTalking(true);
      };
      
      audio.onpause = () => setIsTalking(false);
      audio.onended = () => setIsTalking(false);
      
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setAiResponse(text);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsTalking(true);
      utterance.onend = () => setIsTalking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const replayAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current.play();
    }
  };

  const clearChat = () => {
    setConversationHistory([]);
    setTranscript("...");
    setAiResponse("Chat cleared! Ask me anything.");
    setImageUrl("");
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsTalking(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>CDF Guru</h1>
        <p>Your AI Teaching Assistant</p>
      </div>

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
        </div>

        <div className="blackboard-area">
          <div className="box">
            <div className="label">You said:</div>
            <div>{transcript}</div>
          </div>

          <div className="box">
            <div className="label">AI says:</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{aiResponse}</div>
            
            {imageUrl && (
              <img src={imageUrl} alt="Visual Aid" className="visual-aid" />
            )}

            {currentAudioRef.current && !loading && (
              <button className="btn-success" onClick={replayAudio}>
                🔊 Replay Audio
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`loader ${loading ? "active" : ""}`}></div>

      <div className="controls-container">
        <input 
          type="text" 
          className="input-field" 
          placeholder="Type your question..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="btn-primary" onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>

      <div className="controls-container">
        <button className="btn-secondary" onClick={handleMicClick} disabled={listening || loading}>
          {listening ? "🎤 Listening..." : "🎤 Use Microphone"}
        </button>
        <button className="btn-danger" onClick={clearChat}>
          🔄 New Chat
        </button>
      </div>
    </div>
  );
}
