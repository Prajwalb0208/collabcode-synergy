
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Video, GitBranch, Shield, Check, X, Copy, Github, GitCommit, GitMerge, GitPullRequest } from "lucide-react";
import Chat from "./Chat";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import FileExplorer from "./FileExplorer";
import { Input } from "@/components/ui/input";
import { CodeFile } from "@/pages/Room/types";
import { socketService } from "@/services/socketService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CollaborationPanelProps {
  isOwner?: boolean;
  roomId: string;
  isChatOpen?: boolean;
  toggleChat?: () => void;
  files?: CodeFile[];
  accessRequests?: {userId: string, userName: string}[];
  onApproveAccess?: (userId: string) => void;
  onDenyAccess?: (userId: string) => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOwner = false,
  roomId,
  isChatOpen = false,
  toggleChat,
  files = [],
  accessRequests = [],
  onApproveAccess,
  onDenyAccess
}) => {
  const [activeTab, setActiveTab] = useState("collaborators");
  const [githubRepo, setGithubRepo] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [collaborators, setCollaborators] = useState<{id: string, name: string, avatar: string, color: string, status: string}[]>([]);
  const { recentRooms, approveAccess, denyAccess, connectGithubRepo } = useRoomHistory();
  const { toast } = useToast();
  
  // Initialize collaborators from socket service
  useEffect(() => {
    // Listen for user joined/left events
    socketService.on("user-joined", (data) => {
      setCollaborators(prev => {
        if (prev.some(c => c.id === data.userId)) {
          return prev;
        }
        return [...prev, {
          id: data.userId,
          name: data.name || `User-${data.userId.slice(0, 4)}`,
          avatar: "",
          color: getRandomColor(),
          status: "active"
        }];
      });
    });
    
    socketService.on("user-left", (data) => {
      setCollaborators(prev => 
        prev.filter(c => c.id !== data.userId)
      );
    });
    
    // Add some initial mock collaborators for UI purposes
    // In a real app, these would come from the server
    setTimeout(() => {
      if (collaborators.length === 0) {
        setCollaborators([
          { id: "1", name: "Alice Chen", avatar: "", color: "#3b82f6", status: "active" },
          { id: "2", name: "Bob Smith", avatar: "", color: "#10b981", status: "active" }
        ]);
      }
    }, 2000);
    
    return () => {
      // Clean up event listeners
    };
  }, []);
  
  // Get random color for avatar
  const getRandomColor = () => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get current room data
  const currentRoom = recentRooms.find(room => room.id === roomId);
  const pendingRequests = currentRoom?.pendingRequests || [];

  const handleApprove = (userId: string) => {
    if (onApproveAccess) {
      onApproveAccess(userId);
    } else {
      approveAccess(roomId, userId);
      toast({
        title: "Access granted",
        description: "User has been granted access to the room",
      });
    }
  };

  const handleDeny = (userId: string) => {
    if (onDenyAccess) {
      onDenyAccess(userId);
    } else {
      denyAccess(roomId, userId);
      toast({
        title: "Access denied",
        description: "User's request has been denied",
      });
    }
  };

  const handleToggleChat = () => {
    if (toggleChat) {
      toggleChat();
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Room ID copied",
      description: "Room ID has been copied to clipboard",
    });
  };

  const handleConnectGithub = () => {
    if (githubRepo.trim()) {
      setIsImporting(true);
      
      // Simulate API call
      setTimeout(() => {
        connectGithubRepo(roomId, githubRepo);
        setGithubRepo("");
        setIsImporting(false);
        
        toast({
          title: "GitHub repository connected",
          description: `Repository ${githubRepo} has been linked to this room`,
        });
      }, 2000);
    }
  };
  
  const handleCommitAndPush = () => {
    setShowCommitDialog(true);
  };
  
  const handleCommitSubmit = () => {
    setIsPushing(true);
    
    // Simulate commit and push
    setTimeout(() => {
      setIsPushing(false);
      setShowCommitDialog(false);
      setCommitMessage("");
      
      toast({
        title: "Changes committed",
        description: "Your changes have been committed and pushed to GitHub",
      });
    }, 2000);
  };

  const handleFileClick = (file: CodeFile) => {
    // Emit the file selected event through socket
    socketService.emit("file-selected", { fileName: file.name, roomId });
  };

  return (
    <Card className="w-full h-full border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col relative">
      <CardHeader className="pb-0 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Collaboration</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Session ID:</span>
            <code className="bg-muted px-1.5 py-0.5 rounded">{roomId}</code>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyRoomId}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="collaborators" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 mx-4 my-2">
            <TabsTrigger value="collaborators" onClick={() => setActiveTab("collaborators")}>
              <Users className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="chat" onClick={() => setActiveTab("chat")}>
              <MessageSquare className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="files" onClick={() => setActiveTab("files")}>
              <Github className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="git" onClick={() => setActiveTab("git")}>
              <GitBranch className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Git</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="collaborators" className="flex-1 overflow-auto data-[state=active]:h-full">
            <div className="p-4 space-y-4">
              {isOwner && (accessRequests.length > 0 || pendingRequests.length > 0) && (
                <div className="mb-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Access Requests</AlertTitle>
                    <AlertDescription>
                      {accessRequests.length || pendingRequests.length} user(s) requesting access
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-3 space-y-2">
                    {accessRequests.map(req => (
                      <div key={req.userId} className="flex items-center justify-between p-2 rounded-md border border-border">
                        <span className="text-sm">{req.userName || req.userId}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => handleApprove(req.userId)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDeny(req.userId)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {pendingRequests.map(userId => (
                      <div key={userId} className="flex items-center justify-between p-2 rounded-md border border-border">
                        <span className="text-sm">{userId}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => handleApprove(userId)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDeny(userId)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {collaborators.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback style={{ backgroundColor: user.color }}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.status === 'active' ? 'Online' : 'Away'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleToggleChat}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button className="w-full mt-4" variant="outline" onClick={handleCopyRoomId}>
                Invite Collaborators
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="flex-1 overflow-hidden data-[state=active]:h-full">
            <Chat />
          </TabsContent>
          
          <TabsContent value="files" className="flex-1 overflow-hidden data-[state=active]:h-full">
            <FileExplorer files={files} onFileSelect={handleFileClick} />
          </TabsContent>
          
          <TabsContent value="git" className="p-4 data-[state=active]:h-full overflow-auto">
            <div className="space-y-4">
              {isOwner && (
                <div className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium mb-2">Import from GitHub</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="GitHub repository URL" 
                      value={githubRepo} 
                      onChange={(e) => setGithubRepo(e.target.value)}
                      className="text-sm"
                      disabled={isImporting}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleConnectGithub}
                      disabled={isImporting}
                    >
                      {isImporting ? "Importing..." : "Connect"}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Branch</p>
                    <p className="text-xs text-muted-foreground">main</p>
                  </div>
                  <Button variant="outline" size="sm">Switch</Button>
                </div>
              </div>
              
              <div className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Modified Files</p>
                </div>
                <div className="space-y-2">
                  {files.slice(0, 3).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs p-1.5 bg-muted/50 rounded-md">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-3" 
                  size="sm"
                  onClick={handleCommitAndPush}
                >
                  <GitCommit className="h-3.5 w-3.5 mr-2" />
                  Commit & Push
                </Button>
              </div>
              
              <div className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Recent Git Activity</p>
                </div>
                <div className="space-y-2">
                  <div className="text-xs p-2 bg-muted/30 rounded-md">
                    <div className="flex items-center text-muted-foreground">
                      <GitCommit className="h-3 w-3 mr-1.5" />
                      <span>Initial commit</span>
                      <span className="ml-auto">2 hours ago</span>
                    </div>
                  </div>
                  <div className="text-xs p-2 bg-muted/30 rounded-md">
                    <div className="flex items-center text-muted-foreground">
                      <GitPullRequest className="h-3 w-3 mr-1.5" />
                      <span>Merged PR #12</span>
                      <span className="ml-auto">yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Chat panel inside the collaboration panel - initially closed */}
        <div className={`
          absolute inset-y-0 right-0 w-80 bg-background border-l shadow-lg transform transition-transform duration-300 z-10
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <Chat onClose={handleToggleChat} />
        </div>
      </CardContent>
      
      {/* Commit Dialog */}
      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commit Changes</DialogTitle>
            <DialogDescription>
              Enter a commit message to describe your changes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="commit-message">Commit Message</Label>
              <Textarea
                id="commit-message"
                placeholder="e.g., Add new feature, Fix bug, Update documentation"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Files to be committed:</p>
              <div className="text-sm text-muted-foreground">
                {files.slice(0, 3).map((file, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{file.name}</span>
                  </div>
                ))}
                {files.length > 3 && (
                  <div className="text-xs mt-1 text-muted-foreground">
                    +{files.length - 3} more files
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommitDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCommitSubmit}
              disabled={!commitMessage.trim() || isPushing}
            >
              {isPushing ? "Committing..." : "Commit & Push"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CollaborationPanel;
