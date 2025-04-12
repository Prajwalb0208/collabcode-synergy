
import { Button } from "@/components/ui/button";
import { Play, Download, Save, FileText, FilePlus, Share, Edit, Check, Copy, Link } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RoomHeaderProps {
  roomId?: string;
  handleRunCode: () => void;
  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
  onCreateFile?: (fileName: string, language: string, content?: string) => void;
  sessionName?: string;
  onUpdateSessionName?: (name: string) => void;
  isOwner?: boolean;
  onCopySessionCode?: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId,
  handleRunCode,
  showFileExplorer,
  setShowFileExplorer,
  onCreateFile,
  sessionName = "Collaborative Session",
  onUpdateSessionName,
  isOwner = false,
  onCopySessionCode
}) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(sessionName);

  const handleNewFile = () => {
    if (onCreateFile) {
      const fileName = prompt("Enter file name:", "newfile.js");
      if (fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        let language = 'javascript';
        
        if (extension === 'html') language = 'html';
        else if (extension === 'css') language = 'css';
        else if (extension === 'json') language = 'json';
        else if (extension === 'ts' || extension === 'tsx') language = 'typescript';
        
        onCreateFile(fileName, language);
      }
    }
  };

  const handleShareRoom = () => {
    if (roomId) {
      const shareUrl = `${window.location.origin}/room/${roomId}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Room link copied!",
        description: "Share this link with collaborators to join this room."
      });
    }
  };
  
  const handleSaveSession = () => {
    // In a real implementation, this would save the session to the backend
    toast({
      title: "Session saved",
      description: "Your session has been saved successfully."
    });
  };
  
  const startEditing = () => {
    if (isOwner) {
      setEditing(true);
      setEditedName(sessionName);
    }
  };
  
  const saveSessionName = () => {
    setEditing(false);
    if (onUpdateSessionName && editedName.trim()) {
      onUpdateSessionName(editedName);
    }
  };

  const handleCopySessionCode = () => {
    if (onCopySessionCode) {
      onCopySessionCode();
    } else if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast({
        title: "Session code copied!",
        description: "Share this code with others to join your session."
      });
    }
  };

  const shareUrl = roomId ? `${window.location.origin}/room/${roomId}` : '';

  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-end space-x-2">
          {editing ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold h-10 pr-10"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={saveSessionName}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h1 
              className="text-2xl font-bold cursor-pointer flex items-center"
              onClick={startEditing}
            >
              {sessionName}
              {isOwner && (
                <Edit className="h-4 w-4 ml-2 text-muted-foreground" />
              )}
            </h1>
          )}
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              Share Session
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Share this session</h4>
              <div className="space-y-2">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-muted-foreground">Share link</label>
                  <div className="flex items-stretch">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button
                      variant="secondary"
                      className="h-10 rounded-l-none px-3"
                      onClick={handleShareRoom}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <label className="text-xs text-muted-foreground">Session code</label>
                  <div className="flex items-stretch">
                    <Input
                      value={roomId || ''}
                      readOnly
                      className="font-mono rounded-r-none"
                    />
                    <Button
                      variant="secondary"
                      className="h-10 rounded-l-none px-3"
                      onClick={handleCopySessionCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Anyone with this link or code can join your session
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {roomId ? "Collaborative coding session" : "Creating new session..."}
        </p>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRunCode}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewFile}>
            <FilePlus className="h-4 w-4 mr-2" />
            New File
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveSession}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFileExplorer(!showFileExplorer)}
          >
            <FileText className="h-4 w-4 mr-2" />
            {showFileExplorer ? "Hide Files" : "Show Files"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomHeader;
