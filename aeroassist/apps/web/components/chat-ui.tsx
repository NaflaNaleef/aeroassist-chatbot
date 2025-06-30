"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

// Enhanced message type with timestamps
interface Message {
    id: string; // Add unique ID for reliable comparison
    sender: "user" | "ai";
    content: string;
    timestamp: string;
    status?: "sending" | "sent" | "error";
}

// API response type
interface ChatResponse {
    reply: string;
    timestamp: string;
    session_id: string;
    tokens_used: number;
}

const ChatUI: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const supabase = useSupabase();

    // Auto-focus input on component mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Refocus input after loading state changes
    useEffect(() => {
        if (!loading) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [loading]);

    // Format timestamp for display
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Convert messages to API format (excluding the current message being sent)
    const getConversationHistory = () => {
        return messages.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
            timestamp: msg.timestamp
        }));
    };

    // Generate unique ID for messages
    const generateMessageId = () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };

    // Send message to backend with conversation context
    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: generateMessageId(),
            sender: "user",
            content: input.trim(),
            timestamp: new Date().toISOString(),
            status: "sending"
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        setError(null);

        try {
            // Get the current session and access token
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversation_history: getConversationHistory()
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ChatResponse = await response.json();

            // Update user message status to sent using ID
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, status: "sent" as const }
                        : msg
                )
            );

            // Add AI response
            const aiMessage: Message = {
                id: generateMessageId(),
                sender: "ai",
                content: data.reply,
                timestamp: data.timestamp,
                status: "sent"
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (err) {
            console.error("Chat error:", err);

            // Update user message status to error using ID
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, status: "error" as const }
                        : msg
                )
            );

            setError(err instanceof Error ? err.message : "Failed to send message");

            // Add error message
            const errorMessage: Message = {
                id: generateMessageId(),
                sender: "ai",
                content: "Sorry, I'm having trouble connecting right now. Please try again.",
                timestamp: new Date().toISOString(),
                status: "error"
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !loading) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Retry failed message using ID instead of index
    const retryMessage = (messageId: string) => {
        const message = messages.find(msg => msg.id === messageId);
        if (message && message.sender === "user" && message.status === "error") {
            // Remove the error message and retry
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            setInput(message.content);
            // Focus input after setting the message
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    // Clear error message
    const clearError = () => {
        setError(null);
    };

    return (
        <div className="flex flex-col h-full bg-card rounded-lg">
            {/* Error Banner */}
            {error && (
                <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive">
                    <div className="flex justify-between items-center">
                        <span className="text-sm">{error}</span>
                        <button
                            onClick={clearError}
                            className="text-destructive hover:text-destructive/80 text-sm"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        <div className="text-4xl mb-2">✈️</div>
                        <p className="text-lg font-medium">Welcome to AeroAssist!</p>
                        <p className="text-sm">Ask me about flights, travel tips, or anything airline-related.</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-[80%] ${msg.sender === "user" ? "order-2" : "order-1"}`}>
                            <div
                                className={`rounded-lg px-4 py-2 shadow-sm ${msg.sender === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                    } ${msg.status === "error" ? "border-2 border-destructive" : ""}`}
                            >
                                <div className="text-sm">{msg.content}</div>
                                <div className={`text-xs mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground/70"
                                    }`}>
                                    {formatTimestamp(msg.timestamp)}
                                    {msg.status === "sending" && " • Sending..."}
                                    {msg.status === "error" && " • Failed"}
                                </div>
                            </div>

                            {/* Retry button for failed messages */}
                            {msg.status === "error" && msg.sender === "user" && (
                                <button
                                    onClick={() => retryMessage(msg.id)}
                                    className="text-xs text-destructive hover:text-destructive/80 mt-1 underline"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-muted-foreground">AeroAssist is typing...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t bg-muted/50 rounded-b-lg">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        className="flex-1 border border-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 bg-background text-foreground"
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        aria-label="Type your message"
                        autoFocus
                    />
                    <button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        aria-label="Send message"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                Sending
                            </>
                        ) : (
                            <>
                                Send
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};

export default ChatUI; 