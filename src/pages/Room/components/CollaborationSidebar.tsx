
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import CollaborationPanel from "@/components/CollaborationPanel";
import VideoCall from "@/components/VideoCall";
import AIAssistant from "@/components/AIAssistant";
import { VisiblePanels, CodeFile } from "../types";

interface CollaborationSidebarProps {
  visiblePanels: VisiblePanels;
  isChatOpen: boolean;
  toggleChat: () => void;
  roomId: string;
  isRoomOwner: boolean;
  currentFile: CodeFile;
  files?: CodeFile[];
}

const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({
  visiblePanels,
  isChatOpen,
  toggleChat,
  roomId,
  isRoomOwner,
  currentFile,
  files
}) => {
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
