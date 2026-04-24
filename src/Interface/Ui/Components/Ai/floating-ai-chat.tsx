"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/src/Interface/Ui/Primitives/button";
import { 
  Send, 
  Minimize2, 
  Maximize2, 
  Sparkles,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { nanoid } from "nanoid";
import { cn } from "@/src/Interface/Ui/utils/cn";

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

export function FloatingAiChat({ dashboardData }: FloatingAiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nanoid(),
      from: "assistant",
      content: "สวัสดีครับ ผมคือ Strategic OKR Advisor ผู้ช่วย AI ของคุณ \nมีข้อมูลอะไรเกี่ยวกับผลการดำเนินงานของทีมที่คุณอยากให้ผมช่วยวิเคราะห์หรือสรุปให้ฟังไหมครับ?",
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
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 px-6 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md hover:bg-white dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium tracking-wide transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-0.5 z-50 flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700/80"
      >
        Ask AI
      </Button>
    );
  }

  return (
    <div 
      className={cn(
        "fixed right-6 bottom-6 z-50 flex flex-col bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] transition-all duration-300 overflow-hidden",
        isExpanded 
          ? "w-[800px] h-[80vh] sm:right-10 sm:bottom-10 rounded-[24px]" 
          : "w-[380px] h-[600px] rounded-[24px]"
      )}
    >
      {/* Minimal Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Sparkles className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">AI Assistant</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 dark:bg-zinc-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-500 dark:bg-zinc-400"></span>
              </span>
              Connected to Workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-zinc-500">
          <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full" title="New Chat">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hidden sm:flex">
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[length:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div 
          ref={scrollRef}
          className="relative h-full overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className="flex-shrink-0 mt-auto mb-1">
                  {message.from === 'assistant' ? (
                    <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-white dark:text-zinc-900">ME</span>
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "px-4 py-3 rounded-[20px] text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap",
                    message.from === 'user'
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm"
                      : "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800/50 rounded-bl-sm"
                  )}
                >
                  {message.content}
                  <div className={cn(
                    "text-[10px] mt-2 text-right font-medium",
                    message.from === 'user' ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] flex-row">
                <div className="flex-shrink-0 mt-auto mb-1">
                  <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100 animate-pulse" />
                  </div>
                </div>
                <div className="px-4 py-4 rounded-[20px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-bl-sm shadow-sm flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-t border-zinc-200/50 dark:border-zinc-800/50 z-10">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm hover:shadow"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 focus-within:ring-4 focus-within:ring-zinc-100 dark:focus-within:ring-zinc-800/50 focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-all p-2 shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={dashboardData ? "Ask me anything..." : "Loading data context..."}
            disabled={!dashboardData || isLoading}
            className="w-full resize-none bg-transparent px-3 py-2 text-[13px] placeholder:text-zinc-400 focus:outline-none min-h-[40px] max-h-[120px] scrollbar-thin text-zinc-900 dark:text-zinc-100"
            style={{ height: 'auto' }}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || !dashboardData}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
        {!dashboardData && (
          <p className="text-[10px] text-zinc-500 mt-2 text-center font-medium">
            Waiting for OKR data to sync...
          </p>
        )}
      </div>
    </div>
  );
}
