import { motion } from "framer-motion";
import { Message } from "./types";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useRef } from "react";

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-3 p-4">
      <svg className="w-24 h-8" viewBox="0 0 120 30">
        <circle cx="15" cy="15" r="4" className="fill-primary">
          <animate
            attributeName="opacity"
            dur="1s"
            values="0.2;1;0.2"
            repeatCount="indefinite"
            begin="0s"
          />
          <animate
            attributeName="cy"
            dur="1s"
            values="15;10;15"
            repeatCount="indefinite"
            begin="0s"
            calcMode="spline"
            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95"
          />
        </circle>
        <circle cx="40" cy="15" r="4" className="fill-primary">
          <animate
            attributeName="opacity"
            dur="1s"
            values="0.2;1;0.2"
            repeatCount="indefinite"
            begin="0.2s"
          />
          <animate
            attributeName="cy"
            dur="1s"
            values="15;10;15"
            repeatCount="indefinite"
            begin="0.2s"
            calcMode="spline"
            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95"
          />
        </circle>
        <circle cx="65" cy="15" r="4" className="fill-primary">
          <animate
            attributeName="opacity"
            dur="1s"
            values="0.2;1;0.2"
            repeatCount="indefinite"
            begin="0.4s"
          />
          <animate
            attributeName="cy"
            dur="1s"
            values="15;10;15"
            repeatCount="indefinite"
            begin="0.4s"
            calcMode="spline"
            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95"
          />
        </circle>
      </svg>
    </div>
  );
};
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 message-appear ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-4"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
