"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "cinder_chat:";
const GREETING = {
  id: "greeting",
  role: "assistant",
  text: "Hi! I’m Cinder. I can explain Temperature & Heat topics, preview lessons, find a simulation, or work through a conversion. I only answer from this course.",
};

let nextId = 0;
const newId = () => `m${Date.now().toString(36)}${(nextId++).toString(36)}`;

function load(viewer) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + viewer);
    const saved = raw ? JSON.parse(raw) : null;
    return Array.isArray(saved) && saved.length ? saved : [GREETING];
  } catch {
    return [GREETING];
  }
}

// Reads `event: x\ndata: {...}\n\n` frames from a fetch body.
async function readEvents(response, onEvent, signal) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (!signal.aborted) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop();
    for (const frame of frames) {
      const event = frame.match(/^event: (.+)$/m)?.[1];
      const data = frame.match(/^data: (.+)$/m)?.[1];
      if (event && data) onEvent(event, JSON.parse(data));
    }
  }
}

/**
 * Chat state for Cinder: streaming answers, stop, retry, and a per-viewer
 * history kept in sessionStorage (cleared when the tab closes).
 */
export default function useCinderChat(viewer) {
  const [messages, setMessages] = useState([GREETING]);
  const [busy, setBusy] = useState(false);
  const controllerRef = useRef(null);
  const loadedFor = useRef(null);

  // restore this viewer's conversation (guest and each account are separate)
  useEffect(() => {
    if (loadedFor.current === viewer) return;
    loadedFor.current = viewer;
    controllerRef.current?.abort();
    setMessages(load(viewer));
  }, [viewer]);

  useEffect(() => {
    if (loadedFor.current !== viewer || busy) return;
    try {
      sessionStorage.setItem(STORAGE_PREFIX + viewer, JSON.stringify(messages.slice(-30)));
    } catch {
      /* storage full or blocked */
    }
  }, [messages, viewer, busy]);

  const patch = useCallback((id, update) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? { ...message, ...(typeof update === "function" ? update(message) : update) }
          : message,
      ),
    );
  }, []);

  const ask = useCallback(
    async (question, history) => {
      const id = newId();
      setMessages((current) => [...current, { id, role: "assistant", text: "", pending: true }]);
      setBusy(true);
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...history
                .filter((message) => message.id !== GREETING.id && message.text && !message.error)
                .slice(-8)
                .map(({ role, text }) => ({ role, content: text })),
              { role: "user", content: question },
            ],
          }),
          signal: controller.signal,
        });

        if (response.headers.get("content-type")?.includes("text/event-stream")) {
          await readEvents(
            response,
            (event, data) => {
              if (event === "delta") {
                patch(id, (message) => ({ text: message.text + data.text, pending: false }));
              } else if (event === "replace") {
                patch(id, { ...data, pending: false });
              } else if (event === "done") {
                patch(id, {
                  sources: data.sources || [],
                  links: data.links || [],
                  notice: data.notice,
                  pending: false,
                });
              }
            },
            controller.signal,
          );
        } else {
          const data = await response.json();
          if (!response.ok && !data.answer) throw new Error(data.error || "Request failed");
          patch(id, {
            text: data.answer,
            links: data.links || [],
            sources: data.sources || [],
            notice: data.notice,
            confirmation: data.confirmation,
            pending: false,
          });
        }
      } catch (error) {
        if (error.name === "AbortError") {
          patch(id, (message) => ({
            pending: false,
            stopped: true,
            text: message.text || "Stopped.",
          }));
        } else {
          patch(id, {
            pending: false,
            error: true,
            text: "I couldn’t reach the assistant service. Please try again in a moment.",
            links: [{ label: "Browse lessons", href: "/lessons" }],
          });
        }
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
        setBusy(false);
      }
    },
    [patch],
  );

  const send = useCallback(
    (value) => {
      const question = value.trim();
      if (!question || busy) return;
      const history = messages;
      setMessages((current) => [...current, { id: newId(), role: "user", text: question }]);
      ask(question, history);
    },
    [ask, busy, messages],
  );

  // re-asks the user question that produced the answer at `id`
  const retry = useCallback(
    (id) => {
      if (busy) return;
      const index = messages.findIndex((message) => message.id === id);
      const userIndex = messages.slice(0, index).findLastIndex((message) => message.role === "user");
      if (userIndex < 0) return;
      const question = messages[userIndex].text;
      const history = messages.slice(0, userIndex);
      setMessages(messages.slice(0, userIndex + 1));
      ask(question, history);
    },
    [ask, busy, messages],
  );

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setMessages([GREETING]);
  }, []);

  const resolveConfirmation = useCallback(
    (id, approved) => {
      const message = messages.find((item) => item.id === id);
      const confirmation = message?.confirmation;
      if (!confirmation || confirmation.type !== "web-search") return;
      const url = approved
        ? `https://www.google.com/search?q=${encodeURIComponent(`${confirmation.query} Temperature and Heat physics`)}`
        : null;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      patch(id, {
        confirmation: null,
        externalSearchUrl: url,
        text: approved
          ? "I opened an external web search. Its results are not verified by this course."
          : "Okay, I didn’t search the web. I’ll stick to the course material.",
      });
    },
    [messages, patch],
  );

  return { messages, busy, send, retry, stop, reset, resolveConfirmation };
}
