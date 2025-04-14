
import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import LiveCursors from "./LiveCursors";
import { Code, FileCode, FileText, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { socketService } from "@/services/socketService";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { useToast } from "@/components/ui/use-toast";
import Editor from "@monaco-editor/react";

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
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { updateRoomFiles } = useRoomHistory();
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<{id: string, name: string}[]>([]);
  const [cursorPositions, setCursorPositions] = useState<Record<string, {x: number, y: number, userName: string}>>({});
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Track changes with debounce for real-time updates
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Function to handle editor mount
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add real-time cursor tracking
    editor.onDidChangeCursorPosition((e: any) => {
      if (roomId && user) {
        const position = editor.getPosition();
        const editorCoords = editor.getScrolledVisiblePosition(position, 1);
        
        if (editorCoords && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = editorCoords.left + rect.left;
          const y = editorCoords.top + rect.top;
          
          socketService.emitCursorPosition(x, y);
        }
      }
    });
    
    // Add editor settings to persist and improve user experience
    editor.updateOptions({
      fontFamily: "'Fira Code', 'Menlo', monospace",
      fontLigatures: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      renderWhitespace: "selection",
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      contextmenu: true,
      bracketPairColorization: {
        enabled: true
      }
    });
    
    // Focus editor
    editor.focus();
  };

  // Map language to Monaco language identifier
  const getMonacoLanguage = () => {
    switch (language) {
      case "javascript":
        return "javascript";
      case "typescript":
        return "typescript";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      default:
        return "plaintext";
    }
  };

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
            return [...prev, { id: data.userId, name: data.name || data.userId }];
          });
          
          toast({
            title: "User joined",
            description: `${data.name || data.userId} joined the session`,
          });
        })
        .on("user-left", (data) => {
          setCollaborators(prev => prev.filter(u => u.id !== data.userId));
          
          // Remove cursor position for user who left
          setCursorPositions(prev => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
          
          toast({
            title: "User left",
            description: `${data.name || data.userId} left the session`,
          });
        });
      
      // Listen for code changes from other users
      socketService.on("code-change", (data) => {
        if (data.code !== code) {
          onChange(data.code);
          
          // Auto-save when receiving code changes from others
          if (saveTimeout) {
            clearTimeout(saveTimeout);
          }
          
          const timeout = setTimeout(() => {
            if (roomId) {
              updateRoomFiles(roomId, [{
                name: `current-file.${language}`, 
                language,
                content: data.code
              }]);
            }
          }, 2000);
          
          setSaveTimeout(timeout);
        }
      });
      
      // Listen for cursor positions from other users
      socketService.on("cursor-move", (data) => {
        if (data.userId !== user.id) {
          setCursorPositions(prev => ({
            ...prev,
            [data.userId]: {
              x: data.x,
              y: data.y,
              userName: data.userName || data.userId
            }
          }));
        }
      });
      
      return () => {
        socketService.disconnect();
        
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
      };
    }
  }, [roomId, user, toast, code, onChange]);

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

  // Handle value change in Monaco editor
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
      
      // Emit code changes to collaborators with debounce
      if (roomId) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        
        const timeout = setTimeout(() => {
          socketService.emitCodeChange(value, "current-file", language);
        }, 300); // 300ms debounce for typing
        
        setDebounceTimeout(timeout);
      }
    }
  };
  
  // Update cursor position when the mouse moves
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current && editorRef.current && user) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Emit cursor position to collaborators
      socketService.emitCursorPosition(x, y, user.name || user.id);
    }
  };

  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    fontSize: 14,
    lineNumbers: "on" as const,
    folding: true,
    wordWrap: "on" as const,
    renderLineHighlight: "all" as const,
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      vertical: "auto" as const,
      horizontal: "auto" as const
    }
  };

  return (
    <Card 
      className={cn("w-full h-full rounded-none shadow-none border-0 flex flex-col", className)}
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
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
          <span className="text-xs text-muted-foreground">
            {collaborators.length} active collaborator{collaborators.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="relative h-full overflow-hidden flex-1">
        <LiveCursors containerRef={containerRef} cursorPositions={cursorPositions} />
        <Editor
          height="100%"
          defaultLanguage={getMonacoLanguage()}
          language={getMonacoLanguage()}
          value={code}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={editorOptions}
        />
      </div>
    </Card>
  );
};

export default CodeEditor;
