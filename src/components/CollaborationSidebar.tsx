
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import CollaborationPanel from "@/components/CollaborationPanel";
import VideoCall from "@/components/VideoCall";
import { VisiblePanels, CodeFile } from "@/pages/Room/types";
import { useAuth } from "@/contexts/AuthContext";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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
  files,
  accessRequests = [],
  onApproveAccess,
  onDenyAccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }
  
  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share this link with others to join your session",
      duration: 3000
    });
  };
  
  return (
    <>
      <ResizableHandle withHandle className="bg-muted/50 hover:bg-muted transition-colors" />
      <ResizablePanel defaultSize={30} minSize={20} className="bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col h-full">
          {/* Share link button */}
          <div className="p-2 border-b border-border/50">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleShareLink}
            >
              <Share2 className="h-4 w-4" />
              Share Session Link
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="vertical">
              {visiblePanels.videos && (
                <>
                  <ResizablePanel defaultSize={40} minSize={15} className="bg-card border-b border-border/50">
                    <VideoCall 
                      roomId={roomId} 
                      onChatToggle={toggleChat} 
                      isChatOpen={isChatOpen} 
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle className="bg-muted/50 hover:bg-muted transition-colors" />
                </>
              )}
              
              {visiblePanels.collaboration && (
                <ResizablePanel defaultSize={visiblePanels.videos ? 60 : 100} minSize={20}>
                  <CollaborationPanel 
                    isOwner={isRoomOwner} 
                    roomId={roomId}
                    files={files}
                    accessRequests={accessRequests}
                    onApproveAccess={onApproveAccess}
                    onDenyAccess={onDenyAccess}
                  />
                </ResizablePanel>
              )}
            </ResizablePanelGroup>
          </div>
        </div>
      </ResizablePanel>
    </>
  );
};

export default CollaborationSidebar;
