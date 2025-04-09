
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import CollaborationPanel from "@/components/CollaborationPanel";
import VideoCall from "@/components/VideoCall";
import AIAssistant from "@/components/AIAssistant";
import { VisiblePanels, CodeFile } from "../types";
import { useAuth } from "@/contexts/AuthContext";

interface CollaborationSidebarProps {
  visiblePanels: VisiblePanels;
  isChatOpen: boolean;
  toggleChat: () => void;
  roomId: string;
  isRoomOwner: boolean;
  currentFile: CodeFile;
  files?: CodeFile[];
  accessRequests?: {userId: string, userName: string}[];
  onApproveAccess?: (userId: string) => void;
  onDenyAccess?: (userId: string) => void;
}

const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({
  visiblePanels,
  isChatOpen,
  toggleChat,
  roomId,
  isRoomOwner,
  currentFile,
  files,
  accessRequests = [],
  onApproveAccess,
  onDenyAccess
}) => {
  const { user } = useAuth();
  
  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }
  
  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20}>
        <ResizablePanelGroup direction="vertical">
          {visiblePanels.videos && (
            <>
              <ResizablePanel defaultSize={40} minSize={15}>
                <VideoCall 
                  roomId={roomId} 
                  onChatToggle={toggleChat} 
                  isChatOpen={isChatOpen} 
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          
          {visiblePanels.ai && (
            <ResizablePanel defaultSize={visiblePanels.videos ? 60 : 100} minSize={20}>
              {roomId ? (
                <CollaborationPanel 
                  isOwner={isRoomOwner} 
                  roomId={roomId}
                  files={files}
                  accessRequests={accessRequests}
                  onApproveAccess={onApproveAccess}
                  onDenyAccess={onDenyAccess}
                />
              ) : (
                <AIAssistant currentFile={currentFile} />
              )}
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>
    </>
  );
};

export default CollaborationSidebar;
