"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

type Msg = { role: "user" | "assistant"; content: string; timestamp: string };

type WindowType = 'mycomputer' | 'mydocuments' | 'recyclebin' | 'network' | 'floppy' | 'help' | 'about' | 'settings';

interface OpenWindow {
  id: string;
  type: WindowType;
  title: string;
  isMinimized: boolean;
  zIndex: number;
}

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
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [showStartMenu, setShowStartMenu] = useState(false);
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

  function openWindow(type: WindowType) {
    const windowTitles = {
      mycomputer: 'My Computer',
      mydocuments: 'My Documents',
      recyclebin: 'Recycle Bin',
      network: 'Network Neighborhood',
      floppy: 'Floppy (A:)',
      help: 'Help Topics',
      about: 'About Windows 95 ChatBot',
      settings: 'System Settings'
    };

    const existingWindow = openWindows.find(w => w.type === type);
    if (existingWindow) {
      // Bring existing window to front
      setOpenWindows(prev => prev.map(w => 
        w.id === existingWindow.id 
          ? { ...w, isMinimized: false, zIndex: nextZIndex }
          : w
      ));
      setNextZIndex(prev => prev + 1);
      return;
    }

    const newWindow: OpenWindow = {
      id: `${type}-${Date.now()}`,
      type,
      title: windowTitles[type],
      isMinimized: false,
      zIndex: nextZIndex
    };

    setOpenWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
  }

  function closeWindow(windowId: string) {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
  }

  function minimizeWindow(windowId: string) {
    setOpenWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  }

  function restoreWindow(windowId: string) {
    setOpenWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, isMinimized: false, zIndex: nextZIndex }
        : w
    ));
    setNextZIndex(prev => prev + 1);
  }

  return (
    <div className="h-screen bg-win95-cyan p-2 flex flex-col">
      {/* Desktop Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`
        }}></div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 z-20 space-y-6">
        <DesktopIcon 
          icon="🖥️" 
          label="My Computer" 
          onDoubleClick={() => openWindow('mycomputer')}
        />
        <DesktopIcon 
          icon="🗂️" 
          label="My Documents" 
          onDoubleClick={() => openWindow('mydocuments')}
        />
        <DesktopIcon 
          icon="🗑️" 
          label="Recycle Bin" 
          onDoubleClick={() => openWindow('recyclebin')}
        />
        <DesktopIcon 
          icon="🌐" 
          label="Network" 
          onDoubleClick={() => openWindow('network')}
        />
        <DesktopIcon 
          icon="💾" 
          label="Floppy (A:)" 
          onDoubleClick={() => openWindow('floppy')}
        />
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
        <MenuBar onOpenWindow={openWindow} onClearChat={clearChat} />

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
                <button 
                  className="win95-button w-full text-xs py-1"
                  onClick={() => openWindow('help')}
                >
                  HELP
                </button>
                <button 
                  className="win95-button w-full text-xs py-1"
                  onClick={() => openWindow('about')}
                >
                  ABOUT
                </button>
                <button 
                  className="win95-button w-full text-xs py-1"
                  onClick={() => openWindow('settings')}
                >
                  SETTINGS
                </button>
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

      {/* Popup Windows */}
      {openWindows.map((window) => (
        !window.isMinimized && (
          <PopupWindow
            key={window.id}
            window={window}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
          />
        )
      ))}

      {/* Start Menu */}
      {showStartMenu && (
        <StartMenu 
          onClose={() => setShowStartMenu(false)}
          onOpenWindow={openWindow}
        />
      )}

      {/* Taskbar */}
      <div className="mt-2 bg-win95-gray border-t-2 border-win95-light-gray p-1 flex items-center gap-2">
        <button 
          className={clsx(
            "win95-button px-3 py-1 text-xs font-bold flex items-center gap-1",
            showStartMenu ? "shadow-win95-pressed" : ""
          )}
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <span className="text-sm">🪟</span>
          Start
        </button>
        
        {/* Open Windows in Taskbar */}
        <div className="flex gap-1 flex-1">
          {openWindows.map((window) => (
            <button
              key={window.id}
              className={clsx(
                "win95-button px-2 py-1 text-xs max-w-32 truncate",
                window.isMinimized ? "opacity-75" : ""
              )}
              onClick={() => window.isMinimized ? restoreWindow(window.id) : minimizeWindow(window.id)}
            >
              {window.title}
            </button>
          ))}
        </div>
        
        <div className="bg-win95-gray border border-win95-dark-gray px-2 py-1 text-xs">
          {currentTime}
        </div>
      </div>
    </div>
  );
}

// Desktop Icon Component
function DesktopIcon({ icon, label, onDoubleClick }: {
  icon: string;
  label: string;
  onDoubleClick: () => void;
}) {
  const [selected, setSelected] = useState(false);

  return (
    <div
      className={clsx(
        "flex flex-col items-center w-16 p-1 cursor-pointer rounded",
        selected ? "bg-win95-blue bg-opacity-30" : ""
      )}
      onClick={() => setSelected(!selected)}
      onDoubleClick={onDoubleClick}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className={clsx(
        "text-xs text-center leading-tight",
        selected ? "text-white" : "text-black"
      )}>
        {label}
      </div>
    </div>
  );
}

// Popup Window Component
function PopupWindow({ window, onClose, onMinimize }: {
  window: OpenWindow;
  onClose: () => void;
  onMinimize: () => void;
}) {
  return (
    <div
      className="absolute bg-win95-gray border-2 border-win95-dark-gray"
      style={{
        top: `${50 + (window.zIndex - 100) * 20}px`,
        left: `${100 + (window.zIndex - 100) * 20}px`,
        width: '400px',
        height: '300px',
        zIndex: window.zIndex,
        boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #ffffff'
      }}
    >
      {/* Title Bar */}
      <div className="win95-titlebar flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-xs">{getWindowIcon(window.type)}</span>
          <span className="text-xs">{window.title}</span>
        </div>
        <div className="flex gap-1">
          <button 
            className="bg-win95-gray text-black px-2 text-xs border border-win95-dark-gray hover:bg-win95-light-gray"
            onClick={onMinimize}
          >
            _
          </button>
          <button 
            className="bg-win95-gray text-black px-2 text-xs border border-win95-dark-gray hover:bg-win95-light-gray"
          >
            □
          </button>
          <button 
            className="bg-win95-gray text-black px-1 text-xs border border-win95-dark-gray hover:bg-win95-light-gray"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="p-4 h-full overflow-auto text-xs">
        <WindowContent type={window.type} />
      </div>
    </div>
  );
}

function getWindowIcon(type: WindowType): string {
  const icons = {
    mycomputer: '🖥️',
    mydocuments: '🗂️',
    recyclebin: '🗑️',
    network: '🌐',
    floppy: '💾',
    help: '❓',
    about: 'ℹ️',
    settings: '⚙️'
  };
  return icons[type];
}

function WindowContent({ type }: { type: WindowType }) {
  switch (type) {
    case 'mycomputer':
      return (
        <div>
          <h3 className="font-bold mb-2">My Computer</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>💾</span> <span>Floppy (A:)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💿</span> <span>CD-ROM (D:)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🖥️</span> <span>Hard Disk (C:)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌐</span> <span>Network Neighborhood</span>
            </div>
          </div>
        </div>
      );
    
    case 'mydocuments':
      return (
        <div>
          <h3 className="font-bold mb-2">My Documents</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>📄</span> <span>README.TXT</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📄</span> <span>CHATLOG.TXT</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📁</span> <span>Windows 95 Memories</span>
            </div>
          </div>
        </div>
      );
    
    case 'recyclebin':
      return (
        <div>
          <h3 className="font-bold mb-2">Recycle Bin</h3>
          <p className="text-gray-600">The Recycle Bin is empty.</p>
        </div>
      );
    
    case 'network':
      return (
        <div>
          <h3 className="font-bold mb-2">Network Neighborhood</h3>
          <p className="mb-2">Available network resources:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>🖥️</span> <span>WORKSTATION-01</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🖥️</span> <span>SERVER-MAIN</span>
            </div>
          </div>
        </div>
      );
    
    case 'floppy':
      return (
        <div>
          <h3 className="font-bold mb-2">Floppy (A:)</h3>
          <p className="text-gray-600">Please insert a disk into drive A:</p>
        </div>
      );
    
    case 'help':
      return (
        <div>
          <h3 className="font-bold mb-2">Windows 95 ChatBot Help</h3>
          <div className="space-y-2">
            <p><strong>Getting Started:</strong></p>
            <p>• Type your message in the chat box</p>
            <p>• Press Enter or click SEND</p>
            <p>• The bot responds in retro computer style</p>
            <p></p>
            <p><strong>Desktop:</strong></p>
            <p>• Double-click icons to open windows</p>
            <p>• Use taskbar to switch between windows</p>
            <p>• Click Start for more options</p>
          </div>
        </div>
      );
    
    case 'about':
      return (
        <div>
          <h3 className="font-bold mb-2">About Windows 95 ChatBot</h3>
          <div className="space-y-2">
            <p><strong>Windows 95 ChatBot LLM</strong></p>
            <p>Version 1.0</p>
            <p></p>
            <p>A nostalgic AI assistant that brings back the charm of 1990s computing with modern LLM capabilities.</p>
            <p></p>
            <p><strong>Features:</strong></p>
            <p>• Authentic Windows 95 interface</p>
            <p>• Retro AI personality</p>
            <p>• Real-time chat streaming</p>
            <p>• Interactive desktop experience</p>
          </div>
        </div>
      );
    
    case 'settings':
      return (
        <div>
          <h3 className="font-bold mb-2">System Settings</h3>
          <div className="space-y-3">
            <div>
              <p className="font-bold">Display:</p>
              <p>Resolution: 1024 x 768</p>
              <p>Colors: 256 (8-bit)</p>
            </div>
            <div>
              <p className="font-bold">System:</p>
              <p>OS: Windows 95 (Simulation)</p>
              <p>Memory: 16 MB RAM</p>
              <p>Processor: Intel 486DX</p>
            </div>
            <div>
              <p className="font-bold">ChatBot:</p>
              <p>Model: windows95llm</p>
              <p>Mode: Retro Computing</p>
            </div>
          </div>
        </div>
      );
    
    default:
      return <div>Window content not found.</div>;
  }
}

// Start Menu Component
function StartMenu({ onClose, onOpenWindow }: {
  onClose: () => void;
  onOpenWindow: (type: WindowType) => void;
}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    { 
      icon: '📁', 
      label: 'Programs', 
      hasSubmenu: true,
      submenu: [
        { icon: '💻', label: 'Accessories', hasSubmenu: true },
        { icon: '🎮', label: 'Games', hasSubmenu: true },
        { icon: '🖥️', label: 'MS-DOS Prompt', action: () => openDosPrompt() },
        { icon: '📝', label: 'Notepad', action: () => openNotepad() },
        { icon: '🎨', label: 'Paint', action: () => openPaint() },
        { icon: '🧮', label: 'Calculator', action: () => openCalculator() }
      ]
    },
    { icon: '🗂️', label: 'Documents', action: () => onOpenWindow('mydocuments') },
    { 
      icon: '⚙️', 
      label: 'Settings', 
      hasSubmenu: true,
      submenu: [
        { icon: '🖥️', label: 'Control Panel', action: () => onOpenWindow('settings') },
        { icon: '🖨️', label: 'Printers', action: () => {} },
        { icon: '📋', label: 'Taskbar...', action: () => {} },
        { icon: '📁', label: 'Folder Options...', action: () => {} }
      ]
    },
    { 
      icon: '🔍', 
      label: 'Find', 
      hasSubmenu: true,
      submenu: [
        { icon: '📄', label: 'Files or Folders...', action: () => {} },
        { icon: '🖥️', label: 'Computer...', action: () => {} },
        { icon: '🌐', label: 'On the Internet...', action: () => {} }
      ]
    },
    { icon: '❓', label: 'Help', action: () => onOpenWindow('help') },
    { icon: '🏃', label: 'Run...', action: () => openRunDialog() },
    { type: 'separator' },
    { icon: '🔒', label: 'Shut Down...', action: () => openShutdownDialog() }
  ];

  function openDosPrompt() {
    onOpenWindow('mydocuments'); // Placeholder
    onClose();
  }

  function openNotepad() {
    onOpenWindow('mydocuments'); // Placeholder
    onClose();
  }

  function openPaint() {
    onOpenWindow('mydocuments'); // Placeholder
    onClose();
  }

  function openCalculator() {
    onOpenWindow('settings'); // Placeholder
    onClose();
  }

  function openRunDialog() {
    onOpenWindow('help'); // Placeholder
    onClose();
  }

  function openShutdownDialog() {
    onClose();
  }

  return (
    <>
      {/* Overlay to catch clicks outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Start Menu */}
      <div 
        className="absolute bottom-12 left-1 bg-win95-gray border-2 border-win95-dark-gray z-50"
        style={{
          width: '200px',
          boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #ffffff'
        }}
      >
        {/* Start Menu Header */}
        <div className="bg-gradient-to-r from-win95-dark-blue to-win95-blue text-white p-2 text-xs font-bold flex items-center gap-2">
          <span className="text-lg">🪟</span>
          <span>Windows 95</span>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {menuItems.map((item, index) => (
            <div key={index} className="relative">
              {item.type === 'separator' ? (
                <div className="h-px bg-win95-dark-gray mx-2 my-1" />
              ) : (
                <>
                  <button
                    className={clsx(
                      "w-full text-left px-3 py-1 text-xs flex items-center gap-2",
                      hoveredItem === item.label ? "bg-win95-blue text-white" : "hover:bg-win95-blue hover:text-white"
                    )}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                        onClose();
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.hasSubmenu && <span>▶</span>}
                  </button>

                  {/* Submenu */}
                  {item.hasSubmenu && hoveredItem === item.label && item.submenu && (
                    <div 
                      className="absolute left-full top-0 bg-win95-gray border-2 border-win95-dark-gray z-60"
                      style={{
                        width: '180px',
                        boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #ffffff'
                      }}
                    >
                      <div className="py-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className="w-full text-left px-3 py-1 text-xs hover:bg-win95-blue hover:text-white flex items-center gap-2"
                            onClick={() => {
                              if (subItem.action) {
                                subItem.action();
                                onClose();
                              }
                            }}
                          >
                            <span>{subItem.icon}</span>
                            <span className="flex-1">{subItem.label}</span>
                            {subItem.hasSubmenu && <span>▶</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Menu Bar Component
function MenuBar({ onOpenWindow, onClearChat }: {
  onOpenWindow: (type: WindowType) => void;
  onClearChat: () => void;
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems = {
    File: [
      { label: 'New Chat', action: onClearChat },
      { label: 'Open...', action: () => {} },
      { label: 'Save Chat...', action: () => {} },
      { type: 'separator' },
      { label: 'Print...', action: () => {} },
      { type: 'separator' },
      { label: 'Exit', action: () => {} }
    ],
    Edit: [
      { label: 'Undo', action: () => {} },
      { label: 'Redo', action: () => {} },
      { type: 'separator' },
      { label: 'Cut', action: () => {} },
      { label: 'Copy', action: () => {} },
      { label: 'Paste', action: () => {} },
      { type: 'separator' },
      { label: 'Select All', action: () => {} },
      { label: 'Find...', action: () => {} }
    ],
    View: [
      { label: 'Toolbar', action: () => {} },
      { label: 'Status Bar', action: () => {} },
      { type: 'separator' },
      { label: 'Refresh', action: () => {} },
      { label: 'Full Screen', action: () => {} }
    ],
    Help: [
      { label: 'Help Topics', action: () => onOpenWindow('help') },
      { label: 'About Windows 95 ChatBot', action: () => onOpenWindow('about') }
    ]
  };

  return (
    <div className="win95-menubar relative">
      {Object.entries(menuItems).map(([menuName, items]) => (
        <div key={menuName} className="relative inline-block">
          <span
            className={clsx(
              "px-2 py-1 cursor-pointer text-xs",
              activeMenu === menuName ? "bg-win95-blue text-white" : "hover:bg-win95-blue hover:text-white"
            )}
            onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
          >
            {menuName}
          </span>

          {/* Dropdown Menu */}
          {activeMenu === menuName && (
            <>
              {/* Overlay to catch clicks outside */}
              <div 
                className="fixed inset-0 z-30"
                onClick={() => setActiveMenu(null)}
              />
              
              <div 
                className="absolute top-full left-0 bg-win95-gray border-2 border-win95-dark-gray z-40"
                style={{
                  minWidth: '150px',
                  boxShadow: 'inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #ffffff'
                }}
              >
                <div className="py-1">
                  {items.map((item, index) => (
                    <div key={index}>
                      {item.type === 'separator' ? (
                        <div className="h-px bg-win95-dark-gray mx-2 my-1" />
                      ) : (
                        <button
                          className="w-full text-left px-3 py-1 text-xs hover:bg-win95-blue hover:text-white"
                          onClick={() => {
                            if (item.action) {
                              item.action();
                              setActiveMenu(null);
                            }
                          }}
                        >
                          {item.label}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
