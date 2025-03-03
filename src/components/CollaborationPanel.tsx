
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Video, GitBranch } from "lucide-react";
import Chat from "./Chat";

const CollaborationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("collaborators");
  
  const collaborators = [
    { id: 1, name: "Alice Chen", avatar: "", color: "#3b82f6", status: "active" },
    { id: 2, name: "Bob Smith", avatar: "", color: "#10b981", status: "active" },
    { id: 3, name: "Charlie Davis", avatar: "", color: "#f59e0b", status: "away" }
  ];

  return (
    <Card className="w-full h-full border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
      <CardHeader className="pb-0 pt-4">
        <CardTitle className="text-base">Collaboration</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="collaborators" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3 mx-4 my-2">
            <TabsTrigger value="collaborators" onClick={() => setActiveTab("collaborators")}>
              <Users className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="chat" onClick={() => setActiveTab("chat")}>
              <MessageSquare className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="git" onClick={() => setActiveTab("git")}>
              <GitBranch className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Git</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="collaborators" className="flex-1 overflow-auto data-[state=active]:h-full">
            <div className="p-4 space-y-4">
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
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Video className="h-4 w-4" />
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
          
          <TabsContent value="git" className="p-4 data-[state=active]:h-full overflow-auto">
            <div className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default CollaborationPanel;
