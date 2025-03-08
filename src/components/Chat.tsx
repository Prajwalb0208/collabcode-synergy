
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, X } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    color: string;
  };
  timestamp: Date;
}

interface ChatProps {
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "I've added the new authentication module. Check it out.",
      sender: {
        id: "alice",
        name: "Alice Chen",
        color: "#3b82f6",
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: "2",
      text: "Looks good! I think we should refactor the login function though.",
      sender: {
        id: "bob",
        name: "Bob Smith",
        color: "#10b981",
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 2)
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: {
        id: "me",
        name: "You",
        color: "#8b5cf6",
      },
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-medium">Chat</h3>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start gap-3 animate-in`}
            style={{ animationDelay: "100ms" }}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.sender.avatar} />
              <AvatarFallback style={{ backgroundColor: message.sender.color }}>
                {message.sender.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{message.sender.name}</span>
                <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
              </div>
              <p className="text-sm text-foreground/90 break-words">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            variant="default" 
            size="icon"
            disabled={!newMessage.trim()}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
