
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Terminal, Play, FilePlus } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import FileExplorer from "@/components/FileExplorer";
import { CodeFile } from "../types";

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
              <div className="terminal-container p-2 text-zinc-300 font-mono text-sm h-[calc(100%-40px)] overflow-auto custom-scrollbar">
                {terminal.length === 0 ? (
                  <div className="text-zinc-500 italic p-2">
                    Terminal ready. Click 'Run' to execute your code.
                  </div>
                ) : (
                  terminal.map((line, i) => (
                    <div key={i} className="mb-1 whitespace-pre-wrap">
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </>
  );
};

export default EditorPanel;
