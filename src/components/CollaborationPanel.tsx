
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Video, GitBranch, VideoOff, Mic, MicOff, Shield, Check, X, Copy, Github } from "lucide-react";
import Chat from "./Chat";
import VideoCall from "./VideoCall";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import FileExplorer from "./FileExplorer";
import { Input } from "@/components/ui/input";
import { CodeFile } from "@/pages/Room/types";

interface CollaborationPanelProps {
  isOwner?: boolean;
  roomId: string;
  files?: CodeFile[];
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOwner = false,
  roomId,
  files
}) => {
  const [activeTab, setActiveTab] = useState("collaborators");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [githubRepo, setGithubRepo] = useState("");
  const { recentRooms, approveAccess, denyAccess, connectGithubRepo } = useRoomHistory();
  const { toast } = useToast();
  
  const collaborators = [
    { id: 1, name: "Alice Chen", avatar: "", color: "#3b82f6", status: "active" },
    { id: 2, name: "Bob Smith", avatar: "", color: "#10b981", status: "active" },
    { id: 3, name: "Charlie Davis", avatar: "", color: "#f59e0b", status: "away" }
  ];

  // Get current room data
  const currentRoom = recentRooms.find(room => room.id === roomId);
  const pendingRequests = currentRoom?.pendingRequests || [];

  const handleApprove = (userId: string) => {
    approveAccess(roomId, userId);
    toast({
      title: "Access granted",
      description: "User has been granted access to the room",
    });
  };

  const handleDeny = (userId: string) => {
    denyAccess(roomId, userId);
    toast({
      title: "Access denied",
      description: "User's request has been denied",
    });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
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
      connectGithubRepo(roomId, githubRepo);
      setGithubRepo("");
    }
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
              {isOwner && pendingRequests.length > 0 && (
                <div className="mb-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Access Requests</AlertTitle>
                    <AlertDescription>
                      {pendingRequests.length} user(s) requesting access
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-3 space-y-2">
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleChat}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button className="w-full mt-4" variant="outline">
                Invite Collaborators
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="flex-1 overflow-hidden data-[state=active]:h-full">
            <Chat />
          </TabsContent>
          
          <TabsContent value="files" className="flex-1 overflow-hidden data-[state=active]:h-full">
            <FileExplorer files={files} />
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
                    />
                    <Button size="sm" onClick={handleConnectGithub}>Connect</Button>
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
                  <p className="text-sm font-medium">Commit Changes</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs p-1.5 bg-muted/50 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Added new function</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs p-1.5 bg-muted/50 rounded-md">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Modified index.js</span>
                  </div>
                </div>
                <Button className="w-full mt-3" size="sm">
                  Commit & Push
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Chat panel inside the collaboration panel - initially closed */}
        <div className={`
          absolute inset-y-0 right-0 w-80 bg-background border-l shadow-lg transform transition-transform duration-300 z-10
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <Chat onClose={toggleChat} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborationPanel;
