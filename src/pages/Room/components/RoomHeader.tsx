
import { useState } from "react";
import { 
  Play, 
  Save, 
  FolderOpen, 
  Share2, 
  FilePlus, 
  Github,
  Settings,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { GitHubRepo, CodeFile } from "../types";
import GitHubImport from "@/components/GitHubImport";

interface RoomHeaderProps {
  roomId?: string;
  handleRunCode: () => void;
  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
  onCreateFile?: (fileName: string, language: string, content?: string) => void;
  sessionName: string;
  onUpdateSessionName: (name: string) => void;
  isOwner: boolean;
  onCopySessionCode: () => void;
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
  onCopySessionCode
}) => {
  const [showCreateFileDialog, setShowCreateFileDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileLanguage, setFileLanguage] = useState('javascript');
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState(sessionName);
  
  const handleCreateFile = () => {
    if (!fileName) {
      toast({
        title: "Error",
        description: "File name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (onCreateFile) {
      onCreateFile(fileName, fileLanguage);
    }
    
    setShowCreateFileDialog(false);
    setFileName('');
    setFileLanguage('javascript');
  };
  
  const handleImportComplete = (files: CodeFile[]) => {
    if (files.length > 0 && onCreateFile) {
      files.forEach(file => {
        onCreateFile(file.name, file.language, file.content);
      });
    }
  };
  
  const handleSaveSettings = () => {
    onUpdateSessionName(newSessionName);
    setShowSettingsSheet(false);
    
    toast({
      title: "Settings Saved",
      description: "Room settings have been updated successfully.",
    });
  };

  const copySessionLink = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied",
      description: "Session link copied to clipboard. Share this link to invite others.",
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4">
        <div className="flex items-center">
          <h2 className="text-lg md:text-xl font-semibold truncate mr-2">
            {sessionName}
          </h2>
          {roomId && (
            <div className="text-xs text-muted-foreground">
              ID: {roomId.substring(0, 8)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => setShowFileExplorer(!showFileExplorer)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            {showFileExplorer ? "Hide Files" : "Show Files"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <FilePlus className="h-4 w-4 mr-2" />
                New File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateFile && onCreateFile('index.html', 'html')}>
                HTML File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateFile && onCreateFile('script.js', 'javascript')}>
                JavaScript File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateFile && onCreateFile('styles.css', 'css')}>
                CSS File
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowCreateFileDialog(true)}>
                Custom File...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-8" onClick={() => setShowGitHubImport(true)}>
            <Github className="h-4 w-4 mr-2" />
            Import from GitHub
          </Button>
          
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="h-8" 
              onClick={handleRunCode}
            >
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            
            {roomId && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8" 
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            
            {isOwner && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8" 
                onClick={() => {
                  setNewSessionName(sessionName);
                  setShowSettingsSheet(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm" className="h-8 px-2">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRunCode}>
                <Play className="h-4 w-4 mr-2" />
                Run
              </DropdownMenuItem>
              
              {roomId && (
                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              
              {isOwner && (
                <DropdownMenuItem 
                  onClick={() => {
                    setNewSessionName(sessionName);
                    setShowSettingsSheet(true);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Create File Dialog */}
      <Dialog open={showCreateFileDialog} onOpenChange={setShowCreateFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Enter a name and select a language for your new file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="filename">File name</Label>
              <Input
                id="filename"
                placeholder="e.g. index.js"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={fileLanguage} onValueChange={setFileLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={handleCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* GitHub Import Dialog */}
      <GitHubImport
        open={showGitHubImport}
        onOpenChange={setShowGitHubImport}
        onImportComplete={handleImportComplete}
      />
      
      {/* Settings Sheet */}
      <Sheet open={showSettingsSheet} onOpenChange={setShowSettingsSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Room Settings</SheetTitle>
            <SheetDescription>
              Configure your coding room settings. Only room owners can change these settings.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Enter room name"
              />
            </div>
            
            {/* Add more settings as needed */}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Session</DialogTitle>
            <DialogDescription>
              Share this link or session code with others to invite them to your coding session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Session Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/room/${roomId}`}
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button variant="outline" size="sm" onClick={copySessionLink}>
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Session Code</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={roomId || ""}
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button variant="outline" size="sm" onClick={onCopySessionCode}>
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Others can join by entering this code on the home page.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomHeader;
