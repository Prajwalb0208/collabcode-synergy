import React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import PanelToggleBar from "./components/PanelToggleBar";
import EditorPanel from "./components/EditorPanel";
import FileExplorer from "@/components/FileExplorer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Chat from "@/components/Chat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import CollaborationSidebar from "@/components/CollaborationSidebar";
import LiveCursors from "./components/LiveCursors";
import { Check, X } from "lucide-react";
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
  isChatOpen: boolean;
  toggleChat: () => void;
  handleEndSession: () => void;
  accessRequests: any[];
  handleApproveAccess: (id: string) => void;
  handleDenyAccess: (id: string) => void;
  editorContainerRef: React.RefObject<HTMLDivElement>;
  liveCursorPositions: Record<string, any>;
  chatMessages: any[];
  handleSendChatMessage: (text: string) => void;
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
  isChatOpen,
  toggleChat,
  handleEndSession,
  accessRequests,
  handleApproveAccess,
  handleDenyAccess,
  editorContainerRef,
  liveCursorPositions,
  chatMessages,
  handleSendChatMessage,
  showAccessDialog,
  setShowAccessDialog,
  currentRequest,
  handleCursorPositionChange
}) => {
  const isMobile = useIsMobile();

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
        onToggleChat={toggleChat}
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
                editable={true} // Always set to true to ensure files are editable
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
              isChatOpen={isChatOpen}
              toggleChat={toggleChat}
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
      
      {/* Chat panels - mobile and desktop */}
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
      
      {!isMobile && (
        <div 
          className={`fixed right-0 top-0 w-80 h-full bg-background border-l shadow-lg z-20 flex flex-col transition-transform duration-300 ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-3 border-b bg-muted/40 flex items-center justify-between">
            <h3 className="font-medium">Chat</h3>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleChat}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Chat 
              roomId={roomId || ""} 
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              onClose={toggleChat}
            />
          </div>
        </div>
      )}
      
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
    </div>
  );
};

export default RoomContent;
