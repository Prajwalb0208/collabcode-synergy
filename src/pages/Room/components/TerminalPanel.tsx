
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface TerminalPanelProps {
  terminal: string[];
  handleRunCode: () => void;
}

const TerminalPanel: React.FC<TerminalPanelProps> = ({ terminal, handleRunCode }) => {
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!terminalInput.trim()) return;
    
    // Add to terminal history
    setTerminalHistory(prev => [...prev, terminalInput]);
    setHistoryIndex(terminalHistory.length + 1);
    
    // Execute the command
    if (handleRunCode) {
      // Use executeTerminalCommand directly for shell commands
      import('@/services/codeExecutor').then(({ executeTerminalCommand }) => {
        const output = executeTerminalCommand(terminalInput);
        
        // Update terminal output in the room state
        // This assumes terminal is already an array of strings
        (window as any).addTerminalOutput?.(output);
      });
    }
    
    // Clear input
    setTerminalInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setTerminalInput(terminalHistory[historyIndex - 1]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < terminalHistory.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setTerminalInput(terminalHistory[historyIndex + 1]);
      } else if (historyIndex === terminalHistory.length - 1) {
        setHistoryIndex(terminalHistory.length);
        setTerminalInput("");
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2 py-1 bg-zinc-800 border-b border-zinc-700">
        <span className="text-zinc-300 text-sm">Terminal</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-zinc-300 hover:bg-zinc-700"
          onClick={handleRunCode}
        >
          <Play className="h-4 w-4 mr-1" />
          Run
        </Button>
      </div>
      
      <div className="terminal-container p-2 text-zinc-300 font-mono text-sm flex-1 overflow-auto custom-scrollbar bg-zinc-900">
        {terminal.length === 0 ? (
          <div className="text-zinc-500 italic p-2">
            Terminal ready. Type commands below or click 'Run' to execute code.
          </div>
        ) : (
          terminal.map((line, i) => (
            <div key={i} className="mb-1 whitespace-pre-wrap">
              {line}
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleTerminalSubmit} className="border-t border-zinc-700 p-2 bg-zinc-900">
        <div className="flex items-center bg-zinc-800 rounded">
          <span className="text-zinc-500 pl-2">$</span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none w-full p-2 text-zinc-300 text-sm focus:outline-none font-mono"
            placeholder="Enter command..."
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </form>
    </div>
  );
};

export default TerminalPanel;
