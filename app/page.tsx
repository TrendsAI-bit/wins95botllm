"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

type Msg = { role: "user" | "assistant"; content: string; timestamp: string };

export default function HomePage() {
  const [history, setHistory] = useState<Msg[]>([
    { 
      role: "assistant", 
      content: "SYSTEM INITIALIZED...\nWINDOWS 95 CHATBOT v1.0 READY\n\nGREETINGS, USER. I AM YOUR DIGITAL ASSISTANT.\nHOW MAY I PROCESS YOUR REQUEST TODAY?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const endRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => { 
    endRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [history]);

  async function send() {
    if (!input.trim() || loading) return;
    
    const userMessage: Msg = { 
      role: "user", 
      content: input, 
      timestamp: new Date().toLocaleTimeString() 
    };
    const newHistory: Msg[] = [...history, userMessage];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory })
      });

      if (!res.ok || !res.body) {
        throw new Error('Network error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      
      // Add initial assistant message
      setHistory(h => [...h, { 
        role: "assistant", 
        content: "", 
        timestamp: new Date().toLocaleTimeString() 
      }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setHistory(h => {
          const copy = [...h];
          copy[copy.length - 1] = { 
            role: "assistant", 
            content: assistantText,
            timestamp: copy[copy.length - 1].timestamp
          };
          return copy;
        });
      }
    } catch (error) {
      setHistory(h => [...h, { 
        role: "assistant", 
        content: "ERROR: SYSTEM MALFUNCTION DETECTED.\nPLEASE RETRY YOUR REQUEST.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }

    setLoading(false);
  }

  function clearChat() {
    setHistory([{
      role: "assistant", 
      content: "CHAT HISTORY CLEARED.\nSYSTEM READY FOR NEW SESSION.",
      timestamp: new Date().toLocaleTimeString()
    }]);
  }

  return (
    <div className="h-screen bg-win95-cyan p-2 flex flex-col">
      {/* Desktop Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`
        }}></div>
      </div>

      {/* Main Window */}
      <div className="win95-window flex-1 flex flex-col relative z-10 max-w-4xl mx-auto w-full">
        {/* Title Bar */}
        <div className="win95-titlebar flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Bot" className="w-4 h-4" />
            <span>Windows 95 ChatBot - [Chat Session]</span>
          </div>
          <div className="flex gap-1">
            <button className="bg-win95-gray text-black px-2 text-xs border border-win95-dark-gray">_</button>
            <button className="bg-win95-gray text-black px-2 text-xs border border-win95-dark-gray">□</button>
            <button className="bg-win95-gray text-black px-1 text-xs border border-win95-dark-gray">×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="win95-menubar">
          <span className="px-2 py-1 hover:bg-win95-blue hover:text-white cursor-pointer text-xs">File</span>
          <span className="px-2 py-1 hover:bg-win95-blue hover:text-white cursor-pointer text-xs">Edit</span>
          <span className="px-2 py-1 hover:bg-win95-blue hover:text-white cursor-pointer text-xs">View</span>
          <span className="px-2 py-1 hover:bg-win95-blue hover:text-white cursor-pointer text-xs">Help</span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div 
              ref={chatRef}
              className="flex-1 p-2 overflow-y-auto bg-white border-2"
              style={{
                boxShadow: 'inset -1px -1px #dfdfdf, inset 1px 1px #0a0a0a, inset -2px -2px #ffffff, inset 2px 2px #808080'
              }}
            >
              {history.map((m, i) => (
                <div key={i} className={clsx("chat-message", m.role === "user" ? "user-message" : "bot-message")}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs">
                      {m.role === "user" ? "USER:" : "CHATBOT:"}
                    </span>
                    <span className="text-xs text-gray-600">{m.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-xs leading-relaxed font-mono">
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="bot-message chat-message">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs">CHATBOT:</span>
                    <span className="text-xs text-gray-600">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs font-mono">
                    PROCESSING<span className="typing-indicator">...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="p-2 bg-win95-gray border-t border-win95-dark-gray">
              <div className="flex gap-2">
                <input
                  className="win95-input flex-1 text-xs font-mono"
                  placeholder="Type your message here..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={(e) => { 
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  disabled={loading}
                />
                <button 
                  onClick={send} 
                  disabled={loading || !input.trim()}
                  className="win95-button text-xs min-w-[60px] disabled:opacity-50"
                >
                  {loading ? "..." : "SEND"}
                </button>
                <button 
                  onClick={clearChat}
                  className="win95-button text-xs min-w-[60px]"
                >
                  CLEAR
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-48 bg-win95-gray border-l border-win95-dark-gray p-2">
            <div className="win95-panel">
              <div className="text-xs font-bold mb-2">SYSTEM INFO</div>
              <div className="text-xs space-y-1">
                <div>Status: ONLINE</div>
                <div>Model: GPT-4</div>
                <div>Mode: RETRO</div>
                <div>Time: {currentTime}</div>
              </div>
            </div>

            <div className="win95-panel mt-2">
              <div className="text-xs font-bold mb-2">QUICK ACTIONS</div>
              <div className="space-y-1">
                <button className="win95-button w-full text-xs py-1">HELP</button>
                <button className="win95-button w-full text-xs py-1">ABOUT</button>
                <button className="win95-button w-full text-xs py-1">SETTINGS</button>
              </div>
            </div>

            <div className="win95-panel mt-2">
              <div className="text-xs font-bold mb-2">LOGO</div>
              <div className="flex justify-center">
                <img 
                  src="/logo.png" 
                  alt="ChatBot Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="win95-status-bar flex justify-between">
          <span>Ready</span>
          <div className="flex gap-4">
            <span>Messages: {history.length}</span>
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="mt-2 bg-win95-gray border-t-2 border-win95-light-gray p-1 flex items-center gap-2">
        <button className="win95-button px-3 py-1 text-xs font-bold flex items-center gap-1">
          <span className="text-sm">🪟</span>
          Start
        </button>
        <div className="flex-1"></div>
        <div className="bg-win95-gray border border-win95-dark-gray px-2 py-1 text-xs">
          {currentTime}
        </div>
      </div>
    </div>
  );
}
