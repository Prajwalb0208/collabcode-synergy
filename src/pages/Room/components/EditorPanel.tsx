
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeEditor from "@/components/CodeEditor";
import FileExplorer from "@/components/FileExplorer";
import { CodeFile } from "../types";
import EditorTabBar from "./EditorTabBar";
import TerminalPanel from "./TerminalPanel";
import GitPanel from "./GitPanel";
import { Terminal, GitBranch } from "lucide-react";

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
  editable?: boolean;
  onDeleteFile?: (fileName: string) => void;
  onRenameFile?: (oldName: string, newName: string) => void;
  onCursorPositionChange?: (line: number, column: number) => void;
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
  visiblePanels,
  editable = true,
  onDeleteFile,
  onRenameFile,
  onCursorPositionChange
}) => {
  return (
    <div className="h-full flex flex-col">
      <EditorTabBar 
        files={files}
        activeTab={activeTab}
        onTabChange={(tab) => {
          const selectedFile = files.find(f => f.name === tab);
          if (selectedFile) handleFileClick(selectedFile);
        }}
        currentFile={currentFile}
        onRenameFile={onRenameFile}
        onDeleteFile={onDeleteFile}
      />
      
      <ResizablePanelGroup direction="vertical" className="h-full overflow-hidden border">
        {/* Editor Content */}
        <ResizablePanel defaultSize={70} minSize={30} className="relative flex-grow">
          <div className="h-full">
            <CodeEditor 
              code={currentFile.content || ""}
              onChange={handleCodeChange}
              language={currentFile.language || "javascript"}
              readOnly={false} // Force editor to be editable
              onCursorPositionChange={onCursorPositionChange}
            />
          </div>
        </ResizablePanel>
        
        {/* Terminal and Git Panels */}
        {(visiblePanels.terminal || visiblePanels.git) && (
          <>
            <ResizableHandle withHandle className="bg-muted/50 hover:bg-muted transition-colors" />
            
            <ResizablePanel defaultSize={30} minSize={15}>
              <Tabs defaultValue="terminal" className="h-full flex flex-col">
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
                </TabsList>
                
                <div className="flex-1 overflow-hidden">
                  {/* Terminal Tab Content */}
                  {visiblePanels.terminal && (
                    <TabsContent value="terminal" className="h-full flex flex-col m-0 data-[state=active]:flex-1 p-0 border-0">
                      <TerminalPanel 
                        terminal={terminal}
                        handleRunCode={handleRunCode}
                      />
                    </TabsContent>
                  )}
                  
                  {/* Git Tab Content */}
                  {visiblePanels.git && (
                    <TabsContent value="git" className="p-0 data-[state=active]:flex-1 border-0 bg-zinc-900 h-full">
                      <GitPanel files={files} />
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default EditorPanel;
