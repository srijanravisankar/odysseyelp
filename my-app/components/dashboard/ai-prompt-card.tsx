"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const promptSuggestions = [
  "Best coffee shops in downtown Toronto",
  "Romantic date night spots",
  "Hidden gems for foodies",
  "Weekend brunch with friends",
  "Live music venues tonight",
];

export function AIPromptCard() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Navigate to chat with the prompt as a query param
    setIsLoading(true);
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <Card className="col-span-full bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-background border-violet-500/20">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950">
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold">AI Trip Planner</h3>
            <p className="text-sm text-muted-foreground">
              Describe your perfect day and let AI create an itinerary
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Plan a romantic evening in Toronto with dinner and drinks..."
            className="pr-12 h-12 bg-background/50"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1 h-10 w-10"
            disabled={!prompt.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Prompt suggestions */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full",
                  "bg-muted hover:bg-muted/80 transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  "border border-transparent hover:border-primary/20"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
