
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    addRoom, 
    isRoomOwner, 
    isParticipant, 
    isPendingApproval, 
    requestAccess,
    approveAccess,
    denyAccess
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
  const [folders, setFolders] = useState<string[]>([]);
  const [accessRequests, setAccessRequests] = useState<{userId: string, userName: string}[]>([]);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<{userId: string, userName: string} | null>(null);
  const [sessionName, setSessionName] = useState<string>("Collaborative Session");

  // Generate a new room ID if one isn't provided
  useEffect(() => {
    if (!roomId) {
      const newRoomId = generateRoomId();
      navigate(`/room/${newRoomId}`, { replace: true });
    } else {
      // Set the document title with the room ID
      document.title = `Room: ${roomId} | CollabCode`;
    }
  }, [roomId, navigate]);
  
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  useEffect(() => {
    if (roomId && user) {
      addRoom(roomId);
      
      // Connect to the socket room
      socketService.connect(roomId, user.id);
      
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
      
      // Listen for folder updates
      socketService.on("folder-update", (data) => {
        if (data.folders) {
          setFolders(data.folders);
        }
      });
      
      // Listen for access requests
      socketService.on("access-request", (data) => {
        if (roomId && isRoomOwner(roomId)) {
          setAccessRequests(prev => {
            if (prev.some(req => req.userId === data.userId)) {
              return prev;
            }
            return [...prev, { userId: data.userId, userName: data.userName || data.userId }];
          });
          
          // Show the access request dialog
          setCurrentRequest({ userId: data.userId, userName: data.userName || data.userId });
          setShowAccessDialog(true);
          
          toast({
            title: "Access Request",
            description: `${data.userName || data.userId} is requesting access to join the room`,
          });
        }
      });
      
      // Listen for access responses
      socketService.on("access-response", (data) => {
        if (data.approved) {
          toast({
            title: "Access Approved",
            description: "Your request to join the room has been approved",
          });
        } else {
          toast({
            title: "Access Denied",
            description: "Your request to join the room has been denied",
            variant: "destructive"
          });
        }
      });
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [roomId, addRoom, user, files, currentFile.name, isRoomOwner]);

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
    if (roomId && user) {
      requestAccess(roomId);
      socketService.requestAccess(user.id, user.name || user.email || user.id);
      
      toast({
        title: "Access requested",
        description: "Waiting for the room owner to approve your request.",
      });
    }
  };

  const handleApproveAccess = (userId: string) => {
    if (roomId) {
      approveAccess(roomId, userId);
      socketService.respondToAccessRequest(userId, true);
      
      // Remove the request from the list
      setAccessRequests(prev => prev.filter(req => req.userId !== userId));
      
      // Close the dialog if it's the current request
      if (currentRequest && currentRequest.userId === userId) {
        setCurrentRequest(null);
        setShowAccessDialog(false);
      }
    }
  };

  const handleDenyAccess = (userId: string) => {
    if (roomId) {
      denyAccess(roomId, userId);
      socketService.respondToAccessRequest(userId, false);
      
      // Remove the request from the list
      setAccessRequests(prev => prev.filter(req => req.userId !== userId));
      
      // Close the dialog if it's the current request
      if (currentRequest && currentRequest.userId === userId) {
        setCurrentRequest(null);
        setShowAccessDialog(false);
      }
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
    // Check if file already exists
    if (files.some(file => file.name === fileName)) {
      toast({
        title: "Error",
        description: `File ${fileName} already exists`,
        variant: "destructive"
      });
      return;
    }
    
    const newFile: CodeFile = {
      name: fileName,
      language,
      content: content || (language === 'html' ? 
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>New Document</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>" : 
        `// New ${language} file`)
    };
    
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setCurrentFile(newFile);
    setActiveTab(fileName);
    
    // Emit file update to other users
    if (roomId) {
      socketService.emit("file-update", { files: updatedFiles, roomId });
    }
    
    toast({
      title: "File Created",
      description: `Created new file: ${fileName}`,
    });
  };
  
  // Create a new folder
  const handleCreateFolder = (folderName: string) => {
    // Check if folder already exists
    if (folders.includes(folderName)) {
      toast({
        title: "Error",
        description: `Folder ${folderName} already exists`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedFolders = [...folders, folderName];
    setFolders(updatedFolders);
    
    // Emit folder update to other users
    if (roomId) {
      socketService.emit("folder-update", { folders: updatedFolders, roomId });
    }
    
    toast({
      title: "Folder Created",
      description: `Created new folder: ${folderName}`,
    });
  };
  
  // Update session name
  const handleUpdateSessionName = (name: string) => {
    setSessionName(name);
    
    // In a real implementation, you would emit this to other users
    if (roomId) {
      socketService.emit("session-update", { name, roomId });
    }
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
          sessionName={sessionName}
          onUpdateSessionName={handleUpdateSessionName}
          isOwner={roomId ? isRoomOwner(roomId) : true}
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
              onCreateFolder={handleCreateFolder}
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
                accessRequests={accessRequests}
                onApproveAccess={handleApproveAccess}
                onDenyAccess={handleDenyAccess}
              />
            )}
          </ResizablePanelGroup>
        </div>
      </div>
      
      {/* Access Request Dialog */}
      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Request</DialogTitle>
            <DialogDescription>
              {currentRequest?.userName} is requesting to join this room.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentRequest) {
                  handleDenyAccess(currentRequest.userId);
                }
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Deny
            </Button>
            <Button 
              onClick={() => {
                if (currentRequest) {
                  handleApproveAccess(currentRequest.userId);
                }
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Room;
