import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Save,
  FileSymlink, 
  Folder, 
  Files, 
  Copy, 
  FolderClosed,
  Download,
  Share2,
  Settings,
  Pencil
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface RoomHeaderProps {
  roomId?: string;
  handleRunCode: () => void;
  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
  onCreateFile: (fileName: string, language: string) => void;
  sessionName: string;
  onUpdateSessionName: (name: string) => void;
  isOwner: boolean;
  onCopySessionCode: () => void;
  onSaveSession?: () => void;
  autoSave?: boolean;
  onToggleAutoSave?: () => void;
  lastSavedTime?: Date | null;
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
  autoSave = true,
  onToggleAutoSave,
  lastSavedTime
}) => {
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("javascript");
  const [showNameEditDialog, setShowNameEditDialog] = useState(false);
  const [editedName, setEditedName] = useState(sessionName);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const formatSavedTime = () => {
    if (!lastSavedTime) return "Not saved yet";
    
    const now = new Date();
    const diff = now.getTime() - lastSavedTime.getTime();
    
    if (diff < 60000) {
      return "Just now";
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return lastSavedTime.toLocaleString();
    }
  };

  const handleNewFile = () => {
    if (fileName.trim()) {
      let fullFileName = fileName;
      if (!fullFileName.includes(".")) {
        const extensions: Record<string, string> = {
          javascript: ".js",
          typescript: ".ts",
          html: ".html",
          css: ".css",
          json: ".json"
        };
        fullFileName += extensions[fileType] || ".js";
      }
      
      onCreateFile(fullFileName, fileType);
      setFileName("");
      setShowNewFileDialog(false);
    }
  };

  const handleNameEdit = () => {
    if (editedName.trim()) {
      onUpdateSessionName(editedName);
      setShowNameEditDialog(false);
    }
  };
  
  useEffect(() => {
    if (showNameEditDialog && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showNameEditDialog]);

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => isOwner && setShowNameEditDialog(true)}
        >
          <h1 className="text-xl font-semibold flex items-center gap-2">
            {sessionName}
            {isOwner && (
              <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </h1>
          <div className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
            {roomId}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onCopySessionCode();
            }}
            title="Copy session code"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {onSaveSession && (
            <div className="flex items-center mr-2">
              <div className="text-xs text-muted-foreground mr-2">
                {autoSave ? `Auto-saved ${formatSavedTime()}` : "Auto-save off"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs">Auto-save</span>
                <Switch 
                  checked={!!autoSave} 
                  onCheckedChange={onToggleAutoSave}
                  className="scale-75"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={onSaveSession}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className="mr-2"
          >
            {showFileExplorer ? <FolderClosed className="h-4 w-4 mr-2" /> : <Folder className="h-4 w-4 mr-2" />}
            {showFileExplorer ? "Hide Files" : "Show Files"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="mr-2">
                <FileSymlink className="h-4 w-4 mr-2" />
                New File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setFileType("javascript");
                setShowNewFileDialog(true);
              }}>
                JavaScript (.js)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFileType("typescript");
                setShowNewFileDialog(true);
              }}>
                TypeScript (.ts)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFileType("html");
                setShowNewFileDialog(true);
              }}>
                HTML (.html)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFileType("css");
                setShowNewFileDialog(true);
              }}>
                CSS (.css)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFileType("json");
                setShowNewFileDialog(true);
              }}>
                JSON (.json)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleRunCode} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
      </div>
      
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Enter a name for your new {fileType} file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                File Name
              </Label>
              <Input
                id="name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={`example${fileType === "javascript" ? ".js" : fileType === "html" ? ".html" : fileType === "css" ? ".css" : ".ts"}`}
                className="col-span-3"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNewFile();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleNewFile} className="bg-blue-600 hover:bg-blue-700">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showNameEditDialog} onOpenChange={setShowNameEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
            <DialogDescription>
              Enter a new name for your collaborative session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionName" className="text-right">
                Session Name
              </Label>
              <Input
                id="sessionName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="col-span-3"
                ref={nameInputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNameEdit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleNameEdit} className="bg-blue-600 hover:bg-blue-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomHeader;
