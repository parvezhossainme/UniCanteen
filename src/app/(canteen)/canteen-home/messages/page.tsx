"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

type User = { id: string; name?: string | null; email?: string | null };
type Participant = { id: string; userId: string; user: User };
type Conversation = {
    id: string;
    orderId?: string | null;
    participants: Participant[];
    messages?: Array<{
        id: string;
        content: string;
        createdAt: string;
        sender: User;
    }>;
    _count?: { messages: number };
};
type Message = { id: string; content: string; createdAt: string; sender: User };

export default function MessagesPage() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 absolute top-0 left-0"></div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                                        Loading Messages
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Please wait...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <MessagesPageInner />
        </Suspense>
    );
}

function MessagesPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedIdFromUrl = searchParams.get("c");
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(
        selectedIdFromUrl
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState("");

    // Load conversations
    useEffect(() => {
        let ignore = false;
        async function load() {
            setLoading(true);
            try {
                const res = await fetch("/api/messages/conversations", {
                    cache: "no-store",
                });
                const data = await res.json();
                if (!ignore) setConversations(data.conversations ?? []);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        load();
        return () => {
            ignore = true;
        };
    }, []);

    // Load messages for selected conversation
    useEffect(() => {
        if (!selectedId) return;
        let ignore = false;
        async function load() {
            try {
                const res = await fetch(
                    `/api/messages/conversations/${selectedId}/messages`,
                    { cache: "no-store" }
                );
                const data = await res.json();
                if (!ignore) setMessages(data.messages ?? []);
            } catch (e) {
                // noop
            }
        }
        load();
        const t = setInterval(load, 5000); // simple polling
        return () => {
            ignore = true;
            clearInterval(t);
        };
    }, [selectedId]);

    const selectedConversation = useMemo(
        () => conversations.find((c) => c.id === selectedId) ?? null,
        [conversations, selectedId]
    );

    function openConversation(id: string) {
        setSelectedId(id);
        router.replace(`?c=${id}`);
    }

    async function send() {
        const text = input.trim();
        if (!text || !selectedId) return;
        setSending(true);
        try {
            // optimistic
            const optimistic: Message = {
                id: `temp-${Date.now()}`,
                content: text,
                createdAt: new Date().toISOString(),
                sender: { id: "me" },
            } as any;
            setMessages((m) => [...m, optimistic]);
            setInput("");
            const res = await fetch(
                `/api/messages/conversations/${selectedId}/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: text }),
                }
            );
            const data = await res.json();
            if (res.ok && data.message) {
                setMessages((m) =>
                    m.map((x) => (x.id === optimistic.id ? data.message : x))
                );
            } else {
                // rollback
                setMessages((m) => m.filter((x) => x.id !== optimistic.id));
            }
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
            <aside className="w-80 border-r-2 border-orange-200 dark:border-orange-700 overflow-y-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-md">
                <div className="p-4 border-b-2 border-orange-200 dark:border-orange-700">
                    <h2 className="font-extrabold text-xl text-gray-900 dark:text-white">Messages</h2>
                </div>
                {loading ? (
                    <div className="p-4 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        Loading…
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        No conversations yet.
                    </div>
                ) : (
                    <ul>
                        {conversations.map((c) => {
                            const last = c.messages?.[0];
                            const title = c.participants
                                .map(
                                    (p) =>
                                        p.user?.name ||
                                        p.user?.email ||
                                        p.userId
                                )
                                .join(", ");
                            return (
                                <li key={c.id}>
                                    <button
                                        onClick={() => openConversation(c.id)}
                                        className={cn(
                                            "w-full text-left p-3 hover:bg-orange-100 dark:hover:bg-slate-700 transition-colors rounded-xl mx-2 my-1",
                                            selectedId === c.id && "bg-orange-100 dark:bg-slate-700 border-l-[6px] border-orange-500"
                                        )}
                                    >
                                        <div className="font-bold line-clamp-1 text-gray-900 dark:text-white">
                                            {title}
                                        </div>
                                        {last ? (
                                            <div className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1 font-semibold">
                                                {last.content}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                                                No messages
                                            </div>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </aside>

            <main className="flex-1 flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-md">
                {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 p-6 rounded-3xl mb-4">
                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                                Select a conversation
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Choose a conversation to start chatting</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <header className="p-4 border-b-2 border-orange-200 dark:border-orange-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                            <div className="font-extrabold text-gray-900 dark:text-white text-lg">
                                {selectedConversation.participants
                                    .map(
                                        (p) =>
                                            p.user?.name ||
                                            p.user?.email ||
                                            p.userId
                                    )
                                    .join(", ")}
                            </div>
                        </header>
                        <section className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-br from-orange-50/30 to-amber-50/30 dark:from-slate-900/30 dark:to-slate-800/30">
                            {messages.map((m) => {
                                const isMe =
                                    m?.sender?.id === user?.id ||
                                    m?.sender?.id === "me"; // optimistic uses 'me'
                                return (
                                    <div
                                        key={m.id}
                                        className={cn(
                                            "flex w-full",
                                            isMe
                                                ? "justify-end"
                                                : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[75%] rounded-2xl px-3 py-2 border-2 whitespace-pre-wrap break-words font-semibold shadow-lg",
                                                isMe
                                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 border-orange-300 text-white rounded-br-none"
                                                    : "bg-white dark:bg-slate-700 border-orange-200 dark:border-orange-700 text-gray-900 dark:text-white rounded-bl-none"
                                            )}
                                        >
                                            <div className={cn(
                                                "text-[10px] opacity-70 mb-1 font-semibold",
                                                isMe ? "text-white" : "text-gray-700 dark:text-gray-300"
                                            )}>
                                                {new Date(
                                                    m.createdAt
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                            <div>{m.content}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                        <footer className="p-3 border-t-2 border-orange-200 dark:border-orange-700 flex gap-2 mb-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") send();
                                }}
                                className="flex-1 border-2 border-orange-200 dark:border-orange-700 rounded-xl px-3 py-2 font-semibold text-gray-900 dark:text-white bg-white/50 dark:bg-slate-700/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Type a message"
                            />
                            <button
                                onClick={send}
                                disabled={sending || !input.trim()}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl px-4 py-2 font-bold shadow-lg hover:scale-105 transition-all"
                            >
                                Send
                            </button>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    );
}
