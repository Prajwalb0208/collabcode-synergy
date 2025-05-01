
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { socketService } from "@/services/socketService";
import { generateRoomId } from "@/lib/utils";
import { CodeFile, Participant, ChatMessage, VisiblePanels } from "../types";

export function useRoomState() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
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
  
  const [terminal, setTerminal] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("main.js");
  const [visiblePanels, setVisiblePanels] = useState<VisiblePanels>({
    editor: true,
    terminal: true,
    git: true,
    videos: true,
    collaboration: false
  });
  
  const [showFileExplorer, setShowFileExplorer] = useState(true);
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
  const [cursorPositions, setCursorPositions] = useState<{
    [userId: string]: { line: number; column: number; fileName: string }
  }>({});

  return {
    roomId,
    navigate,
    location,
    user,
    toast,
    addRoom,
    isRoomOwner,
    isParticipant,
    isPendingApproval,
    requestAccess,
    approveAccess,
    denyAccess,
    getRoom,
    updateRoomFiles,
    currentFile,
    setCurrentFile,
    files,
    setFiles,
    terminal,
    setTerminal,
    isChatOpen,
    setIsChatOpen,
    activeTab,
    setActiveTab,
    visiblePanels,
    setVisiblePanels,
    showFileExplorer,
    setShowFileExplorer,
    folders,
    setFolders,
    accessRequests,
    setAccessRequests,
    participants,
    setParticipants,
    chatMessages,
    setChatMessages,
    showAccessDialog,
    setShowAccessDialog,
    currentRequest,
    setCurrentRequest,
    sessionName,
    setSessionName,
    autoSave,
    setAutoSave,
    lastSavedTime,
    setLastSavedTime,
    isAutoJoining,
    setIsAutoJoining,
    sessionLoaded,
    setSessionLoaded,
    liveCursorPositions,
    setLiveCursorPositions,
    screenSharingUser,
    setScreenSharingUser,
    cursorPositions,
    setCursorPositions
  };
}
