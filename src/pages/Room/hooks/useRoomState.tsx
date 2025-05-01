
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRoomHistory } from '@/contexts/RoomHistoryContext';
import { useToast } from '@/components/ui/use-toast';
import { nanoid } from 'nanoid';

// Initial set of files
const initialFiles = [
  {
    name: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello, World!</h1>
  <script src="script.js"></script>
</body>
</html>`,
    language: 'html'
  },
  {
    name: 'styles.css',
    content: `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
}`,
    language: 'css'
  },
  {
    name: 'script.js',
    content: `// JavaScript code
console.log('Hello from script.js');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
});`,
    language: 'javascript'
  }
];

export const useRoomState = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const joinParam = searchParams.get('join');
  const isJoining = joinParam === 'true';

  // Authentication and room context
  const { user } = useAuth();
  const { 
    rooms, 
    addRoom, 
    getRoom,
    updateRoomFiles,
    requestAccess,
    approveAccess,
    denyAccess,
    isRoomOwner,
    isParticipant,
    isPendingApproval
  } = useRoomHistory();
  const { toast } = useToast();
  
  // Room state
  const [files, setFiles] = useState(initialFiles);
  const [folders, setFolders] = useState([]);
  const [activeTab, setActiveTab] = useState('index.html');
  const [currentFile, setCurrentFile] = useState(initialFiles[0]);
  const [terminal, setTerminal] = useState<string[]>([]);
  const [sessionName, setSessionName] = useState(roomId ? `Session-${roomId.substring(0, 5)}` : 'New Session');
  
  // UI state
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [visiblePanels, setVisiblePanels] = useState({
    terminal: true,
    videos: true,
    git: false,
    settings: false
  });
  
  // Auto save
  const [autoSave, setAutoSave] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  // Access control
  const [accessRequests, setAccessRequests] = useState<Array<{userId: string, userName: string}>>([]);
  const [currentRequest, setCurrentRequest] = useState<{userId: string, userName: string} | null>(null);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [isAutoJoining, setIsAutoJoining] = useState(isJoining);
  
  // Real-time cursor tracking
  const [cursorPositions, setCursorPositions] = useState<Record<string, {userId: string, line: number, column: number, fileName: string}>>({});
  const [liveCursorPositions, setLiveCursorPositions] = useState<Record<string, {x: number, y: number, userName: string}>>({});
  
  // User state
  const [participants, setParticipants] = useState<Array<{id: string, name: string, role: string, avatar?: string}>>([]);
  const [screenSharingUser, setScreenSharingUser] = useState<string | null>(null);

  // Load room data
  useEffect(() => {
    if (roomId && user) {
      const roomData = getRoom(roomId);
      
      if (roomData) {
        setFiles(roomData.files || initialFiles);
        setFolders(roomData.folders || []);
        setSessionName(roomData.name || `Session-${roomId.substring(0, 5)}`);
        
        // Initialize with the first file as current
        if (roomData.files && roomData.files.length > 0) {
          setCurrentFile(roomData.files[0]);
          setActiveTab(roomData.files[0].name);
        }
        
        // Add room owner as participant
        setParticipants([{
          id: roomData.owner,
          name: roomData.ownerName || 'Owner',
          role: 'owner',
          avatar: roomData.ownerAvatar
        }]);
        
        // If the current user is the owner, add them to participants
        if (isRoomOwner(roomId) && user) {
          setParticipants(prev => {
            if (prev.some(p => p.id === user.id)) {
              return prev;
            }
            return [{
              id: user.id,
              name: user.name || user.email || 'You',
              role: 'owner',
              avatar: user.avatar
            }];
          });
        }
        // If the current user is a participant, add them too
        else if (isParticipant(roomId) && user) {
          setParticipants(prev => {
            if (prev.some(p => p.id === user.id)) {
              return prev;
            }
            return [...prev, {
              id: user.id,
              name: user.name || user.email || 'You',
              role: 'participant',
              avatar: user.avatar
            }];
          });
        }
      } 
      // Create a new room if none exists
      else if (!roomId || roomId === 'new') {
        const newRoomId = nanoid(8);
        
        // If user navigated to /new-room, create a new one and redirect
        if (window.location.pathname === '/new-room' && user) {
          addRoom({
            id: newRoomId,
            name: `Session-${newRoomId.substring(0, 5)}`,
            owner: user.id,
            ownerName: user.name || user.email,
            ownerAvatar: user.avatar,
            files: initialFiles,
            folders: [],
            participants: [],
            createdAt: new Date(),
            lastUpdated: new Date()
          });
          
          // Navigate to the new room
          window.history.replaceState({}, '', `/room/${newRoomId}`);
        }
      }
    }
  }, [roomId, user, getRoom, addRoom, isRoomOwner, isParticipant]);

  return {
    roomId,
    user,
    files,
    setFiles,
    folders,
    setFolders,
    activeTab,
    setActiveTab,
    currentFile,
    setCurrentFile,
    terminal,
    setTerminal,
    showFileExplorer,
    setShowFileExplorer,
    visiblePanels,
    setVisiblePanels,
    autoSave,
    setAutoSave,
    lastSavedTime,
    setLastSavedTime,
    accessRequests,
    setAccessRequests,
    currentRequest,
    setCurrentRequest,
    showAccessDialog,
    setShowAccessDialog,
    isAutoJoining,
    setIsAutoJoining,
    cursorPositions,
    setCursorPositions,
    liveCursorPositions,
    setLiveCursorPositions,
    participants,
    setParticipants,
    screenSharingUser,
    setScreenSharingUser,
    sessionName,
    setSessionName,
    toast,
    updateRoomFiles,
    isRoomOwner,
    isParticipant,
    isPendingApproval,
    requestAccess,
    approveAccess,
    denyAccess
  };
};
