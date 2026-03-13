"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

function getResponse(input: string, t: (key: string) => string): string {
  const lower = input.toLowerCase();

  if (/propert|listing|house|apartment|office|land|store|warehouse/i.test(lower)) {
    return t("properties");
  }
  if (/buy|sell|purchase|shitje|blerje|kaufen|verkaufen/i.test(lower)) {
    return t("buySell");
  }
  if (/rent|qira|miete|vermiet/i.test(lower)) {
    return t("rent");
  }
  if (/price|cost|free|fee|çmim|preis|kostenlos|falas/i.test(lower)) {
    return t("price");
  }
  if (/contact|agent|reach|phone|email|kontakt|agjent|makler/i.test(lower)) {
    return t("contact");
  }
  if (/location|area|region|city|skopje|shkup|tetovo|tetov|gostivar|kumanovo|bitola|ohrid|struga|macedoni|maqedoni/i.test(lower)) {
    return t("location");
  }
  if (/account|login|admin|sign in|kyçu|anmeld/i.test(lower)) {
    return t("account");
  }
  if (/favorite|saved|heart|preferuar|favorit/i.test(lower)) {
    return t("favorites");
  }

  return t("defaultResponse");
}

export function ChatBubble() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    { id: 0, text: t("welcome"), sender: "bot" },
  ]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Listen for custom event from header "Search with AI" button
  React.useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-ai-chat", handler);
    return () => window.removeEventListener("open-ai-chat", handler);
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, locale }),
      });

      const data = (await res.json()) as { reply?: string };
      const botText =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : getResponse(trimmed, t);

      const botMsg: Message = {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: Message = {
        id: Date.now() + 1,
        text: getResponse(trimmed, t),
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:left-auto sm:w-96 sm:max-w-96">
          {/* Header */}
          <div className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">{t("title")}</span>
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-900">AI</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 transition-colors hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex h-80 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm",
                  msg.sender === "user"
                    ? "self-end bg-amber-500 text-white"
                    : "self-start bg-gray-100 text-gray-800"
                )}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-gray-200 px-4 py-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              disabled={isSending}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isSending}
              className="rounded-lg bg-gray-900 p-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-110"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}
