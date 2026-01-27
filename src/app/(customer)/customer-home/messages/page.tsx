"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, Send, Loader2, Clock } from "lucide-react";

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
                <div className="flex items-center justify-center min-h-screen backdrop-blur-sm">
                    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 shadow-2xl border-l-[6px] border-orange-500">
                        <div className="flex items-center">
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mr-4" />
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">Loading Messages</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Please wait...</p>
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
        <div className="flex h-[calc(100vh-4rem)] backdrop-blur-sm">
            <aside className="w-80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl border-r-4 border-orange-500 overflow-y-auto">
                <div className="p-6 border-b-2 border-orange-200 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700">
                    <div className="flex items-center">
                        <MessageCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Messages</h2>
                    </div>
                </div>
                {loading ? (
                    <div className="p-6 text-center">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading conversations...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-6 text-center">
                        <MessageCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No conversations yet.</p>
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
                                            "w-full text-left p-4 transition-all duration-200 border-b border-slate-200 dark:border-slate-700",
                                            selectedId === c.id 
                                                ? "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-l-4 border-orange-500" 
                                                : "hover:bg-orange-50/50 dark:hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                                            {title}
                                        </div>
                                        {last ? (
                                            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 font-medium">
                                                {last.content}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-500 dark:text-slate-500 font-medium">
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

            <main className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageCircle className="w-20 h-20 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Select a conversation to start chatting</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <header className="p-6 border-b-2 border-orange-200 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 shadow-lg">
                            <div className="font-extrabold text-xl text-slate-900 dark:text-white">
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
                        <section className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                            {messages.map((m) => {
                                const isMe =
                                    m?.sender?.id === user?.id ||
                                    m?.sender?.id === "me";
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
                                                "max-w-[75%] rounded-2xl px-4 py-3 shadow-lg whitespace-pre-wrap break-words",
                                                isMe
                                                    ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-br-md"
                                                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md border-2 border-slate-200 dark:border-slate-700"
                                            )}
                                        >
                                            <div className={cn(
                                                "text-[10px] font-bold mb-1 flex items-center",
                                                isMe ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                                            )}>
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(
                                                    m.createdAt
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                            <div className="font-medium">{m.content}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                        <footer className="p-4 border-t-2 border-orange-200 dark:border-orange-700 flex gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        send();
                                    }
                                }}
                                className="flex-1 border-2 border-orange-300 dark:border-orange-700 px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={send}
                                disabled={sending || !input.trim()}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-400 disabled:to-slate-500 text-white px-6 py-3 font-extrabold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center"
                            >
                                <Send className="w-5 h-5 mr-2" />
                                Send
                            </button>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    );
}
