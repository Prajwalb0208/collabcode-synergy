
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import LiveCursors from "./LiveCursors";

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

  // Mock editor content - in a real app, we'd use CodeMirror, Monaco, or similar
  const handleInput = (e: React.FormEvent<HTMLPreElement>) => {
    const content = e.currentTarget.textContent || "";
    onChange(content);
  };

  return (
    <Card className="w-full h-full overflow-hidden border border-border/50 rounded-lg shadow-sm bg-code/30 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-2">
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-destructive/80"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">2 collaborators</span>
        </div>
      </div>

      <div className="relative h-[calc(100%-40px)] overflow-auto" ref={editorRef}>
        <LiveCursors containerRef={editorRef} />
        <div className="flex">
          <div className="text-right p-4 select-none text-muted-foreground/50 bg-code/50 border-r border-border/30 font-mono text-sm">
            {Array.from({ length: code.split('\n').length || 1 }).map((_, i) => (
              <div key={i} className="py-[3px]">{i + 1}</div>
            ))}
          </div>
          <pre 
            className="p-4 font-mono text-sm outline-none flex-1 overflow-auto language-javascript"
            contentEditable
            suppressContentEditableWarning
            spellCheck="false"
            onInput={handleInput}
            style={{ minHeight: "100%" }}
          >
            {code}
          </pre>
        </div>
      </div>
    </Card>
  );
};

export default CodeEditor;
