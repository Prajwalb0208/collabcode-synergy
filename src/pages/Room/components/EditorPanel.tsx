
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Terminal, Play, FilePlus, Download } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import FileExplorer from "@/components/FileExplorer";
import { CodeFile } from "../types";
import { useState } from "react";

interface EditorPanelProps {
  showFileExplorer: boolean;
  files: CodeFile[];
  activeTab: string;
  handleFileClick: (file: CodeFile) => void;
  currentFile: CodeFile;
  handleCodeChange: (code: string) => void;
  terminal: string[];
  handleRunCode: () => void;
  projectFiles: CodeFile[];
  onCreateFile?: (fileName: string, language: string, content?: string) => void;
  onCreateFolder?: (folderName: string) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  showFileExplorer,
  files,
  activeTab,
  handleFileClick,
  currentFile,
  handleCodeChange,
  terminal,
  handleRunCode,
  projectFiles,
  onCreateFile,
  onCreateFolder
}) => {
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
  
  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {showFileExplorer && (
        <>
          <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
            <FileExplorer 
              files={projectFiles} 
              onFileSelect={handleFileClick} 
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}
      
      <ResizablePanel 
        defaultSize={showFileExplorer ? 55 : 70} 
        minSize={30}
        className="flex flex-col"
      >
        <div className="bg-muted/30 px-1.5 pt-1.5 border-b">
          <Tabs 
            value={activeTab} 
            className="w-full"
            onValueChange={(value) => {
              const selectedFile = files.find(f => f.name === value);
              if (selectedFile) handleFileClick(selectedFile);
            }}
          >
            <div className="flex justify-between items-center">
              <TabsList className="bg-transparent h-9 justify-start">
                {files.map((file) => (
                  <TabsTrigger 
                    key={file.name} 
                    value={file.name}
                    className="data-[state=active]:bg-background px-3 py-1.5 h-8"
                  >
                    {file.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadFile}
                className="mr-2"
                title="Download File"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </Tabs>
        </div>
        
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full">
              <CodeEditor 
                code={currentFile.content}
                onChange={handleCodeChange}
                language={currentFile.language}
              />
            </div>
          </ResizablePanel>
          
          <ResizablePanel defaultSize={30} minSize={15}>
            <div className="h-full bg-zinc-900">
              <div className="flex items-center p-2 bg-zinc-800 border-b border-zinc-700">
                <h3 className="text-sm font-medium text-zinc-300 flex items-center">
                  <Terminal className="h-4 w-4 mr-2 text-zinc-400" />
                  Terminal
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto text-zinc-300 hover:bg-zinc-700"
                  onClick={handleRunCode}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
              </div>
              <div className="terminal-container p-2 text-zinc-300 font-mono text-sm h-[calc(100%-85px)] overflow-auto custom-scrollbar">
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
              <form onSubmit={handleTerminalSubmit} className="border-t border-zinc-700 p-2">
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </>
  );
};

export default EditorPanel;
