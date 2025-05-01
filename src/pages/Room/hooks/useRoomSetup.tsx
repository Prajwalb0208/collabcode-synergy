
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socketService } from "@/services/socketService";
import { generateRoomId } from "@/lib/utils";

export function useRoomSetup({
  roomId,
  user,
  navigate,
  location,
  isRoomOwner,
  isParticipant,
  isPendingApproval,
  addRoom,
  getRoom,
  toast,
  setSessionName,
  files,
  setFiles,
  currentFile,
  setCurrentFile,
  setActiveTab,
  sessionLoaded,
  setSessionLoaded,
  setIsAutoJoining,
  handleRequestAccess
}) {
  // Ref for editor container to track mouse movements
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // Initial setup effect for room ID, title, and direct join
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
        }
      }
    }
  }, [roomId, navigate, getRoom, toast, user, location, isRoomOwner, isParticipant, isPendingApproval, sessionLoaded]);

  return { editorContainerRef };
}
