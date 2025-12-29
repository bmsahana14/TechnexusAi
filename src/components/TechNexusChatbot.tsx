"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, ExternalLink } from "lucide-react";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

export default function TechNexusChatbot() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            text: "👋 Hi! I'm the TechNexus Community Assistant. How can I help you today?",
            sender: "bot",
            timestamp: new Date(2025, 0, 1), // Static date for initial render
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setMounted(true);
        scrollToBottom();
    }, [messages]);

    if (!mounted) return null;

    const quickResponses = [
        { question: "What is TechNexus?", answer: "TechNexus is a vibrant tech community fostering innovation, learning, and collaboration. We organize events, workshops, and provide a platform for tech enthusiasts to connect and grow together! 🚀" },
        { question: "How do I join?", answer: "You can join our community by following us on LinkedIn at https://www.linkedin.com/company/technexuscommunity/ and participating in our events and discussions! 🎯" },
        { question: "What events do you organize?", answer: "We organize tech talks, workshops, hackathons, quiz competitions (like this one!), networking sessions, and more. Follow us on LinkedIn to stay updated on upcoming events! 📅" },
        { question: "How does this quiz work?", answer: "Admins can create quizzes manually, participants join using a code or QR code, and compete in real-time! Check your score on the live leaderboard. It's fun and educational! 🎮" },
        { question: "Contact information", answer: "Connect with us on LinkedIn: https://www.linkedin.com/company/technexuscommunity/posts/ for updates, events, and community discussions! 💬" },
    ];

    const getBotResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase();

        // Check for quick response matches
        for (const qr of quickResponses) {
            if (lowerMessage.includes(qr.question.toLowerCase().split(" ")[1]) ||
                lowerMessage.includes(qr.question.toLowerCase().split(" ")[2])) {
                return qr.answer;
            }
        }

        // Keyword-based responses
        if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
            return "Hello! 👋 Welcome to TechNexus Community! How can I assist you today?";
        }

        if (lowerMessage.includes("quiz") || lowerMessage.includes("game")) {
            return "This is our interactive quiz platform! Admins can create quizzes manually, and participants can join using a code or QR scan. Compete in real-time and climb the leaderboard! 🏆";
        }

        if (lowerMessage.includes("community") || lowerMessage.includes("about")) {
            return "TechNexus is a thriving tech community dedicated to innovation and learning. We bring together developers, designers, and tech enthusiasts through events, workshops, and collaborative projects! 🌟";
        }

        if (lowerMessage.includes("event") || lowerMessage.includes("workshop")) {
            return "We regularly host tech talks, workshops, hackathons, and networking events! Follow us on LinkedIn to stay updated: https://www.linkedin.com/company/technexuscommunity/ 📢";
        }

        if (lowerMessage.includes("linkedin") || lowerMessage.includes("social") || lowerMessage.includes("follow")) {
            return "Follow us on LinkedIn for the latest updates, events, and community discussions: https://www.linkedin.com/company/technexuscommunity/posts/ 🔗";
        }

        if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
            return "I'm here to help! You can ask me about TechNexus Community, our events, how to join, or how this quiz platform works. What would you like to know? 🤔";
        }

        if (lowerMessage.includes("thank")) {
            return "You're welcome! Feel free to ask if you have more questions. Happy to help! 😊";
        }

        // Default response
        return "That's a great question! For more detailed information, please visit our LinkedIn page: https://www.linkedin.com/company/technexuscommunity/ or ask me about specific topics like events, community, or how to join! 💡";
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        // Simulate bot typing delay
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(inputValue),
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
            setIsTyping(false);
        }, 800);
    };

    const handleQuickResponse = (question: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            text: question,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        setTimeout(() => {
            const response = quickResponses.find((qr) => qr.question === question);
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: response?.answer || getBotResponse(question),
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <>
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.7)] transition-all flex items-center justify-center group"
                    >
                        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? "60px" : "600px"
                        }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">TechNexus Assistant</h3>
                                    <p className="text-xs text-white/80">Online • Always here to help</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <Minimize2 size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === "user"
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                                    : "bg-slate-800 text-slate-100 border border-white/10"
                                                    }`}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                                <p className="text-xs opacity-60 mt-1">
                                                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-slate-800 border border-white/10 rounded-2xl px-4 py-3">
                                                <div className="flex gap-1">
                                                    <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick Responses */}
                                {messages.length <= 2 && (
                                    <div className="p-3 bg-slate-800/50 border-t border-white/5">
                                        <p className="text-xs text-slate-400 mb-2">Quick questions:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {quickResponses.slice(0, 3).map((qr, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleQuickResponse(qr.question)}
                                                    className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-full transition-colors"
                                                >
                                                    {qr.question}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Input Area */}
                                <div className="p-4 bg-slate-800 border-t border-white/10">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-slate-900 text-white placeholder-slate-500 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-white/10"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!inputValue.trim()}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-4 py-2 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                    <a
                                        href="https://www.linkedin.com/company/technexuscommunity/posts/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        <ExternalLink size={12} />
                                        Visit TechNexus Community on LinkedIn
                                    </a>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
