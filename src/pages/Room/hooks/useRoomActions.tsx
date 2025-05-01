
import { useCallback } from 'react';
import { socketService } from "@/services/socketService";

export function useRoomActions({
  roomId,
  user,
  toast,
  currentFile,
  files,
  requestAccess,
  approveAccess,
  denyAccess,
  updateRoomFiles,
  setLastSavedTime,
  setAccessRequests,
  setCurrentRequest,
  setShowAccessDialog,
  setIsChatOpen,
  setAutoSave,
  autoSave,
  setTerminal
}) {
  // Setup room actions
  const handleRunCode = useCallback(async () => {
    const { executeCode } = await import('@/services/codeExecutor');
    
    setTerminal([]);
    
    const output = executeCode(currentFile.content, currentFile.language);
    
    setTerminal(output);
    
    toast({
      title: "Code Execution",
      description: "Code executed in terminal.",
    });
  }, [currentFile, setTerminal]);

  const handleRequestAccess = useCallback(() => {
    if (roomId && user) {
      requestAccess(roomId);
      socketService.requestAccess(user.id, user.name || user.email || user.id);
      
      toast({
        title: "Access requested",
        description: "Waiting for the room owner to approve your request.",
      });
    }
  }, [roomId, user, requestAccess]);

  const handleApproveAccess = useCallback((userId: string) => {
    if (roomId) {
      approveAccess(roomId, userId);
      socketService.respondToAccessRequest(userId, true);
      
      setAccessRequests(prev => prev.filter(req => req.userId !== userId));
      
      if (currentRequest && currentRequest.userId === userId) {
        setCurrentRequest(null);
        setShowAccessDialog(false);
      }
    }
  }, [roomId, approveAccess, currentRequest]);

  const handleDenyAccess = useCallback((userId: string) => {
    if (roomId) {
      denyAccess(roomId, userId);
      socketService.respondToAccessRequest(userId, false);
      
      setAccessRequests(prev => prev.filter(req => req.userId !== userId));
      
      if (currentRequest && currentRequest.userId === userId) {
        setCurrentRequest(null);
        setShowAccessDialog(false);
      }
    }
  }, [roomId, denyAccess, currentRequest]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const handleManualSave = useCallback(() => {
    if (roomId) {
      updateRoomFiles(roomId, files);
      setLastSavedTime(new Date());
      
      toast({
        title: "Session Saved",
        description: "Your work has been saved successfully.",
      });
    }
  }, [roomId, files, updateRoomFiles]);

  const toggleAutoSave = useCallback(() => {
    setAutoSave(prev => !prev);
    
    toast({
      title: autoSave ? "Auto-Save Disabled" : "Auto-Save Enabled",
      description: autoSave ? "You'll need to save manually" : "Changes will be saved automatically",
    });
    
    if (!autoSave && roomId) {
      updateRoomFiles(roomId, files);
      setLastSavedTime(new Date());
    }
  }, [autoSave, roomId, files, updateRoomFiles]);

  const copySessionCode = useCallback(() => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast({
        title: "Session code copied",
        description: "Share this code with others to join your session",
      });
    }
  }, [roomId]);

  const handleUpdateSessionName = useCallback((name: string) => {
    if (roomId) {
      socketService.emit("session-update", { name, roomId });
    }
    return name;
  }, [roomId]);

  const handleSendChatMessage = useCallback((message: string) => {
    if (roomId && user && message.trim()) {
      // Generate random color if not available
      const getRandomColor = () => {
        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
        return colors[Math.floor(Math.random() * colors.length)];
      };

      socketService.emit("chat-message", {
        roomId,
        userId: user.id,
        userName: user.name || user.email || user.id,
        text: message,
        timestamp: new Date()
      });
      
      return {
        id: `${Date.now()}-${user.id}`,
        userId: user.id,
        userName: user.name || user.email || user.id,
        userColor: getRandomColor(),
        text: message,
        timestamp: new Date()
      };
    }
    return null;
  }, [roomId, user]);

  const handleCursorPositionChange = useCallback((line: number, column: number) => {
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
  }, [roomId, user, currentFile]);

  return {
    handleRunCode,
    handleRequestAccess,
    handleApproveAccess,
    handleDenyAccess,
    toggleChat,
    handleManualSave,
    toggleAutoSave,
    copySessionCode,
    handleUpdateSessionName,
    handleSendChatMessage,
    handleCursorPositionChange
  };
}
