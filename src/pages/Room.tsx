
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeEditor from "@/components/CodeEditor";
import AIAssistant from "@/components/AIAssistant";
import CollaborationPanel from "@/components/CollaborationPanel";
import VideoCall from "@/components/VideoCall";
import Chat from "@/components/Chat";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Play, Download, Save, ShieldAlert, MessageCircle, Check, File, Terminal, Code, Video, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

interface VisiblePanels {
  files: boolean;
  editor: boolean;
  terminal: boolean;
  videos: boolean;
  ai: boolean;
}

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { 
    addRoom, 
    isRoomOwner, 
    isParticipant, 
    isPendingApproval, 
    requestAccess 
  } = useRoomHistory();
  const [currentFile, setCurrentFile] = useState<CodeFile>({
    name: "main.js",
    language: "javascript",
    content: "// Welcome to CollabCode!\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));"
  });
  const [files, setFiles] = useState<CodeFile[]>([
    {
      name: "main.js",
      language: "javascript",
      content: "// Welcome to CollabCode!\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));"
    },
    {
      name: "index.html",
      language: "html",
      content: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Document</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src=\"main.js\"></script>\n</body>\n</html>"
    },
    {
      name: "styles.css",
      language: "css",
      content: "body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: navy;\n}"
    }
  ]);
  const { toast } = useToast();
  const [terminal, setTerminal] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [visiblePanels, setVisiblePanels] = useState<VisiblePanels>({
    files: true,
    editor: true,
    terminal: true,
    videos: true,
    ai: true
  });

  // Add room to history when component mounts
  useEffect(() => {
    if (roomId && user) {
      addRoom(roomId);
    }
  }, [roomId, addRoom, user]);

  const handleCodeChange = (newCode: string) => {
    setCurrentFile({
      ...currentFile,
      content: newCode
    });
    
    // Update file in files array
    setFiles(prev => 
      prev.map(file => 
        file.name === currentFile.name 
          ? { ...file, content: newCode } 
          : file
      )
    );
  };

  const handleRunCode = async () => {
    setTerminal(prev => [...prev, `> Running ${currentFile.name}...`]);
    
    // For simple JavaScript code, we can use a basic evaluation approach
    // In a real app, you'd use Judge0 API or a similar service
    if (currentFile.language === "javascript") {
      try {
        // Capture console.log output
        const originalLog = console.log;
        const logs: string[] = [];
        
        console.log = (...args) => {
          const output = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          logs.push(output);
          originalLog(...args);
        };
        
        // Using Function constructor to evaluate the code
        // This is not secure for production use
        const result = new Function(currentFile.content)();
        
        // Restore console.log
        console.log = originalLog;
        
        // Add logs to terminal
        logs.forEach(log => {
          setTerminal(prev => [...prev, log]);
        });
        
        if (result !== undefined) {
          setTerminal(prev => [...prev, `=> ${result}`]);
        }
        
        setTerminal(prev => [...prev, "Execution completed."]);
      } catch (error) {
        setTerminal(prev => [...prev, `Error: ${error.message}`]);
      }
    } else {
      setTerminal(prev => [...prev, "Execution for this language is not supported in this demo."]);
      setTerminal(prev => [...prev, "In a real app, we would use Judge0 API here."]);
    }
    
    toast({
      title: "Code Execution",
      description: "Code executed in terminal.",
    });
  };

  // Check access control
  const handleRequestAccess = () => {
    if (roomId) {
      requestAccess(roomId);
      toast({
        title: "Access requested",
        description: "Waiting for the room owner to approve your request.",
      });
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const togglePanelVisibility = (panel: keyof VisiblePanels) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  // Create a new room or joining an existing room
  if (!roomId) {
    // Creating a new room - no access control needed
    return (
      <MainLayout>
        <div className="container h-[calc(100vh-5rem)] py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">New Room</h1>
              <p className="text-sm text-muted-foreground">
                Collaborative coding session
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRunCode}>
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Panel visibility controls */}
          <div className="flex items-center gap-4 mb-4 border rounded-md p-2 bg-muted/30">
            <div className="text-sm font-medium">Show panels:</div>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="files" 
                  checked={visiblePanels.files} 
                  onCheckedChange={() => togglePanelVisibility('files')}
                />
                <Label htmlFor="files" className="flex items-center text-sm">
                  <File className="h-3.5 w-3.5 mr-1.5" />
                  Files
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="editor" 
                  checked={visiblePanels.editor} 
                  onCheckedChange={() => togglePanelVisibility('editor')}
                />
                <Label htmlFor="editor" className="flex items-center text-sm">
                  <Code className="h-3.5 w-3.5 mr-1.5" />
                  Editor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="terminal" 
                  checked={visiblePanels.terminal} 
                  onCheckedChange={() => togglePanelVisibility('terminal')}
                />
                <Label htmlFor="terminal" className="flex items-center text-sm">
                  <Terminal className="h-3.5 w-3.5 mr-1.5" />
                  Terminal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="videos" 
                  checked={visiblePanels.videos} 
                  onCheckedChange={() => togglePanelVisibility('videos')}
                />
                <Label htmlFor="videos" className="flex items-center text-sm">
                  <Video className="h-3.5 w-3.5 mr-1.5" />
                  Video
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="ai" 
                  checked={visiblePanels.ai} 
                  onCheckedChange={() => togglePanelVisibility('ai')}
                />
                <Label htmlFor="ai" className="flex items-center text-sm">
                  <Bot className="h-3.5 w-3.5 mr-1.5" />
                  AI
                </Label>
              </div>
            </div>
          </div>

          {/* Resizable layout */}
          <div className="h-[calc(100vh-12rem)]">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Main coding area */}
              {visiblePanels.editor && (
                <ResizablePanel 
                  defaultSize={70} 
                  minSize={30}
                  className="flex flex-col border rounded-lg overflow-hidden"
                >
                  <ResizablePanelGroup direction="vertical">
                    {/* Files and Editor Section */}
                    <ResizablePanel defaultSize={70} minSize={30}>
                      <div className="flex h-full">
                        {/* Files List */}
                        {visiblePanels.files && (
                          <>
                            <div className="w-[200px] border-r">
                              <div className="p-3 border-b">
                                <h3 className="font-medium text-sm">Files</h3>
                              </div>
                              <ScrollArea className="h-[calc(100%-40px)]">
                                <div className="px-3 py-2">
                                  {files.map((file) => (
                                    <div
                                      key={file.name}
                                      className={`
                                        px-3 py-1.5 text-sm rounded-md cursor-pointer mb-1 
                                        ${currentFile.name === file.name
                                          ? "bg-accent text-accent-foreground font-medium"
                                          : "hover:bg-muted/50"
                                        }
                                      `}
                                      onClick={() => setCurrentFile(file)}
                                    >
                                      {file.name}
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                            <ResizableHandle withHandle />
                          </>
                        )}
                        {/* Code Editor */}
                        <div className="flex-1">
                          <CodeEditor 
                            code={currentFile.content}
                            onChange={handleCodeChange}
                            language={currentFile.language}
                          />
                        </div>
                      </div>
                    </ResizablePanel>
                    
                    {/* Terminal Section */}
                    {visiblePanels.terminal && (
                      <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={30} minSize={15}>
                          <div className="h-full">
                            <div className="flex items-center p-2 bg-muted/40 border-b">
                              <h3 className="text-sm font-medium">Terminal</h3>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-auto"
                                onClick={handleRunCode}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Run
                              </Button>
                            </div>
                            <div className="bg-black text-green-400 font-mono text-sm p-3 h-[calc(100%-40px)] overflow-auto">
                              {terminal.map((line, i) => (
                                <div key={i} className="mb-1">
                                  {line}
                                </div>
                              ))}
                            </div>
                          </div>
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                </ResizablePanel>
              )}

              {/* Right side panels */}
              {(visiblePanels.videos || visiblePanels.ai) && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel 
                    defaultSize={30} 
                    minSize={25}
                    className="flex flex-col gap-4 relative"
                  >
                    <ResizablePanelGroup direction="vertical">
                      {/* Video Call */}
                      {visiblePanels.videos && (
                        <ResizablePanel 
                          defaultSize={60} 
                          minSize={30}
                          className="border rounded-lg overflow-hidden"
                        >
                          <VideoCall onChatToggle={toggleChat} isChatOpen={isChatOpen} />
                        </ResizablePanel>
                      )}
                      
                      {/* AI Assistant & Collaboration */}
                      {visiblePanels.ai && (
                        <>
                          {visiblePanels.videos && <ResizableHandle withHandle />}
                          <ResizablePanel 
                            defaultSize={40} 
                            minSize={20} 
                            className="border rounded-lg overflow-hidden relative"
                          >
                            <Tabs defaultValue="ai" className="h-full flex flex-col">
                              <div className="border-b px-3">
                                <TabsList className="bg-transparent h-12">
                                  <TabsTrigger value="ai" className="data-[state=active]:bg-background">
                                    AI Assistant
                                  </TabsTrigger>
                                  <TabsTrigger value="collaboration" className="data-[state=active]:bg-background">
                                    Collaboration
                                  </TabsTrigger>
                                </TabsList>
                              </div>
                              <TabsContent value="ai" className="flex-1 m-0 p-0 overflow-hidden">
                                <AIAssistant code={currentFile.content} />
                              </TabsContent>
                              <TabsContent value="collaboration" className="flex-1 m-0 p-0 overflow-hidden">
                                <CollaborationPanel 
                                  isOwner={isRoomOwner(roomId || "")} 
                                  roomId={roomId || ""} 
                                />
                              </TabsContent>
                            </Tabs>
                          </ResizablePanel>
                        </>
                      )}
                    </ResizablePanelGroup>
                    
                    {/* Full-height Chat Panel */}
                    <div className={`
                      absolute inset-y-0 right-0 w-80 bg-background border-l shadow-lg transform transition-transform duration-300 z-30
                      ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}>
                      <Chat onClose={toggleChat} />
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if user can access the room
  if (user && !isRoomOwner(roomId) && !isParticipant(roomId)) {
    if (isPendingApproval(roomId)) {
      return (
        <MainLayout>
          <div className="container py-12">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Waiting for approval</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Access Pending</AlertTitle>
                  <AlertDescription>
                    Your request to join this room is waiting for approval from the room owner.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={() => window.location.href = "/rooms"}
                >
                  Back to Rooms
                </Button>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      );
    }
    
    return (
      <MainLayout>
        <div className="container py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Required</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Permission Required</AlertTitle>
                <AlertDescription>
                  You need permission to join this room. Request access from the room owner.
                </AlertDescription>
              </Alert>
              <div className="flex gap-4 mt-4">
                <Button 
                  variant="default" 
                  className="flex-1" 
                  onClick={handleRequestAccess}
                >
                  Request Access
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => window.location.href = "/rooms"}
                >
                  Back to Rooms
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container h-[calc(100vh-5rem)] py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              Room: {roomId}
            </h1>
            <p className="text-sm text-muted-foreground">
              Collaborative coding session
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRunCode}>
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Panel visibility controls */}
        <div className="flex items-center gap-4 mb-4 border rounded-md p-2 bg-muted/30">
          <div className="text-sm font-medium">Show panels:</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="files" 
                checked={visiblePanels.files} 
                onCheckedChange={() => togglePanelVisibility('files')}
              />
              <Label htmlFor="files" className="flex items-center text-sm">
                <File className="h-3.5 w-3.5 mr-1.5" />
                Files
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="editor" 
                checked={visiblePanels.editor} 
                onCheckedChange={() => togglePanelVisibility('editor')}
              />
              <Label htmlFor="editor" className="flex items-center text-sm">
                <Code className="h-3.5 w-3.5 mr-1.5" />
                Editor
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="terminal" 
                checked={visiblePanels.terminal} 
                onCheckedChange={() => togglePanelVisibility('terminal')}
              />
              <Label htmlFor="terminal" className="flex items-center text-sm">
                <Terminal className="h-3.5 w-3.5 mr-1.5" />
                Terminal
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="videos" 
                checked={visiblePanels.videos} 
                onCheckedChange={() => togglePanelVisibility('videos')}
              />
              <Label htmlFor="videos" className="flex items-center text-sm">
                <Video className="h-3.5 w-3.5 mr-1.5" />
                Video
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="ai" 
                checked={visiblePanels.ai} 
                onCheckedChange={() => togglePanelVisibility('ai')}
              />
              <Label htmlFor="ai" className="flex items-center text-sm">
                <Bot className="h-3.5 w-3.5 mr-1.5" />
                AI
              </Label>
            </div>
          </div>
        </div>

        {/* Resizable layout */}
        <div className="h-[calc(100vh-12rem)]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Main coding area */}
            {visiblePanels.editor && (
              <ResizablePanel 
                defaultSize={70} 
                minSize={30}
                className="flex flex-col border rounded-lg overflow-hidden"
              >
                <ResizablePanelGroup direction="vertical">
                  {/* Files and Editor Section */}
                  <ResizablePanel defaultSize={70} minSize={30}>
                    <div className="flex h-full">
                      {/* Files List */}
                      {visiblePanels.files && (
                        <>
                          <div className="w-[200px] border-r">
                            <div className="p-3 border-b">
                              <h3 className="font-medium text-sm">Files</h3>
                            </div>
                            <ScrollArea className="h-[calc(100%-40px)]">
                              <div className="px-3 py-2">
                                {files.map((file) => (
                                  <div
                                    key={file.name}
                                    className={`
                                      px-3 py-1.5 text-sm rounded-md cursor-pointer mb-1 
                                      ${currentFile.name === file.name
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "hover:bg-muted/50"
                                      }
                                    `}
                                    onClick={() => setCurrentFile(file)}
                                  >
                                    {file.name}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                          <ResizableHandle withHandle />
                        </>
                      )}
                      {/* Code Editor */}
                      <div className="flex-1">
                        <CodeEditor 
                          code={currentFile.content}
                          onChange={handleCodeChange}
                          language={currentFile.language}
                        />
                      </div>
                    </div>
                  </ResizablePanel>
                  
                  {/* Terminal Section */}
                  {visiblePanels.terminal && (
                    <>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={30} minSize={15}>
                        <div className="h-full">
                          <div className="flex items-center p-2 bg-muted/40 border-b">
                            <h3 className="text-sm font-medium">Terminal</h3>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-auto"
                              onClick={handleRunCode}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Run
                            </Button>
                          </div>
                          <div className="bg-black text-green-400 font-mono text-sm p-3 h-[calc(100%-40px)] overflow-auto">
                            {terminal.map((line, i) => (
                              <div key={i} className="mb-1">
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      </ResizablePanel>
                    </>
                  )}
                </ResizablePanelGroup>
              </ResizablePanel>
            )}

            {/* Right side panels */}
            {(visiblePanels.videos || visiblePanels.ai) && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel 
                  defaultSize={30} 
                  minSize={25}
                  className="flex flex-col gap-4 relative"
                >
                  <ResizablePanelGroup direction="vertical">
                    {/* Video Call */}
                    {visiblePanels.videos && (
                      <ResizablePanel 
                        defaultSize={60} 
                        minSize={30}
                        className="border rounded-lg overflow-hidden"
                      >
                        <VideoCall onChatToggle={toggleChat} isChatOpen={isChatOpen} />
                      </ResizablePanel>
                    )}
                    
                    {/* AI Assistant & Collaboration */}
                    {visiblePanels.ai && (
                      <>
                        {visiblePanels.videos && <ResizableHandle withHandle />}
                        <ResizablePanel 
                          defaultSize={40} 
                          minSize={20} 
                          className="border rounded-lg overflow-hidden relative"
                        >
                          <Tabs defaultValue="ai" className="h-full flex flex-col">
                            <div className="border-b px-3">
                              <TabsList className="bg-transparent h-12">
                                <TabsTrigger value="ai" className="data-[state=active]:bg-background">
                                  AI Assistant
                                </TabsTrigger>
                                <TabsTrigger value="collaboration" className="data-[state=active]:bg-background">
                                  Collaboration
                                </TabsTrigger>
                              </TabsList>
                            </div>
                            <TabsContent value="ai" className="flex-1 m-0 p-0 overflow-hidden">
                              <AIAssistant code={currentFile.content} />
                            </TabsContent>
                            <TabsContent value="collaboration" className="flex-1 m-0 p-0 overflow-hidden">
                              <CollaborationPanel 
                                isOwner={isRoomOwner(roomId)} 
                                roomId={roomId} 
                              />
                            </TabsContent>
                          </Tabs>
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                  
                  {/* Full-height Chat Panel */}
                  <div className={`
                    absolute inset-y-0 right-0 w-80 bg-background border-l shadow-lg transform transition-transform duration-300 z-30
                    ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
                  `}>
                    <Chat onClose={toggleChat} />
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </MainLayout>
  );
};

export default Room;
