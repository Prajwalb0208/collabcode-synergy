
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import LiveCursors from "./LiveCursors";
import { File, FileCode, FileText, FileJson } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange,
  language = "javascript" 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

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
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Mock editor content - in a real app, we'd use CodeMirror, Monaco, or similar
  const handleInput = (e: React.FormEvent<HTMLPreElement>) => {
    const content = e.currentTarget.textContent || "";
    onChange(content);
  };

  return (
    <Card className="w-full h-full rounded-none shadow-none border-0 flex flex-col">
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
          <span className="text-xs text-muted-foreground">2 collaborators</span>
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
            className="p-4 font-mono text-sm outline-none flex-1 overflow-auto language-javascript h-full"
            contentEditable
            suppressContentEditableWarning
            spellCheck="false"
            onInput={handleInput}
          >
            {code}
          </pre>
        </div>
      </div>
    </Card>
  );
};

export default CodeEditor;
