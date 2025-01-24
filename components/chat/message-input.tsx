import { Loader2, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface MessageInputProps {
  input: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MessageInput({ input, isLoading, onChange, onSubmit }: MessageInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex space-x-2">
      <Input
        value={input}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask about your astrological insights..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !input.trim()}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}