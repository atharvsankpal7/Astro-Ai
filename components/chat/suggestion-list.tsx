import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Suggestion } from "./types";

interface SuggestionListProps {
  suggestions: Suggestion[];
  onSelect: (text: string) => void;
}

export function SuggestionList({ suggestions, onSelect }: SuggestionListProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap pb-2">
      <div className="flex gap-2 px-1">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="suggestion-card flex-shrink-0"
            >
              <Button
                variant="outline"
                className="h-auto py-2 px-4 text-sm whitespace-normal max-w-[300px] text-left"
                onClick={() => onSelect(suggestion.text)}
              >
                {suggestion.text}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}