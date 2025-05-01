
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Terminal, Play, Download, GitBranch, GitCommit, GitPullRequest, Github } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import FileExplorer from "@/components/FileExplorer";
import { CodeFile } from "../types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  onCreateFile?: (fileName: string, language: string, folderId?: string, content?: string) => void;
  onCreateFolder?: (folderName: string, parentId?: string) => void;
  onMoveFile?: (fileId: string, targetFolderId: string) => void;
  visiblePanels: {
    editor: boolean;
    terminal: boolean;
    git: boolean;
    videos: boolean;
    collaboration: boolean;
  };
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
  onCreateFolder,
  onMoveFile,
  visiblePanels
}) => {
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("main");
  const [githubRepo, setGithubRepo] = useState<string>("");
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const { toast } = useToast();

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

  const handleCommit = () => {
    if (commitMessage.trim()) {
      setIsPushing(true);
      
      // Simulate a commit and push operation
      setTimeout(() => {
        setIsPushing(false);
        setCommitMessage("");
        
        toast({
          title: "Commit successful",
          description: `Changes committed to ${branchName} branch`,
        });
      }, 1500);
    }
  };
  
  const handleConnectGitRepo = () => {
    if (githubRepo.trim()) {
      toast({
        title: "Repository connected",
        description: `Connected to GitHub repository: ${githubRepo}`,
      });
    }
  };

  return (
    <>
      {showFileExplorer && (
        <>
          <ResizablePanel defaultSize={15} minSize={10} maxSize={30} className="max-h-full overflow-auto">
            <FileExplorer 
              files={projectFiles} 
              onFileSelect={handleFileClick} 
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onMoveFile={onMoveFile}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}
      
      <ResizablePanel 
        defaultSize={showFileExplorer ? 85 : 100} 
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
              <TabsList className="bg-transparent h-9 justify-start overflow-x-auto">
                {files.map((file) => (
                  <TabsTrigger 
                    key={file.name} 
                    value={file.name}
                    className="data-[state=active]:bg-background px-3 py-1.5 h-8 whitespace-nowrap"
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
        
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full">
              <CodeEditor 
                code={currentFile.content}
                onChange={handleCodeChange}
                language={currentFile.language}
              />
            </div>
          </ResizablePanel>
          
          {(visiblePanels.terminal || visiblePanels.git) && (
            <>
              <ResizableHandle withHandle className="bg-muted/50 hover:bg-muted transition-colors" />
              
              <ResizablePanel defaultSize={30} minSize={15}>
                <Tabs defaultValue={visiblePanels.terminal ? "terminal" : "git"} className="h-full flex flex-col">
                  <TabsList className="justify-start px-2 pt-2 bg-zinc-800 border-b border-zinc-700 rounded-none">
                    {visiblePanels.terminal && (
                      <TabsTrigger value="terminal" className="text-zinc-300 data-[state=active]:text-white data-[state=active]:bg-zinc-900">
                        <Terminal className="h-4 w-4 mr-2" />
                        Terminal
                      </TabsTrigger>
                    )}
                    {visiblePanels.git && (
                      <TabsTrigger value="git" className="text-zinc-300 data-[state=active]:text-white data-[state=active]:bg-zinc-900">
                        <GitBranch className="h-4 w-4 mr-2" />
                        Git
                      </TabsTrigger>
                    )}
                    {visiblePanels.terminal && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto text-zinc-300 hover:bg-zinc-700"
                        onClick={handleRunCode}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                    )}
                  </TabsList>
                  
                  <div className="flex-1 overflow-hidden">
                    {visiblePanels.terminal && (
                      <TabsContent value="terminal" className="h-full flex flex-col m-0 data-[state=active]:flex-1 p-0 border-0">
                        <div className="terminal-container p-2 text-zinc-300 font-mono text-sm flex-1 overflow-auto custom-scrollbar bg-zinc-900 h-full">
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
                      </TabsContent>
                    )}
                    
                    {visiblePanels.git && (
                      <TabsContent value="git" className="p-0 data-[state=active]:flex-1 border-0 bg-zinc-900 h-full">
                        <ScrollArea className="h-full">
                          <div className="p-4 space-y-4">
                            {/* GitHub Repository Connection */}
                            <div className="rounded-md border border-zinc-700 p-3">
                              <p className="text-sm font-medium text-zinc-300 mb-2">GitHub Repository</p>
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="username/repository" 
                                  value={githubRepo}
                                  onChange={(e) => setGithubRepo(e.target.value)}
                                  className="bg-zinc-800 border-zinc-700 text-zinc-300"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={handleConnectGitRepo}
                                  className="whitespace-nowrap"
                                >
                                  <Github className="h-3.5 w-3.5 mr-2" />
                                  Connect
                                </Button>
                              </div>
                            </div>
                            
                            {/* Branch Management */}
                            <div className="rounded-md border border-zinc-700 p-3">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-sm font-medium text-zinc-300 mb-1">Current Branch</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">{branchName}</span>
                                    <Button variant="outline" size="sm" className="text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 h-7">
                                      <GitBranch className="h-3.5 w-3.5 mr-1" />
                                      Switch
                                    </Button>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 h-7"
                                >
                                  <GitPullRequest className="h-3.5 w-3.5 mr-1" />
                                  Pull
                                </Button>
                              </div>
                            </div>
                            
                            {/* Modified Files */}
                            <div className="rounded-md border border-zinc-700 p-3">
                              <p className="text-sm font-medium text-zinc-300 mb-2">Modified Files</p>
                              <div className="space-y-2 mb-3">
                                {files.slice(0, 3).map((file, index) => (
                                  <div 
                                    key={index} 
                                    className="flex items-center justify-between gap-2 text-xs p-1.5 bg-zinc-800 rounded-md text-zinc-300"
                                  >
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                      <span>{file.name}</span>
                                    </div>
                                    <div className="text-zinc-500 text-xs">Modified</div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="commit-message" className="text-zinc-300 text-sm">Commit Message</Label>
                                <Input 
                                  id="commit-message"
                                  value={commitMessage}
                                  onChange={(e) => setCommitMessage(e.target.value)}
                                  placeholder="Enter commit message..."
                                  className="bg-zinc-800 border-zinc-700 text-zinc-300"
                                />
                                <Button 
                                  className="w-full" 
                                  variant="default"
                                  size="sm" 
                                  onClick={handleCommit}
                                  disabled={!commitMessage.trim() || isPushing}
                                >
                                  <GitCommit className="h-3.5 w-3.5 mr-2" />
                                  {isPushing ? "Committing..." : "Commit Changes"}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Recent Commits */}
                            <div className="rounded-md border border-zinc-700 p-3">
                              <p className="text-sm font-medium text-zinc-300 mb-2">Recent Commits</p>
                              <div className="space-y-2">
                                <div className="text-xs p-2 bg-zinc-800 rounded-md">
                                  <div className="flex items-center justify-between text-zinc-300">
                                    <span>Initial commit</span>
                                    <span className="text-zinc-500">2 hours ago</span>
                                  </div>
                                  <p className="text-zinc-500 mt-1 border-t border-zinc-700 pt-1">Initial project setup</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    )}
                  </div>
                </Tabs>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>
    </>
  );
};

export default EditorPanel;
