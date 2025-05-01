
import { ResizablePanel } from "@/components/ui/resizable";
import VideoCall from "@/components/VideoCall";
import { VisiblePanels, CodeFile } from "@/pages/Room/types";
import { useAuth } from "@/contexts/AuthContext";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }
  
  const handleShareLink = () => {
    setShowShareDialog(true);
  };
  
  const getShareUrl = () => {
    return `${window.location.origin}/room/${roomId}?join=true`;
  };
  
  const copyShareUrl = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast({
      title: "Link copied!",
      description: "Share this link with others to join your session automatically",
      duration: 3000
    });
  };
  
  return (
    <>
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
          {visiblePanels.videos && (
            <VideoCall 
              roomId={roomId} 
              onChatToggle={toggleChat} 
              isChatOpen={isChatOpen} 
            />
          )}
        </div>
      </div>
      
      {/* Share Link Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Session</DialogTitle>
            <DialogDescription>
              Anyone with this link can join your collaborative session
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 mt-2">
            <Input 
              value={getShareUrl()} 
              readOnly 
              className="flex-1"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button onClick={copyShareUrl}>Copy</Button>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollaborationSidebar;
