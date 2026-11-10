
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
    Bot,
    MessageCircle,
    Send,
    X,
    Sparkles,
    LoaderCircle,
} from "lucide-react";
import dynamic from "next/dynamic";

const AIMessage = dynamic(
    () => import("./ai-message"),
    {
        ssr: false,
        loading: () => (
            <span className="text-sm text-gray-400">
                Loading response...
            </span>
        ),
    }
);

const PHONE_NUMBER = "9779702803911";

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};


export default function CustomerSupportWidget() {
    const [welcomeOpen, setWelcomeOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content:
                "Hello! Welcome to Siraha Grader & Roller Rental Service. 👋\n\nI'm your AI assistant. I can help you with our rental services, machine availability enquiries, and booking information.\n\nHow can I help you today?",
        },
    ]);

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Automatically display welcome popup after 1.5 seconds.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setWelcomeOpen(true);
        }, 1500);

        return () => window.clearTimeout(timer);
    }, []);

    // Scroll to the latest message.
    useEffect(() => {
        if (!aiOpen) return;

        messagesEndRef.current?.scrollIntoView({
            behavior: "auto",
            block: "nearest",
        });
    }, [messages, isLoading, aiOpen]);


    const openAI = () => {
        setWelcomeOpen(false);
        setAiOpen(true);
    };

    const closeAI = () => {
        setAiOpen(false);
    };

    const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userMessage = input.trim();

        if (!userMessage || isLoading) return;

        const updatedMessages: ChatMessage[] = [
            ...messages,
            {
                role: "user",
                content: userMessage,
            },
        ];

        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);
        try {
            const response = await fetch("/api/ai-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: updatedMessages.slice(-12),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to get a response.");
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: data.message,
                },
            ]);

        } catch (error) {
            console.error("AI chat error:", error);

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content:
                        "Sorry, I'm having trouble responding right now. Please try again or contact our team through WhatsApp at 9702803911.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-20 right-4 z-[95] flex flex-col items-end gap-3 lg:bottom-6 sm:right-6">

                {/* Welcome Popup */}
                <div
                    aria-hidden={!welcomeOpen || aiOpen}
                    inert={!welcomeOpen || aiOpen}
                    className={`
                        support-popup
                        absolute bottom-full right-0 mb-1
                        w-[min(340px,calc(100vw-32px))]
                        overflow-hidden rounded-2xl
                        border border-gray-200 bg-white shadow-2xl
                        transition-[opacity,transform,visibility]
                        duration-300 ease-in-out
                        ${welcomeOpen && !aiOpen
                            ? "visible translate-y-0 opacity-100"
                            : "invisible translate-y-0 opacity-0 pointer-events-none"
                        }
                    `}
                >
                    <div className="flex items-start justify-between bg-[#17232d] p-5 text-white">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <Sparkles size={17} className="text-[#e5a928]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#e5a928]">
                                    Customer Support
                                </span>
                            </div>

                            <h3 className="text-lg font-extrabold">
                                How can we help you?
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-gray-300">
                                Choose how you'd like to get in touch with us.
                            </p>
                        </div>

                        <button
                            onClick={() => setWelcomeOpen(false)}
                            aria-label="Close welcome popup"
                            className="rounded-full cursor-pointer p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <X size={19} />
                        </button>
                    </div>

                    <div className="space-y-3 p-4">

                        {/* WhatsApp Support */}
                        <a
                            href={`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
                                "Hello, I am interested in your grader/roller rental services."
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setWelcomeOpen(false)}
                            className="flex items-center gap-3 rounded-xl border border-[#25D366]/30 bg-[#f0fff5] p-3 transition hover:border-[#25D366] hover:bg-[#e6ffef]"
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                                <MessageCircle size={23} />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-extrabold text-gray-900">
                                    WhatsApp Support
                                </span>
                                <span className="mt-1 block text-xs text-gray-500">
                                    Chat directly with our team
                                </span>
                            </span>

                            <span className="text-lg text-[#25D366]">→</span>
                        </a>

                        {/* AI Support */}
                        <button
                            onClick={openAI}
                            className="flex w-full items-center gap-3 rounded-xl border border-[#e5a928]/40 bg-[#fffaf0] p-3 text-left transition hover:border-[#e5a928] hover:bg-[#fff5df]"
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e5a928] text-white">
                                <Bot size={24} />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-extrabold text-gray-900">
                                    AI Assistant
                                </span>
                                <span className="mt-1 block text-xs text-gray-500">
                                    Get instant answers about our services
                                </span>
                            </span>

                            <span className="text-lg text-[#805600]">→</span>
                        </button>

                        <p className="pt-1 text-center text-[10px] text-[#52616b]">
                            Siraha Grader & Roller Rental Service
                        </p>
                    </div>
                </div>

                {/* AI Chat Window */}
                {aiOpen && (
                    <div className="support-popup mb-1 flex h-[min(510px,calc(100dvh-150px))] w-[min(370px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                        {/* Chat Header */}
                        <div className="flex shrink-0 items-center justify-between bg-[#17232d] px-4 py-4 text-white">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5a928] text-white">
                                    <Bot size={23} />
                                </span>

                                <div>
                                    <h3 className="text-sm font-extrabold">
                                        Rental AI Assistant
                                    </h3>

                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-green-400" />
                                        <span className="text-[11px] text-gray-300">
                                            Here to help you
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={closeAI}
                                aria-label="Close AI chat"
                                className="rounded-full cursor-pointer p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div
                            className="flex-1 space-y-4 overflow-y-auto bg-[#f7f9fa] p-4"
                            aria-live="polite"
                        >
                            <div className="text-center">
                                <span className="rounded-full bg-white px-3 py-1 text-[10px] text-gray-400 shadow-sm">
                                    Ask us anything about our rental services
                                </span>
                            </div>

                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                        }`}
                                >
                                    {message.role === "assistant" && (
                                        <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e5a928] text-white">
                                            <Bot size={16} />
                                        </span>
                                    )}


                                    <div
                                        className={`min-w-0 max-w-[85%] break-words rounded-2xl px-3.5 py-3 ${message.role === "user"
                                            ? "rounded-br-sm bg-[#17232d] text-white"
                                            : "rounded-bl-sm border border-gray-100 bg-white text-gray-700 shadow-sm"
                                            }`}
                                    >
                                        {message.role === "assistant" ? (
                                            <AIMessage content={message.content} />
                                        ) : (
                                            <p className="whitespace-pre-wrap text-sm leading-6">
                                                {message.content}
                                            </p>
                                        )}
                                    </div>

                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e5a928] text-white">
                                        <Bot size={16} />
                                    </span>

                                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-xs text-gray-500 shadow-sm">
                                        <LoaderCircle size={15} className="animate-spin" />
                                        Typing...
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* WhatsApp Alternative */}
                        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-2">
                            <a
                                href={`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
                                    "Hello, I need assistance with your rental services."
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 text-xs font-semibold text-[#168b49] transition hover:text-[#075E54]"
                            >
                                <MessageCircle size={15} />
                                Prefer talking to our team? WhatsApp us
                            </a>
                        </div>

                        {/* Message Input */}
                        <form
                            onSubmit={sendMessage}
                            className="flex shrink-0 items-center gap-2 border-t border-gray-100 bg-white p-3"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                maxLength={1000}
                                disabled={isLoading}
                                className="h-11 min-w-0 flex-1 rounded-full border border-gray-200 bg-[#f7f9fa] px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#e5a928] disabled:opacity-60"
                            />

                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                aria-label="Send message"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e5a928] text-white transition hover:bg-[#c58d17] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Floating Contact Buttons */}
                <div className="flex items-center gap-3">

                    {/* WhatsApp Button */}
                    <a
                        href={`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
                            "Hello, I am interested in your grader/roller rental services."
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Contact us on WhatsApp"
                        title="WhatsApp Support"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition duration-300 hover:scale-110 hover:bg-[#1ebe5d] active:scale-95 sm:h-14 sm:w-14"
                    >
                        <MessageCircle size={25} />
                    </a>

                    {/* AI Assistant Button */}
                    <button
                        onClick={() => {
                            setWelcomeOpen(false);
                            setAiOpen(!aiOpen);
                        }}
                        aria-label={aiOpen ? "Close AI assistant" : "Open AI assistant"}
                        aria-expanded={aiOpen}
                        title="AI Assistant"
                        className="relative cursor-pointer flex h-12 w-12 items-center justify-center rounded-full bg-[#17232d] text-white shadow-lg shadow-black/20 ring-2 ring-[#e5a928]/70 transition duration-300 hover:scale-110 hover:bg-[#263b4a] active:scale-95 sm:h-14 sm:w-14"
                    >
                        {aiOpen ? <X size={24} /> : <Bot size={26} />}

                        {!aiOpen && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e5a928] opacity-60" />
                                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-[#e5a928]" />
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Smooth Popup Animation */}
            <style jsx global>{`
                @keyframes supportPop {
                    0% {
                        opacity: 0;
                        transform: translateY(18px) scale(0.96);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .support-popup {
                    transform-origin: bottom right;
                    animation: supportPop 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .support-popup {
                        animation: none;
                    }
                }
            `}</style>
        </>
    );
}
