
import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import LiveCursors from "./LiveCursors";
import { Code, FileCode, FileText, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { socketService } from "@/services/socketService";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange,
  language = "javascript",
  className
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<{id: string, name: string}[]>([]);
  
  // Initialize socket connection when the component mounts
  useEffect(() => {
    if (roomId && user?.id) {
      socketService
        .connect(roomId, user.id)
        .on("user-joined", (data) => {
          setCollaborators(prev => {
            // Check if user already exists to avoid duplicates
            if (prev.some(u => u.id === data.userId)) {
              return prev;
            }
            return [...prev, { id: data.userId, name: data.name }];
          });
          
          toast({
            title: "User joined",
            description: `${data.name} joined the session`,
          });
        })
        .on("user-left", (data) => {
          setCollaborators(prev => prev.filter(u => u.id !== data.userId));
          
          toast({
            title: "User left",
            description: `${data.name} left the session`,
          });
        });
      
      return () => {
        socketService.disconnect();
      };
    }
  }, [roomId, user, toast]);

  // Get appropriate language icon
  const getLanguageIcon = () => {
    switch (language) {
      case "javascript":
      case "typescript":
        return <FileCode className="h-4 w-4 text-yellow-500" />;
      case "html":
        return <FileCode className="h-4 w-4 text-orange-500" />;
      case "css":
        return <FileCode className="h-4 w-4 text-blue-500" />;
      case "json":
        return <FileJson className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Handle editor content changes and sync with collaborators
  const handleInput = (e: React.FormEvent<HTMLPreElement>) => {
    const content = e.currentTarget.textContent || "";
    onChange(content);
    
    // Emit code changes to collaborators
    if (roomId) {
      socketService.emitCodeChange(content, "current-file", language);
    }
  };
  
  // Update cursor position when the mouse moves
  const handleMouseMove = (e: React.MouseEvent<HTMLPreElement>) => {
    if (editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Emit cursor position to collaborators
      socketService.emitCursorPosition(x, y);
    }
  };
  
  // Set up tabbing support for the code editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!preRef.current || document.activeElement !== preRef.current) return;
      
      if (e.key === 'Tab') {
        e.preventDefault();
        
        // Insert two spaces for tab
        document.execCommand('insertText', false, '  ');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Card className={cn("w-full h-full rounded-none shadow-none border-0 flex flex-col", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-destructive/80"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex items-center ml-3 gap-1.5">
            {getLanguageIcon()}
            <span className="text-sm font-medium text-muted-foreground">{language}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{collaborators.length} collaborators</span>
        </div>
      </div>

      <div className="relative h-full overflow-auto custom-scrollbar flex-1" ref={editorRef}>
        <LiveCursors containerRef={editorRef} />
        <div className="flex h-full">
          <div className="text-right p-4 select-none text-muted-foreground/50 bg-code/50 border-r border-border/30 font-mono text-sm w-[60px] flex-shrink-0">
            {Array.from({ length: code.split('\n').length || 1 }).map((_, i) => (
              <div key={i} className="py-[3px]">{i + 1}</div>
            ))}
          </div>
          <pre 
            ref={preRef}
            className="p-4 font-mono text-sm outline-none flex-1 overflow-auto language-javascript h-full text-foreground"
            contentEditable
            suppressContentEditableWarning
            spellCheck="false"
            onInput={handleInput}
            onMouseMove={handleMouseMove}
          >
            {code}
          </pre>
        </div>
      </div>
    </Card>
  );
};

export default CodeEditor;
