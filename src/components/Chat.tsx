
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ChatMessage } from "@/pages/Room/types";

interface ChatProps {
  onClose?: () => void;
  roomId?: string;
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ onClose, roomId, messages = [], onSendMessage }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input.trim() && onSendMessage) {
      onSendMessage(input);
      setInput("");
    }
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header with close button */}
      <div className="p-3 border-b flex items-center justify-between bg-muted/20">
        <h3 className="font-medium">Chat</h3>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-2 ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              {message.userId !== user?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback 
                    style={{ backgroundColor: message.userColor || "#6E59A5" }}
                    className="text-xs text-white"
                  >
                    {getInitials(message.userName)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[75%] ${message.userId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'} p-2 px-3 rounded-lg`}>
                {message.userId !== user?.id && (
                  <div className="font-medium text-xs mb-1">{message.userName}</div>
                )}
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </div>
                <div className="text-[10px] opacity-70 text-right mt-1">
                  {format(new Date(message.timestamp), 'h:mm a')}
                </div>
              </div>
              
              {message.userId === user?.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback className="bg-primary/80 text-xs text-white">
                    {getInitials(user.name || user.email || "ME")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
        <Input 
          placeholder="Type your message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
