
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  
  // Initialize all state and hooks
  const state = useRoomState();
  
  const { 
    roomId, user, isRoomOwner, isParticipant, isPendingApproval, 
    isAutoJoining, visiblePanels, files, activeTab, currentFile, 
    terminal, showFileExplorer, participants,
    sessionName, autoSave, lastSavedTime,
    accessRequests, showAccessDialog, currentRequest, liveCursorPositions
  } = state;
  
  const { editorContainerRef } = useRoomSetup({
    ...state,
    handleRequestAccess: () => actions.handleRequestAccess()
  });
  
  // Setup socket handlers
  useSocketHandlers({
    ...state,
    editorContainerRef
  });
  
  // File operations
  const fileOps = useFileOperations(state);
  
  // Room actions
  const actions = useRoomActions(state);
  
  // Handler for toggling panel visibility
  const togglePanelVisibility = (panel: keyof typeof visiblePanels) => {
    state.setVisiblePanels(prev => ({
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
        setShowFileExplorer={state.setShowFileExplorer}
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
        setShowAccessDialog={state.setShowAccessDialog}
        currentRequest={currentRequest}
        handleCursorPositionChange={actions.handleCursorPositionChange}
      />
    </MainLayout>
  );
};

export default Room;
