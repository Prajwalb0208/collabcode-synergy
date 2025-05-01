
import React, { useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AccessRequest from "./components/AccessRequest";
import PendingApproval from "./components/PendingApproval";
import { useRoomState } from "./hooks/useRoomState";
import { useRoomSetup } from "./hooks/useRoomSetup";
import { useSocketHandlers } from "./hooks/useSocketHandlers";
import { useFileOperations } from "./hooks/useFileOperations";
import { useRoomActions } from "./hooks/useRoomActions";
import RoomContent from "./RoomContent";

const Room = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize all state and hooks
  const state = useRoomState();
  
  const { 
    roomId, user, isRoomOwner, isParticipant, isPendingApproval, 
    isAutoJoining, visiblePanels, files, activeTab, currentFile, 
    terminal, showFileExplorer, participants,
    sessionName, autoSave, lastSavedTime,
    accessRequests, showAccessDialog, currentRequest, liveCursorPositions,
    updateRoomFiles, requestAccess, approveAccess, denyAccess, addRoom, getRoom,
    setFiles, setCurrentFile, setActiveTab, setSessionName, setLastSavedTime,
    setShowFileExplorer, setVisiblePanels, setAccessRequests, setCurrentRequest, 
    setShowAccessDialog, setIsAutoJoining, toast, setFolders, setParticipants,
    cursorPositions, setCursorPositions, setLiveCursorPositions,
    screenSharingUser, setScreenSharingUser, sessionLoaded, setSessionLoaded
  } = state;
  
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  const { handleRequestAccess } = useRoomActions({
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
    setAutoSave: state.setAutoSave, 
    autoSave, 
    setTerminal: state.setTerminal, 
    currentRequest
  });
  
  // Setup room with all required parameters
  useRoomSetup({
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
  });
  
  // Setup socket handlers with all required parameters
  useSocketHandlers({
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
    editorContainerRef,
    setSessionName
  });
  
  // File operations
  const fileOps = useFileOperations(state);
  
  // Room actions
  const actions = useRoomActions({
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
    setAutoSave: state.setAutoSave, 
    autoSave, 
    setTerminal: state.setTerminal, 
    currentRequest
  });
  
  // Handler for toggling panel visibility
  const togglePanelVisibility = (panel: keyof typeof visiblePanels) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };
  
  const handleEndSession = useCallback(() => {
    navigate('/rooms');
  }, [navigate]);
  
  // Check access conditions and render appropriate view
  if (roomId && user && !isRoomOwner(roomId) && !isParticipant(roomId)) {
    if (isPendingApproval(roomId)) {
      return <PendingApproval />;
    }
    
    if (isAutoJoining) {
      return <PendingApproval autoJoined={true} />;
    }
    
    return <AccessRequest roomId={roomId} onRequestAccess={actions.handleRequestAccess} />;
  }

  return (
    <MainLayout>
      <RoomContent 
        roomId={roomId || ""}
        showFileExplorer={showFileExplorer}
        setShowFileExplorer={setShowFileExplorer}
        visiblePanels={visiblePanels}
        togglePanelVisibility={togglePanelVisibility}
        files={files}
        activeTab={activeTab}
        handleFileClick={fileOps.handleFileClick}
        currentFile={currentFile}
        handleCodeChange={fileOps.handleCodeChange}
        terminal={terminal}
        handleRunCode={actions.handleRunCode}
        handleCreateFile={fileOps.handleCreateFile}
        handleCreateFolder={fileOps.handleCreateFolder}
        handleMoveFile={fileOps.handleMoveFile}
        handleDeleteFile={fileOps.handleDeleteFile}
        handleRenameFile={fileOps.handleRenameFile}
        sessionName={sessionName}
        handleUpdateSessionName={actions.handleUpdateSessionName}
        isRoomOwner={isRoomOwner}
        copySessionCode={actions.copySessionCode}
        handleManualSave={actions.handleManualSave}
        autoSave={autoSave}
        toggleAutoSave={actions.toggleAutoSave}
        lastSavedTime={lastSavedTime}
        participants={participants}
        handleEndSession={handleEndSession}
        accessRequests={accessRequests}
        handleApproveAccess={actions.handleApproveAccess}
        handleDenyAccess={actions.handleDenyAccess}
        editorContainerRef={editorContainerRef}
        liveCursorPositions={liveCursorPositions}
        showAccessDialog={showAccessDialog}
        setShowAccessDialog={setShowAccessDialog}
        currentRequest={currentRequest}
        handleCursorPositionChange={actions.handleCursorPositionChange}
      />
    </MainLayout>
  );
};

export default Room;
