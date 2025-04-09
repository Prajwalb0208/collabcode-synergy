
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendHorizontal, X } from "lucide-react";
import { socketService } from "@/services/socketService";
import { useAuth } from "@/contexts/AuthContext";

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
  roomId?: string;
}

const Chat: React.FC<ChatProps> = ({ onClose, roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to socket for real-time chat
  useEffect(() => {
    if (!roomId || !user) return;
    
    // Listen for incoming messages
    socketService.on("chat-message", (data) => {
      if (data.sender.id !== user.id) {
        setMessages(prev => [...prev, {
          ...data,
          timestamp: new Date(data.timestamp)
        }]);
      }
    });
    
    // Add welcome message
    setMessages([{
      id: Date.now().toString(),
      text: "Welcome to the chat. Messages will appear here as they are sent.",
      sender: {
        id: "system",
        name: "System",
        color: "#6E56CF",
      },
      timestamp: new Date()
    }]);
    
    return () => {
      socketService.off("chat-message");
    };
  }, [roomId, user]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate a consistent color for a user
  const getUserColor = (userId: string) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !roomId) return;
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        color: getUserColor(user.id),
      },
      timestamp: new Date()
    };
    
    // Add message to local state
    setMessages([...messages, message]);
    
    // Send message to others via socket
    socketService.emit("chat-message", {
      ...message,
      roomId
    });
    
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
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-start gap-3 animate-in`}
              style={{ animationDelay: "100ms" }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.avatar} />
                <AvatarFallback style={{ backgroundColor: message.sender.color }}>
                  {message.sender.name.substring(0, 2).toUpperCase()}
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
          ))
        )}
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
            disabled={!newMessage.trim() || !user}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
