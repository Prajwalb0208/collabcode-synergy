
import React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import PanelToggleBar from "./components/PanelToggleBar";
import EditorPanel from "./components/EditorPanel";
import FileExplorer from "@/components/FileExplorer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import CollaborationSidebar from "@/components/CollaborationSidebar";
import LiveCursors from "./components/LiveCursors";
import { Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import RoomHeader from "./components/RoomHeader";

interface RoomContentProps {
  roomId: string;
  showFileExplorer: boolean;
  setShowFileExplorer: (value: boolean) => void;
  visiblePanels: any;
  togglePanelVisibility: (panel: string) => void;
  files: any[];
  activeTab: string;
  handleFileClick: (file: any) => void;
  currentFile: any;
  handleCodeChange: (code: string) => void;
  terminal: string[];
  handleRunCode: () => void;
  handleCreateFile: (name: string, lang: string, folder?: string, content?: string) => void;
  handleCreateFolder: (name: string, parent?: string) => void;
  handleMoveFile: (file: string, target: string) => void;
  handleDeleteFile: (name: string) => void;
  handleRenameFile: (old: string, newName: string) => void;
  sessionName: string;
  handleUpdateSessionName: (name: string) => void;
  isRoomOwner: (id: string) => boolean;
  copySessionCode: () => void;
  handleManualSave: () => void;
  autoSave: boolean;
  toggleAutoSave: () => void;
  lastSavedTime: Date | null;
  participants: any[];
  handleEndSession: () => void;
  accessRequests: any[];
  handleApproveAccess: (id: string) => void;
  handleDenyAccess: (id: string) => void;
  editorContainerRef: React.RefObject<HTMLDivElement>;
  liveCursorPositions: Record<string, any>;
  showAccessDialog: boolean;
  setShowAccessDialog: (show: boolean) => void;
  currentRequest: any;
  handleCursorPositionChange: (line: number, column: number) => void;
}

const RoomContent: React.FC<RoomContentProps> = ({
  roomId,
  showFileExplorer, 
  setShowFileExplorer,
  visiblePanels,
  togglePanelVisibility,
  files,
  activeTab,
  handleFileClick,
  currentFile,
  handleCodeChange,
  terminal,
  handleRunCode,
  handleCreateFile,
  handleCreateFolder,
  handleMoveFile,
  handleDeleteFile,
  handleRenameFile,
  sessionName,
  handleUpdateSessionName,
  isRoomOwner,
  copySessionCode,
  handleManualSave,
  autoSave,
  toggleAutoSave,
  lastSavedTime,
  participants,
  handleEndSession,
  accessRequests,
  handleApproveAccess,
  handleDenyAccess,
  editorContainerRef,
  liveCursorPositions,
  showAccessDialog,
  setShowAccessDialog,
  currentRequest,
  handleCursorPositionChange
}) => {
  const isMobile = useIsMobile();

  // Add console log to debug editable prop
  console.log("Room rendering, editable always set to true");

  return (
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
        onEndSession={handleEndSession}
      />

      <div className="px-2 md:px-4">
        <PanelToggleBar 
          visiblePanels={visiblePanels}
          togglePanelVisibility={togglePanelVisibility}
        />
      </div>

      <div className="h-[calc(100vh-10rem)] px-2 md:px-4 pb-4">
        <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg overflow-hidden">
          {/* File Explorer Panel - Left Side */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card/50 backdrop-blur-sm">
            <FileExplorer 
              files={files}
              onFileSelect={handleFileClick}
              onCreateFile={handleCreateFile}
              onCreateFolder={handleCreateFolder}
              onMoveFile={handleMoveFile}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-muted/50 hover:bg-muted transition-colors" />
          
          {/* Editor and Terminal Panel - Center */}
          <ResizablePanel defaultSize={50} className="relative">
            <div ref={editorContainerRef} className="relative h-full">
              <EditorPanel
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
                onMoveFile={handleMoveFile}
                visiblePanels={visiblePanels}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                showFileExplorer={false}
                onCursorPositionChange={handleCursorPositionChange}
                editable={true} // Always force this to true to ensure files are editable
              />
              <LiveCursors 
                containerRef={editorContainerRef} 
                cursorPositions={liveCursorPositions}
              />
            </div>
          </ResizablePanel>
          
          {/* Video Panel - Right Side */}
          <ResizableHandle withHandle className="bg-muted/50 hover:bg-muted transition-colors" />
          <ResizablePanel defaultSize={30} minSize={20} className="bg-card/50 backdrop-blur-sm relative">
            <CollaborationSidebar 
              visiblePanels={visiblePanels}
              roomId={roomId || ""}
              isRoomOwner={roomId ? isRoomOwner(roomId) : true}
              currentFile={currentFile}
              files={files}
              accessRequests={accessRequests}
              onApproveAccess={handleApproveAccess}
              onDenyAccess={handleDenyAccess}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
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
    </div>
  );
};

export default RoomContent;
