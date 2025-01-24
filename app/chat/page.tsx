"use client";

import { useState, useEffect } from "react";
import { Moon, Plus, RefreshCw, Settings, Sun } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { getAstrologyData } from "@/lib/astrology";
import { UserFormModal, type UserFormData } from "@/components/user-form-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageList } from "@/components/chat/message-list";
import { SuggestionList } from "@/components/chat/suggestion-list";
import { MessageInput } from "@/components/chat/message-input";
import { Message, Suggestion } from "@/components/chat/types";

const initialSuggestions: Suggestion[] = [
  { text: "What does my birth chart say about my career?", category: "career" },
  { text: "Can you analyze my love life based on my birth chart?", category: "love" },
  { text: "What are my favorable periods in the coming months?", category: "timing" },
  { text: "Which gemstones are suitable for me?", category: "remedies" },
  { text: "What are my strengths according to Vedic astrology?", category: "personality" },
];

const RESPONSE_FORMAT = `
Please analyze the following birth chart and current date/time context to provide astrological insights:

Current Date: ${format(new Date(), 'PPP')}
Current Time: ${format(new Date(), 'p')}
Current Location: [User's current location]

Birth Details:
[Name, Gender, Date, Time and Location details will be inserted here]

Astrological Data:
[Planetary positions and birth chart details will be inserted here]

Please provide your response in the following format:

Response:
[sentences directly answering the user's question based on both birth chart and current planetary positions and instead of just directly giving the sentences try to use bulet points to make it easier to understand for the user with giving headings and paragraphs, and don't use any markdown in the response]

Follow-up Questions:(this follow up question is for the user to ask more questions based on the answer to you again, so make sure that they are in the format and perspective of the user)
1. [Related follow-up question]
2. [Related follow-up question]
3. [Related follow-up question]

Note: Keep the response concise and focused on the specific question asked while considering both natal and transit influences.
also make sure that we are using simple language and not using any technical terms or jargon in order to make the response easier to understand for the user as old as 10 year old.
`;

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Vedic astrology consultant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [astrologyData, setAstrologyData] = useState<any>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getUserData = () => {
    const data = localStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const userData = getUserData();
    if (!userData) {
      setPendingQuestion(userMessage);
      setShowUserForm(true);
      return;
    }

    await processUserMessage(userMessage, userData);
  };

  const processUserMessage = async (message: string, userData: UserFormData) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsLoading(true);

    try {
      // Fetch or use cached astrology data
      let currentAstrologyData = astrologyData;
      if (!currentAstrologyData) {
        currentAstrologyData = await getAstrologyData(userData);
        setAstrologyData(currentAstrologyData);
      }

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `As a Vedic astrology AI consultant, please analyze the following birth details and current planetary positions:

Birth Details:
Name: ${userData.name}
Gender: ${userData.gender}
Date of Birth: ${format(new Date(userData.dateOfBirth), 'PPP')}
Time of Birth: ${userData.timeOfBirth}
Birth Location: ${userData.birthLocation}

Astrological Data:
${JSON.stringify(currentAstrologyData, null, 2)}

Current Date: ${format(new Date(), 'PPP')}
Current Time: ${format(new Date(), 'p')}

User's Question: ${message}

${RESPONSE_FORMAT}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const [answer, ...suggestionsText] = text.split("Follow-up Questions:");
      
      const formattedAnswer = answer
        .replace("Response:", "")
        .trim();
      
      setMessages((prev) => [...prev, { role: "assistant", content: formattedAnswer }]);

      if (suggestionsText.length > 0) {
        const newSuggestions = suggestionsText[0]
          .split("\n")
          .filter(line => line.match(/^\d+\./))
          .map(text => ({
            text: text.replace(/^\d+\.\s*/, "").trim(),
            category: "followup",
          }));
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserFormSubmit = async (data: UserFormData) => {
    localStorage.setItem("userData", JSON.stringify(data));
    setAstrologyData(null);
    if (pendingQuestion) {
      await processUserMessage(pendingQuestion, data);
      setPendingQuestion(null);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your AI Vedic astrology consultant. How can I help you today?",
      },
    ]);
    setSuggestions(initialSuggestions);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    localStorage.removeItem("userData");
    handleNewChat();
    setShowResetConfirm(false);
    setShowUserForm(true);
    setAstrologyData(null);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-4">
      <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg overflow-y-auto scroll-m-2">
        <div className="h-[90vh] flex flex-col m-auto">
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-card z-10">
            <h1 className="text-2xl font-semibold">Vedic Astrology AI</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleNewChat}>
                    <Plus className="mr-2 h-4 w-4" /> New Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset Information
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <MessageList messages={messages} />

            <div className="p-4 border-t space-y-4">
              <SuggestionList 
                suggestions={suggestions} 
                onSelect={(text) => setInput(text)} 
              />

              <MessageInput
                input={input}
                isLoading={isLoading}
                onChange={setInput}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>

      <UserFormModal
        open={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setPendingQuestion(null);
        }}
        onSubmit={handleUserFormSubmit}
      />

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset User Information</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset your information? You'll need to enter your details again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}