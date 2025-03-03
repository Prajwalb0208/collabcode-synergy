
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";

interface AIAssistantProps {
  code: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ code }) => {
  const [suggestions, setSuggestions] = useState<string[]>([
    "Consider using a ternary operator here for more concise code.",
    "You could refactor this loop into a map() function for better readability.",
    "This function would benefit from TypeScript type annotations."
  ]);

  const handleApplySuggestion = (suggestion: string) => {
    // In a real app, this would apply the suggestion to the code
    console.log("Applying suggestion:", suggestion);
  };

  return (
    <Card className="w-full h-full border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-4 pt-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Assistant
          </CardTitle>
          <Button variant="outline" size="sm" className="text-xs h-7">
            Analyze Code
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <div className="py-4 px-4 space-y-4">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="p-3 rounded-md border border-border/50 animate-in" 
              style={{animationDelay: `${index * 100}ms`}}
            >
              <p className="text-sm text-foreground/90 mb-2">{suggestion}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => console.log("Thumbs up for:", suggestion)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => console.log("Thumbs down for:", suggestion)}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => handleApplySuggestion(suggestion)}
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
