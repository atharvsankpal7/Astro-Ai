export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Suggestion {
  text: string;
  category: string;
}