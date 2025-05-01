import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from "@/components/ui/use-toast";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MainLayout from "@/layouts/MainLayout";
import RoomHeader from "./components/RoomHeader";
import PanelToggleBar from "./components/PanelToggleBar";
import EditorPanel from "./components/EditorPanel";
import Chat from "@/components/Chat";
import AccessRequest from "./components/AccessRequest";
import PendingApproval from "./components/PendingApproval";
import { CodeFile, VisiblePanels, Participant, ChatMessage } from "./types";
import { socketService } from "@/services/socketService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Check, X, MessageSquare } from "lucide-react";
import { generateRoomId } from "@/lib/utils";
import CollaborationSidebar from "./components/CollaborationSidebar";
import LiveCursors from "./components/LiveCursors";

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { 
    addRoom, 
    isRoomOwner, 
    isParticipant, 
    isPendingApproval, 
    requestAccess,
    approveAccess,
    denyAccess,
    getRoom,
    updateRoomFiles
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
    git: true,
    videos: true,
    collaboration: true
  });
  
  const [showFileExplorer, setShowFileExplorer] = useState(!isMobile);
  const [folders, setFolders] = useState<string[]>([]);
  const [accessRequests, setAccessRequests] = useState<{userId: string, userName: string}[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<{userId: string, userName: string} | null>(null);
  const [sessionName, setSessionName] = useState<string>("Collaborative Session");
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isAutoJoining, setIsAutoJoining] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [liveCursorPositions, setLiveCursorPositions] = useState<Record<string, { x: number; y: number; userName: string }>>({});
  const [screenSharingUser, setScreenSharingUser] = useState<string | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // Track cursor positions of participants
  const [cursorPositions, setCursorPositions] = useState<{
    [userId: string]: { line: number; column: number; fileName: string }
  }>({});
  
  useEffect(() => {
    if (!roomId) {
      const newRoomId = generateRoomId();
      navigate(`/room/${newRoomId}`, { replace: true });
    } else {
      document.title = `Room: ${roomId} | CollabCode`;
      
      const queryParams = new URLSearchParams(location.search);
      const directJoin = queryParams.get('join') === 'true';
      
      if (directJoin && user && !isRoomOwner(roomId) && !isParticipant(roomId) && !isPendingApproval(roomId)) {
        setIsAutoJoining(true);
        handleRequestAccess();
      }
      
      const existingRoom = getRoom(roomId);
      if (existingRoom) {
        setSessionName(existingRoom.name || "Collaborative Session");
        
        if (existingRoom.files && existingRoom.files.length > 0) {
          setFiles(existingRoom.files);
          const mainFile = existingRoom.files.find(f => f.name === "main.js") || existingRoom.files[0];
          setCurrentFile(mainFile);
          setActiveTab(mainFile.name);
          
          // Only show toast once when session is loaded
          if (!sessionLoaded) {
            toast({
              title: "Session Loaded",
              description: "Your previous work has been restored.",
            });
            setSessionLoaded(true);
          }
          
          setLastSavedTime(new Date());
        }
      }
    }
  }, [roomId, navigate, getRoom, toast, user, location, isRoomOwner, isParticipant, isPendingApproval, sessionLoaded]);

  useEffect(() => {
    if (roomId && user) {
      addRoom(roomId);
      
      socketService.connect(roomId, user.id);
      
      socketService.on("file-update", (data) => {
        if (data.files) {
          setFiles(data.files);
          const updatedCurrentFile = data.files.find((f: CodeFile) => f.name === currentFile.name);
          if (updatedCurrentFile) {
            setCurrentFile(updatedCurrentFile);
          }
          
          if (autoSave) {
            updateRoomFiles(roomId, data.files);
            setLastSavedTime(new Date());
          }
        }
      });
      
      socketService.on("file-selected", (data) => {
        const selectedFile = files.find(f => f.name === data.fileName);
        if (selectedFile) {
          setCurrentFile(selectedFile);
          setActiveTab(selectedFile.name);
        }
      });
      
      socketService.on("folder-update", (data) => {
        if (data.folders) {
          setFolders(data.folders);
        }
      });
      
      socketService.on("access-request", (data) => {
        if (roomId && isRoomOwner(roomId)) {
          setAccessRequests(prev => {
            if (prev.some(req => req.userId === data.userId)) {
              return prev;
            }
            return [...prev, { userId: data.userId, userName: data.userName || data.userId }];
          });
          
          setCurrentRequest({ userId: data.userId, userName: data.userName || data.userId });
          setShowAccessDialog(true);
          
          toast({
            title: "Access Request",
            description: `${data.userName || data.userId} is requesting access to join the room`,
          });
        }
      });
      
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
      
      socketService.on("session-update", (data) => {
        if (data.name) {
          setSessionName(data.name);
        }
      });

      // Handle cursor position updates
      socketService.on("cursor-position", (data) => {
        if (data.userId && data.userId !== user.id) {
          setCursorPositions(prev => ({
            ...prev,
            [data.userId]: {
              line: data.line,
              column: data.column,
              fileName: data.fileName
            }
          }));
          
          // Update participant info with cursor position
          setParticipants(prev => 
            prev.map(p => 
              p.id === data.userId 
                ? { ...p, cursorPosition: { line: data.line, column: data.column, fileName: data.fileName } }
                : p
            )
          );
        }
      });
      
      // Handle live cursor movements
      socketService.on("mouse-position", (data) => {
        if (data.userId && data.userId !== user.id) {
          setLiveCursorPositions(prev => ({
            ...prev,
            [data.userId]: {
              x: data.x,
              y: data.y,
              userName: data.userName || data.userId
            }
          }));
        }
      });
      
      // Handle screen sharing
      socketService.on("screen-share-start", (data) => {
        setScreenSharingUser(data.userId);
        
        // If someone else is sharing screen, show toast notification
        if (data.userId !== user.id) {
          toast({
            title: "Screen Sharing",
            description: `${data.userName || 'A participant'} has started sharing their screen`,
          });
        }
      });
      
      socketService.on("screen-share-stop", (data) => {
        if (screenSharingUser === data.userId) {
          setScreenSharingUser(null);
        }
      });
      
      // Remove user's cursor when they leave
      socketService.on("user-left", (data) => {
        setParticipants(prev => 
          prev.filter(p => p.id !== data.userId)
        );
        
        // Also remove their cursor position
        setCursorPositions(prev => {
          const newPositions = { ...prev };
          delete newPositions[data.userId];
          return newPositions;
        });
        
        // Remove live cursor
        setLiveCursorPositions(prev => {
          const newPositions = { ...prev };
          delete newPositions[data.userId];
          return newPositions;
        });
        
        // If screen sharing user leaves, reset screen sharing state
        if (screenSharingUser === data.userId) {
          setScreenSharingUser(null);
        }
        
        toast({
          title: "User Left",
          description: `${data.userName || data.userId} left the room`,
        });
      });
      
      // Handle mouse movement for live cursor tracking
      const handleMouseMove = (e: MouseEvent) => {
        if (editorContainerRef.current && user) {
          const { left, top } = editorContainerRef.current.getBoundingClientRect();
          const x = e.clientX - left;
          const y = e.clientY - top;
          
          socketService.emitMousePosition(x, y, user.name || user.email || user.id);
        }
      };
      
      // Only track mouse movements inside the editor
      if (editorContainerRef.current) {
        editorContainerRef.current.addEventListener('mousemove', handleMouseMove);
      }
      
      // Save interval reduced to prevent excessive saves
      const saveInterval = setInterval(() => {
        if (autoSave && roomId && files.length > 0) {
          updateRoomFiles(roomId, files);
          setLastSavedTime(new Date());
        }
      }, 60000); // Reduced to once per minute
      
      return () => {
        socketService.disconnect();
        clearInterval(saveInterval);
        
        if (editorContainerRef.current) {
          editorContainerRef.current.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [roomId, addRoom, user, files, currentFile.name, isRoomOwner, updateRoomFiles, autoSave, participants, screenSharingUser]);

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
    
    if (roomId) {
      socketService.emit("file-update", { files: updatedFiles, roomId });
      
      if (autoSave) {
        const now = new Date();
        const timeSinceLastSave = lastSavedTime ? now.getTime() - lastSavedTime.getTime() : 60000;
        
        if (timeSinceLastSave > 5000) {
          updateRoomFiles(roomId, updatedFiles);
          setLastSavedTime(now);
          
          if (!lastSavedTime || timeSinceLastSave > 300000) {
            toast({
              title: "Changes Saved",
              description: "All your changes have been automatically saved.",
            });
          }
        }
      }
    }
  };
  
  // Track cursor position in editor
  const handleCursorPositionChange = (line: number, column: number) => {
    if (roomId && user) {
      socketService.emit("cursor-position", { 
        roomId, 
        userId: user.id, 
        userName: user.name || user.email || user.id,
        line, 
        column,
        fileName: currentFile.name
      });
    }
  };

  const handleManualSave = () => {
    if (roomId) {
      updateRoomFiles(roomId, files);
      setLastSavedTime(new Date());
      
      toast({
        title: "Session Saved",
        description: "Your work has been saved successfully.",
      });
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
      
      setAccessRequests(prev => prev.filter(req => req.userId !== userId));
      
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
      
      setAccessRequests(prev => prev.filter(req => req.userId !== userId));
      
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
    
    if (roomId) {
      socketService.emit("file-selected", { fileName: file.name, roomId });
    }
  };

  // Enhanced file creation function that supports folder paths
  const handleCreateFile = (fileName: string, language: string, folderId?: string, content: string = "") => {
    if (files.some(file => file.name === fileName)) {
      toast({
        title: "Error",
        description: `File ${fileName} already exists`,
        variant: "destructive"
      });
      return;
    }
    
    let fileContent = content;
    if (!content) {
      if (language === 'html') {
        fileContent = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>New Document</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>";
      } else {
        fileContent = `// New ${language} file`;
      }
    }
    
    const newFile: CodeFile = {
      name: fileName,
      language,
      content: fileContent
    };
    
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setCurrentFile(newFile);
    setActiveTab(fileName);
    
    if (roomId) {
      socketService.emit("file-update", { files: updatedFiles, roomId });
      
      updateRoomFiles(roomId, updatedFiles);
      setLastSavedTime(new Date());
    }
    
    toast({
      title: "File Created",
      description: `Created new file: ${fileName}`,
    });
  };
  
  // Enhanced folder creation function that supports parent folders
  const handleCreateFolder = (folderName: string, parentId?: string) => {
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
    
    if (roomId) {
      socketService.emit("folder-update", { folders: updatedFolders, roomId });
    }
    
    toast({
      title: "Folder Created",
      description: `Created new folder: ${folderName}`,
    });
  };
  
  // New function to handle moving files between folders
  const handleMoveFile = (fileId: string, targetFolderId: string) => {
    // In a real implementation, this would update the file path
    // For now we'll just show a toast
    toast({
      title: "File Moved",
      description: "File has been moved to the selected folder",
    });
    
    if (roomId) {
      socketService.emit("file-moved", { 
        fileId, 
        targetFolderId,
        roomId 
      });
    }
  };
  
  const handleUpdateSessionName = (name: string) => {
    setSessionName(name);
    
    if (roomId) {
      socketService.emit("session-update", { name, roomId });
    }
  };

  const toggleAutoSave = () => {
    setAutoSave(!autoSave);
    
    toast({
      title: autoSave ? "Auto-Save Disabled" : "Auto-Save Enabled",
      description: autoSave ? "You'll need to save manually" : "Changes will be saved automatically",
    });
    
    if (!autoSave && roomId) {
      updateRoomFiles(roomId, files);
      setLastSavedTime(new Date());
    }
  };

  const copySessionCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast({
        title: "Session code copied",
        description: "Share this code with others to join your session",
      });
    }
  };
  
  const handleSendChatMessage = (message: string) => {
    if (roomId && user && message.trim()) {
      // Find user's color from participants list
      const currentUser = participants.find(p => p.id === user.id) || {
        id: user.id,
        name: user.name || user.email || user.id,
        color: getRandomColor(),
        status: 'active'
      };
      
      const newMessage: ChatMessage = {
        id: `${Date.now()}-${user.id}`,
        userId: user.id,
        userName: currentUser.name,
        userColor: currentUser.color,
        text: message,
        timestamp: new Date()
      };
      
      // Add message to local state
      setChatMessages(prev => [...prev, newMessage]);
      
      // Send message to others
      socketService.emit("chat-message", {
        roomId,
        userId: user.id,
        userName: currentUser.name,
        text: message,
        timestamp: new Date()
      });
    }
  };
  
  // Get random color for participants
  const getRandomColor = () => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (roomId && user && !isRoomOwner(roomId) && !isParticipant(roomId)) {
    if (isPendingApproval(roomId)) {
      return <PendingApproval />;
    }
    
    if (isAutoJoining) {
      return <PendingApproval autoJoined={true} />;
    }
    
    return <AccessRequest roomId={roomId} onRequestAccess={handleRequestAccess} />;
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-5rem)] w-screen max-w-full">
        <RoomHeader 
          roomId={roomId} 
          handleRunCode={handleRunCode}
          showFileExplorer={showFileExplorer}
          setShowFileExplorer={setShowFileExplorer}
          onCreateFile={handleCreateFile}
          sessionName={sessionName}
          onUpdateSessionName={handleUpdateSessionName}
          isOwner={roomId ? isRoomOwner(roomId) : true}
          onCopySessionCode={copySessionCode}
          onSaveSession={handleManualSave}
          autoSave={autoSave}
          onToggleAutoSave={toggleAutoSave}
          lastSavedTime={lastSavedTime}
          participants={participants}
          onToggleChat={toggleChat}
        />

        <div className="px-2 md:px-4">
          <PanelToggleBar 
            visiblePanels={visiblePanels}
            togglePanelVisibility={togglePanelVisibility}
          />
        </div>

        <div className="h-[calc(100vh-10rem)] px-2 md:px-4 pb-4">
          <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg overflow-hidden">
            <div ref={editorContainerRef} className="relative flex-1">
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
                visiblePanels={visiblePanels}
              />
              <LiveCursors 
                containerRef={editorContainerRef} 
                cursorPositions={liveCursorPositions}
              />
            </div>
            
            {visiblePanels.videos && (
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
        
        {/* Chat floating button for mobile */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="default" 
                size="icon" 
                className="fixed bottom-5 right-5 rounded-full shadow-lg h-12 w-12"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Chat</SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-6rem)]">
                <Chat 
                  roomId={roomId || ""} 
                  messages={chatMessages} 
                  onSendMessage={handleSendChatMessage}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Desktop chat panel */}
        {!isMobile && isChatOpen && (
          <div className="fixed right-4 bottom-4 w-80 h-[500px] bg-background border shadow-lg rounded-lg overflow-hidden z-20 flex flex-col">
            <div className="p-3 border-b bg-muted/40 flex items-center justify-between">
              <h3 className="font-medium">Chat</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleChat}>
                <X className="mr-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat 
                roomId={roomId || ""} 
                messages={chatMessages}
                onSendMessage={handleSendChatMessage}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Access request dialog */}
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
