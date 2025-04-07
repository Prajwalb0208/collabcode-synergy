
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from "@/components/ui/use-toast";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import RoomHeader from "./components/RoomHeader";
import PanelToggleBar from "./components/PanelToggleBar";
import EditorPanel from "./components/EditorPanel";
import CollaborationSidebar from "./components/CollaborationSidebar";
import AccessRequest from "./components/AccessRequest";
import PendingApproval from "./components/PendingApproval";
import { CodeFile, VisiblePanels } from "./types";
import { socketService } from "@/services/socketService";

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { 
    addRoom, 
    isRoomOwner, 
    isParticipant, 
    isPendingApproval, 
    requestAccess 
  } = useRoomHistory();
  const [currentFile, setCurrentFile] = useState<CodeFile>({
    name: "main.js",
    language: "javascript",
    content: "// Welcome to CollabCode!\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));"
  });
  const [files, setFiles] = useState<CodeFile[]>([
    {
      name: "main.js",
      language: "javascript",
      content: "// Welcome to CollabCode!\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));"
    },
    {
      name: "index.html",
      language: "html",
      content: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Document</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src=\"main.js\"></script>\n</body>\n</html>"
    },
    {
      name: "styles.css",
      language: "css",
      content: "body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: navy;\n}"
    }
  ]);
  const { toast } = useToast();
  const [terminal, setTerminal] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("main.js");
  const [visiblePanels, setVisiblePanels] = useState<VisiblePanels>({
    editor: true,
    terminal: true,
    videos: true,
    ai: true
  });
  const [showFileExplorer, setShowFileExplorer] = useState(true);

  useEffect(() => {
    if (roomId && user) {
      addRoom(roomId);
      
      // Listen for file updates from other users
      socketService.on("file-update", (data) => {
        if (data.files) {
          setFiles(data.files);
          const updatedCurrentFile = data.files.find((f: CodeFile) => f.name === currentFile.name);
          if (updatedCurrentFile) {
            setCurrentFile(updatedCurrentFile);
          }
        }
      });
      
      // Listen for file selection from other users
      socketService.on("file-selected", (data) => {
        const selectedFile = files.find(f => f.name === data.fileName);
        if (selectedFile) {
          setCurrentFile(selectedFile);
          setActiveTab(selectedFile.name);
        }
      });
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [roomId, addRoom, user, files, currentFile.name]);

  const handleCodeChange = (newCode: string) => {
    setCurrentFile({
      ...currentFile,
      content: newCode
    });
    
    const updatedFiles = files.map(file => 
      file.name === currentFile.name 
        ? { ...file, content: newCode } 
        : file
    );
    
    setFiles(updatedFiles);
    
    // Emit file update to other users
    if (roomId) {
      socketService.emit("file-update", { files: updatedFiles, roomId });
    }
  };

  const handleRunCode = async () => {
    const { executeCode } = await import('@/services/codeExecutor');
    
    setTerminal([]);
    
    const output = executeCode(currentFile.content, currentFile.language);
    
    setTerminal(output);
    
    toast({
      title: "Code Execution",
      description: "Code executed in terminal.",
    });
  };

  const handleRequestAccess = () => {
    if (roomId) {
      requestAccess(roomId);
      toast({
        title: "Access requested",
        description: "Waiting for the room owner to approve your request.",
      });
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const togglePanelVisibility = (panel: keyof VisiblePanels) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  const handleFileClick = (file: CodeFile) => {
    setCurrentFile(file);
    setActiveTab(file.name);
    
    // Emit file selection to other users
    if (roomId) {
      socketService.emit("file-selected", { fileName: file.name, roomId });
    }
  };

  // Create a new file
  const handleCreateFile = (fileName: string, language: string, content: string = "") => {
    const newFile: CodeFile = {
      name: fileName,
      language,
      content: content || `// New ${language} file`
    };
    
    setFiles(prev => [...prev, newFile]);
    setCurrentFile(newFile);
    setActiveTab(fileName);
    
    // Emit file update to other users
    if (roomId) {
      socketService.emit("file-update", { files: [...files, newFile], roomId });
    }
    
    toast({
      title: "File Created",
      description: `Created new file: ${fileName}`,
    });
  };

  // Handle access control
  if (roomId && user && !isRoomOwner(roomId) && !isParticipant(roomId)) {
    if (isPendingApproval(roomId)) {
      return <PendingApproval />;
    }
    
    return <AccessRequest roomId={roomId} onRequestAccess={handleRequestAccess} />;
  }

  return (
    <MainLayout>
      <div className="container h-[calc(100vh-5rem)] py-4">
        <RoomHeader 
          roomId={roomId} 
          handleRunCode={handleRunCode}
          showFileExplorer={showFileExplorer}
          setShowFileExplorer={setShowFileExplorer}
          onCreateFile={handleCreateFile}
        />

        <PanelToggleBar 
          visiblePanels={visiblePanels}
          togglePanelVisibility={togglePanelVisibility}
        />

        <div className="h-[calc(100vh-12rem)]">
          <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg overflow-hidden">
            <EditorPanel
              showFileExplorer={showFileExplorer}
              files={files}
              activeTab={activeTab}
              handleFileClick={handleFileClick}
              currentFile={currentFile}
              handleCodeChange={handleCodeChange}
              terminal={terminal}
              handleRunCode={handleRunCode}
              projectFiles={files}
              onCreateFile={handleCreateFile}
            />

            {(visiblePanels.videos || visiblePanels.ai) && (
              <CollaborationSidebar
                visiblePanels={visiblePanels}
                isChatOpen={isChatOpen}
                toggleChat={toggleChat}
                roomId={roomId || ""}
                isRoomOwner={roomId ? isRoomOwner(roomId) : false}
                currentFile={currentFile}
                files={files}
              />
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </MainLayout>
  );
};

export default Room;
