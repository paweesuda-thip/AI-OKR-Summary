"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { nanoid } from "nanoid";

interface Message {
  id: string;
  from: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FloatingAiChatProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dashboardData?: any;
}

const suggestions = [
  "สรุปภาพรวม OKR ของทีมให้หน่อย",
  "มี Objective ไหนที่กำลังมีความเสี่ยงบ้าง?",
  "ใครคือ Top Performers ของทีมตอนนี้?",
  "ข้อเสนอแนะในการพัฒนาทีมมีอะไรบ้าง?",
];

// Inline SVG Icons
const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export function FloatingAiChat({ dashboardData }: FloatingAiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nanoid(),
      from: "assistant",
      content: "สวัสดีครับ ผมคือ Spartan AI Advisor ผู้ช่วย AI ของคุณ \nมีข้อมูลอะไรเกี่ยวกับผลการดำเนินงานของทีมที่คุณอยากให้ผมช่วยวิเคราะห์หรือสรุปให้ฟังไหมครับ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = useCallback(async (text: string = input) => {
    if (!text.trim() || !dashboardData) return;

    const userMessage: Message = {
      id: nanoid(),
      from: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          dashboardData
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: nanoid(),
        from: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const err = error as Error;
      const errorMessage: Message = {
        id: nanoid(),
        from: "assistant",
        content: `ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล: ${err.message || "ไม่สามารถติดต่อ AI ได้"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, dashboardData, messages]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const clearChat = () => {
    setMessages([
      {
        id: nanoid(),
        from: "assistant",
        content: "เริ่มการสนทนาใหม่แล้วครับ มีอะไรให้ผมช่วยวิเคราะห์เพิ่มเติมไหมครับ?",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-11 px-5 rounded-full bg-[#F7931A]/10 text-[#F7931A] font-mono font-semibold text-xs border border-[#F7931A]/20 hover:bg-[#F7931A]/15 hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.4)] transition-all z-50 flex items-center gap-2 backdrop-blur-md"
      >
        <SparkleIcon />
        Ask AI
      </button>
    );
  }

  return (
    <div 
      className={`fixed right-6 bottom-6 z-50 flex flex-col bg-[#0F1115]/90 backdrop-blur-2xl border border-white/[0.06] shadow-[0_8px_40px_rgb(0,0,0,0.4)] transition-all duration-300 overflow-hidden rounded-2xl ${
        isExpanded 
          ? "w-[800px] h-[80vh] sm:right-10 sm:bottom-10" 
          : "w-[380px] h-[560px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0F1115]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#F7931A]/10 p-1.5 rounded-lg border border-[#F7931A]/20">
            <SparkleIcon />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-white tracking-tight">Spartan AI</h3>
            <p className="text-[10px] font-mono text-[#94A3B8] flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              CONNECTED
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="h-7 w-7 flex items-center justify-center text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors" title="New Chat">
            <RefreshIcon />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="h-7 w-7 hidden sm:flex items-center justify-center text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors">
            {isExpanded ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>
          <button onClick={() => setIsOpen(false)} className="h-7 w-7 flex items-center justify-center text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors">
            <ChevronDownIcon />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-subtle opacity-30" />
        
        <div 
          ref={scrollRef}
          className="relative h-full overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${message.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 mt-auto mb-1">
                  {message.from === 'assistant' ? (
                    <div className="h-6 w-6 rounded-full bg-[#F7931A]/10 flex items-center justify-center border border-[#F7931A]/20">
                      <SparkleIcon />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                      <span className="text-[9px] font-mono font-bold text-white/70">ME</span>
                    </div>
                  )}
                </div>

                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                    message.from === 'user'
                      ? "bg-[#F7931A]/10 text-white border border-[#F7931A]/20 rounded-br-sm"
                      : "bg-white/[0.03] text-white/80 border border-white/[0.06] rounded-bl-sm"
                  }`}
                >
                  {message.content}
                  <div className={`text-[9px] mt-1.5 text-right font-mono ${
                    message.from === 'user' ? "text-[#F7931A]/50" : "text-[#94A3B8]/50"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%] flex-row">
                <div className="flex-shrink-0 mt-auto mb-1">
                  <div className="h-6 w-6 rounded-full bg-[#F7931A]/10 flex items-center justify-center border border-[#F7931A]/20 animate-pulse">
                    <SparkleIcon />
                  </div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] rounded-bl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#F7931A] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-[#F7931A] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-[#F7931A] rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-[#0F1115]/80 backdrop-blur-md border-t border-white/[0.06] z-10">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/[0.03] text-[#94A3B8] hover:text-[#F7931A] border border-white/[0.06] hover:border-[#F7931A]/20 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-white/[0.03] rounded-xl border border-white/[0.06] focus-within:border-[#F7931A]/30 focus-within:shadow-[0_0_15px_-5px_rgba(247,147,26,0.2)] transition-all p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={dashboardData ? "Ask me anything..." : "Loading data context..."}
            disabled={!dashboardData || isLoading}
            className="w-full resize-none bg-transparent px-2 py-1.5 text-[13px] placeholder:text-[#94A3B8]/40 focus:outline-none min-h-[36px] max-h-[120px] text-white font-body"
            style={{ height: 'auto' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || !dashboardData}
            className="h-8 w-8 shrink-0 rounded-lg bg-[#F7931A] hover:bg-[#F7931A]/80 text-[#030304] flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <SendIcon />
          </button>
        </div>
        {!dashboardData && (
          <p className="text-[9px] font-mono text-[#94A3B8]/50 mt-2 text-center">
            Waiting for OKR data sync...
          </p>
        )}
      </div>
    </div>
  );
}
