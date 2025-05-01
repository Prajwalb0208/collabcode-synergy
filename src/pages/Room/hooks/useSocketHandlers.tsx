
import { useEffect } from 'react';
import { socketService } from "@/services/socketService";

export function useSocketHandlers({
  roomId,
  user,
  files,
  setFiles,
  currentFile,
  setCurrentFile,
  addRoom,
  updateRoomFiles,
  isRoomOwner,
  autoSave,
  setLastSavedTime,
  setAccessRequests,
  setCurrentRequest,
  setShowAccessDialog,
  toast,
  setFolders,
  setParticipants,
  setCursorPositions,
  setLiveCursorPositions,
  screenSharingUser,
  setScreenSharingUser,
  editorContainerRef
}) {
  // Socket connection and event handling
  useEffect(() => {
    if (roomId && user) {
      addRoom(roomId);
      
      socketService.connect(roomId, user.id);
      
      socketService.on("file-update", (data) => {
        if (data.files) {
          setFiles(data.files);
          const updatedCurrentFile = data.files.find((f) => f.name === currentFile.name);
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
      }, 60000); // Once per minute
      
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
  }, [roomId, addRoom, user, files, currentFile, isRoomOwner, updateRoomFiles, autoSave, screenSharingUser]);
}
