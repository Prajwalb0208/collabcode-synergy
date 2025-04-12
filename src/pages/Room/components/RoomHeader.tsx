
import { Button } from "@/components/ui/button";
import { Play, Download, Save, FileText, FilePlus, Share, Edit, Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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
      navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
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
        description: "Share this code with collaborators to join this session."
      });
    }
  };

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
        
        <div className="flex items-center gap-2 border border-border rounded-md px-3 py-1.5 bg-muted/30">
          <span className="text-sm font-medium">Session ID:</span>
          <code className="text-sm font-mono text-primary">{roomId || "Creating..."}</code>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopySessionCode} 
            className="h-6 w-6 ml-1"
            title="Copy session code"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
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
          <Button variant="outline" size="sm" onClick={handleShareRoom}>
            <Share className="h-4 w-4 mr-2" />
            Share
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
