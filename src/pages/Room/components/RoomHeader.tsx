
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Play, FileCode, FolderClosed, GitBranch, Save, CopyIcon,
  Edit, Check, X, Share, MessageSquare, Clock, Video 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Participant } from "../types";

interface RoomHeaderProps {
  roomId?: string;
  handleRunCode: () => void;
  showFileExplorer: boolean;
  setShowFileExplorer: React.Dispatch<React.SetStateAction<boolean>>;
  onCreateFile?: (fileName: string, language: string, content?: string) => void;
  sessionName: string;
  onUpdateSessionName: (name: string) => void;
  isOwner: boolean;
  onCopySessionCode: () => void;
  onSaveSession: () => void;
  autoSave: boolean;
  onToggleAutoSave: () => void;
  lastSavedTime: Date | null;
  participants?: Participant[];
  onToggleChat?: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId,
  handleRunCode,
  showFileExplorer,
  setShowFileExplorer,
  onCreateFile,
  sessionName,
  onUpdateSessionName,
  isOwner,
  onCopySessionCode,
  onSaveSession,
  autoSave,
  onToggleAutoSave,
  lastSavedTime,
  participants = [],
  onToggleChat
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(sessionName);
  const [showCreateFileDialog, setShowCreateFileDialog] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("javascript");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setNewName(sessionName);
  }, [sessionName]);

  const handleChangeSessionName = () => {
    if (newName.trim()) {
      onUpdateSessionName(newName);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(sessionName);
    setIsEditing(false);
  };

  const handleCreateFile = () => {
    if (fileName.trim() && onCreateFile) {
      onCreateFile(fileName, fileType);
      setShowCreateFileDialog(false);
      setFileName("");
    }
  };

  return (
    <div className="border-b sticky top-16 z-10 bg-background/95 backdrop-blur-sm">
      <div className="container py-2 px-2 md:px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-grow flex-shrink-0 md:flex-grow-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-40 md:w-60"
                autoFocus
                onKeyUp={(e) => {
                  if (e.key === "Enter") handleChangeSessionName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <Button variant="ghost" size="icon" onClick={handleChangeSessionName}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-medium text-lg truncate max-w-[160px] md:max-w-xs">
                {sessionName}
              </h1>
              {isOwner && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Participants & Features - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {/* Participants */}
          {participants.length > 0 && (
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant, i) => (
                <HoverCard key={participant.id}>
                  <HoverCardTrigger asChild>
                    <Avatar className="border-2 border-background cursor-pointer">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback style={{ backgroundColor: participant.color || "#6E59A5" }}>
                        {participant.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-60">
                    <div className="flex justify-between space-x-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{participant.name}</h4>
                        <div className="flex items-center pt-1">
                          <div 
                            className="h-2 w-2 rounded-full mr-2" 
                            style={{ backgroundColor: participant.status === 'active' ? '#10b981' : '#6b7280' }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {participant.status === 'active' ? 'Online' : 'Away'}
                          </span>
                        </div>
                        {participant.cursorPosition && (
                          <p className="text-xs text-muted-foreground">
                            Editing: {participant.cursorPosition.fileName} (line {participant.cursorPosition.line + 1})
                          </p>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
              
              {participants.length > 3 && (
                <Avatar className="border-2 border-background">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    +{participants.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
          
          <div className="h-6 border-r border-muted"></div>
          
          {!autoSave && (
            <Button variant="ghost" size="sm" onClick={onSaveSession} className="text-muted-foreground">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
          
          {autoSave && lastSavedTime && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Saved {format(lastSavedTime, 'h:mm a')}
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Label htmlFor="auto-save" className="text-xs font-normal cursor-pointer">Auto-save</Label>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={onToggleAutoSave}
              className="h-4 w-8 bg-muted data-[state=checked]:bg-green-600"
            />
          </div>
        </div>
        
        {/* Button Toolbar */}
        <div className="flex items-center gap-1 md:gap-2 justify-end flex-wrap">
          {/* Mobile view - minimized controls */}
          <div className="flex md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  Actions
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-2">
                <div className="grid gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => setShowFileExplorer(!showFileExplorer)}
                  >
                    <FolderClosed className="h-3.5 w-3.5 mr-2" />
                    {showFileExplorer ? "Hide Files" : "Show Files"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={handleRunCode}
                  >
                    <Play className="h-3.5 w-3.5 mr-2" />
                    Run Code
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => setShowCreateFileDialog(true)}
                  >
                    <FileCode className="h-3.5 w-3.5 mr-2" />
                    New File
                  </Button>
                  {!autoSave && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                      onClick={onSaveSession}
                    >
                      <Save className="h-3.5 w-3.5 mr-2" />
                      Save
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={onCopySessionCode}
                  >
                    <Share className="h-3.5 w-3.5 mr-2" />
                    Share
                  </Button>
                  {participants.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                      onClick={onToggleChat}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-2" />
                      Chat
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Desktop view - full controls */}
          <div className="hidden md:flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFileExplorer(!showFileExplorer)}
              className="hidden md:flex"
            >
              <FolderClosed className="h-4 w-4 mr-2" />
              {showFileExplorer ? "Hide Files" : "Show Files"}
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setShowCreateFileDialog(true)}>
              <FileCode className="h-4 w-4 mr-2" />
              New File
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRunCode}>
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            
            <Button variant="outline" size="sm" onClick={onCopySessionCode}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            {participants.length > 0 && (
              <Button variant="outline" size="sm" onClick={onToggleChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
            )}
          </div>
          
          {roomId && (
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/50 px-2.5 py-1 rounded-md text-sm text-muted-foreground">
                <span>Session: </span>
                <code className="text-xs font-mono">{roomId}</code>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onCopySessionCode}
              >
                <CopyIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create File Dialog */}
      <Dialog open={showCreateFileDialog} onOpenChange={setShowCreateFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Enter a name for your new file
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                placeholder="e.g., script.js, index.html"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fileType">File Type</Label>
              <select
                id="fileType"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="javascript">JavaScript (.js)</option>
                <option value="typescript">TypeScript (.ts)</option>
                <option value="html">HTML (.html)</option>
                <option value="css">CSS (.css)</option>
                <option value="json">JSON (.json)</option>
                <option value="markdown">Markdown (.md)</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFile} disabled={!fileName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomHeader;
