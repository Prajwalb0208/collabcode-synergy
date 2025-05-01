
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Play, 
  Save, 
  Copy, 
  FolderOpen, 
  FileCode2,
  User, 
  Users,
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Participant } from "../types";

interface RoomHeaderProps {
  roomId?: string;
  showFileExplorer: boolean;
  setShowFileExplorer: (value: boolean) => void;
  handleRunCode: () => void;
  onCreateFile?: (filename: string, language: string) => void;
  sessionName: string;
  onUpdateSessionName?: (name: string) => void;
  isOwner?: boolean;
  onCopySessionCode?: () => void;
  onSaveSession?: () => void;
  autoSave?: boolean;
  onToggleAutoSave?: () => void;
  lastSavedTime?: Date | null;
  participants?: Participant[];
  onToggleChat?: () => void;
  onEndSession?: () => void; // Add end session handler
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ 
  roomId,
  showFileExplorer,
  setShowFileExplorer,
  handleRunCode,
  onCreateFile,
  sessionName,
  onUpdateSessionName,
  isOwner = false,
  onCopySessionCode,
  onSaveSession,
  autoSave = true,
  onToggleAutoSave,
  lastSavedTime,
  participants = [],
  onToggleChat,
  onEndSession
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(sessionName);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSessionName && nameValue.trim()) {
      onUpdateSessionName(nameValue);
    }
    setIsEditingName(false);
  };
  
  const handleNewFile = () => {
    const filename = window.prompt("Enter file name");
    if (filename && onCreateFile) {
      const extension = filename.split('.').pop() || 'js';
      let language = 'javascript';
      
      if (extension === 'html') language = 'html';
      else if (extension === 'css') language = 'css';
      else if (extension === 'ts' || extension === 'tsx') language = 'typescript';
      else if (extension === 'json') language = 'json';
      
      onCreateFile(filename, language);
    }
  };
  
  return (
    <div className="bg-card/50 backdrop-blur-sm border-b py-2 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowFileExplorer(!showFileExplorer)} 
            title={showFileExplorer ? "Hide file explorer" : "Show file explorer"}
            className="hover:bg-muted/50"
          >
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isEditingName ? (
            <form onSubmit={handleNameSubmit} className="flex items-center">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="max-w-[240px] h-8 text-sm"
                autoFocus
                onBlur={handleNameSubmit}
                placeholder="Session Name"
              />
            </form>
          ) : (
            <h1 
              className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors" 
              onClick={() => setIsEditingName(true)}
              title="Click to edit session name"
            >
              {sessionName}
            </h1>
          )}

          {roomId && onCopySessionCode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={onCopySessionCode}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Copy session code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {onSaveSession && (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onSaveSession}
                    className="hover:bg-muted/50"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div>
                    <p className="text-xs">Save session</p>
                    {lastSavedTime && (
                      <p className="text-xs text-muted-foreground">
                        Last saved: {format(lastSavedTime, "HH:mm:ss")}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {onToggleAutoSave && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={onToggleAutoSave}
                      className={`text-xs px-2 h-8 ${autoSave ? 'text-green-500' : 'text-muted-foreground'}`}
                    >
                      {autoSave ? "Auto-save on" : "Auto-save off"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{autoSave ? "Disable" : "Enable"} auto-save</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        
        <Button onClick={handleRunCode} size="sm" className="gap-1">
          <Play className="h-3.5 w-3.5" />
          Run
        </Button>
        
        {onCreateFile && (
          <Button onClick={handleNewFile} variant="outline" size="icon" className="hover:bg-muted/50">
            <FileCode2 className="h-4 w-4" />
          </Button>
        )}
        
        {participants?.length > 0 && (
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2">
                      <Users className="h-4 w-4 mr-1" />
                      {participants.length}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Active participants</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Participants</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {participants.map((user) => (
                <DropdownMenuItem key={user.id} className="py-2 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback style={{ backgroundColor: user.color || "#6E59A5" }} className="text-xs text-white">
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm truncate">{user.name || user.id}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {onToggleChat && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={onToggleChat}
                  className="hover:bg-muted/50"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Open chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Session settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowFileExplorer(!showFileExplorer)}>
              {showFileExplorer ? "Hide" : "Show"} file explorer
            </DropdownMenuItem>
            {onEndSession && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEndSession} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  End session
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default RoomHeader;
