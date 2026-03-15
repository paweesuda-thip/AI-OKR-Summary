"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SendIcon, SparklesIcon } from "lucide-react"
import { nanoid } from "nanoid"

interface Message {
  id: string
  from: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestions = [
  "Analyze team performance trends",
  "What are the top performing objectives?",
  "Show me at-risk objectives", 
  "Summarize check-in engagement",
  "How can we improve completion rates?",
  "What patterns do you see in the data?",
]

export function SimpleChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nanoid(),
      from: "assistant",
      content: "Hi! I'm your AI assistant for OKR analysis. I can help you understand your team's performance, identify trends, and provide insights. What would you like to explore?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { id: nanoid(), from: 'user', content: userMessage, timestamp: new Date() }],
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: nanoid(),
        from: "assistant",
        content: data.message,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: nanoid(),
        from: "assistant",
        content: "Sorry, I encountered an error while trying to respond. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: nanoid(),
      from: "user", 
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    await simulateResponse(userMessage.content)
  }, [input, simulateResponse])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
    // Auto-send the suggestion
    setTimeout(() => {
      const userMessage: Message = {
        id: nanoid(),
        from: "user",
        content: suggestion,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMessage])
      simulateResponse(suggestion)
    }, 100)
  }, [simulateResponse])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col h-full bg-background/40 backdrop-blur-sm">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.from === 'user'
                  ? 'bg-primary text-primary-foreground ml-12'
                  : 'bg-muted/50 text-foreground mr-12 border border-border/30'
              }`}
            >
              {message.from === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <SparklesIcon className="w-3 h-3" />
                  AI Assistant
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <div className={`text-xs mt-2 ${
                message.from === 'user' 
                  ? 'text-primary-foreground/70' 
                  : 'text-muted-foreground/70'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted/50 text-foreground mr-12 border border-border/30">
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <SparklesIcon className="w-3 h-3 animate-pulse" />
                AI Assistant
              </div>
              <div className="flex items-center gap-1 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                </div>
                <span className="text-muted-foreground/70 ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/30 bg-background/50 backdrop-blur-md">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your team's performance, trends, or objectives..."
              className="w-full resize-none rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[44px] max-h-[120px]"
              style={{ height: 'auto' }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="rounded-xl px-4 py-3 h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            <SendIcon className="w-4 h-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SimpleChatbot
