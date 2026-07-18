"use client";

import { useRef, useEffect } from "react";
import { useCopilotStore } from "@/lib/copilot/store";
import { CopilotMessageBubble } from "./copilot-message-bubble";
import { CopilotStreamingOrb } from "./copilot-streaming-orb";
import { motion } from "framer-motion";

export function CopilotConversation() {
  const { messages, isLoading, statusMessage } = useCopilotStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto copilot-scroll px-4 py-6"
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CopilotMessageBubble message={msg} />
          </motion.div>
        ))}

        {isLoading && <CopilotStreamingOrb status={statusMessage} />}
      </div>
    </div>
  );
}
