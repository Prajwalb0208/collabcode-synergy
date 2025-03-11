import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import CodeEditor from "@/components/CodeEditor";
import AIAssistant from "@/components/AIAssistant";
import CollaborationPanel from "@/components/CollaborationPanel";
import VideoCall from "@/components/VideoCall";
import Chat from "@/components/Chat";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Play, Download, Save, ShieldAlert, MessageCircle, Check, Terminal, Code, Video, Bot, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import FileExplorer from "@/components/FileExplorer";

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

interface VisiblePanels {
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
  const [activeTab, setActiveTab] = useState("main.js");
  const [visiblePanels, setVisiblePanels] = useState<VisiblePanels>({
    editor: true,
    terminal: true,
    videos: true,
    ai: true
  });
  const [showFileExplorer, setShowFileExplorer] = useState(true);

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
    
    if (currentFile.language === "javascript") {
      try {
        const originalLog = console.log;
        const logs: string[] = [];
        
        console.log = (...args) => {
          const output = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          logs.push(output);
          originalLog(...args);
        };
        
        const result = new Function(currentFile.content)();
        
        console.log = originalLog;
        
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

  const handleFileClick = (file: CodeFile) => {
    setCurrentFile(file);
    setActiveTab(file.name);
  };

  if (!roomId) {
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

          <div className="flex items-center gap-4 mb-4 border rounded-md p-2 bg-muted/30">
            <div className="text-sm font-medium">Show panels:</div>
            <div className="flex items-center gap-6">
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

          <div className="h-[calc(100vh-12rem)]">
            <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg overflow-hidden">
              {showFileExplorer && (
                <>
                  <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
                    <FileExplorer />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                </>
              )}
              
              <ResizablePanel 
                defaultSize={showFileExplorer ? 55 : 70} 
                minSize={30}
                className="flex flex-col"
              >
                <div className="bg-muted/30 px-1.5 pt-1.5 border-b">
                  <Tabs 
                    value={activeTab} 
                    className="w-full"
                    onValueChange={(value) => {
                      const selectedFile = files.find(f => f.name === value);
                      if (selectedFile) handleFileClick(selectedFile);
                    }}
                  >
                    <TabsList className="bg-transparent h-9 w-full justify-start">
                      {files.map((file) => (
                        <TabsTrigger 
                          key={file.name} 
                          value={file.name}
                          className="data-[state=active]:bg-background px-3 py-1.5 h-8"
                        >
                          {file.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={70} minSize={30}>
                    <div className="h-full">
                      <CodeEditor 
                        code={currentFile.content}
                        onChange={handleCodeChange}
                        language={currentFile.language}
                      />
                    </div>
                  </ResizablePanel>
                  
                  <ResizablePanel defaultSize={30} minSize={15}>
                    <div className="h-full bg-zinc-900">
                      <div className="flex items-center p-2 bg-zinc-800 border-b border-zinc-700">
                        <h3 className="text-sm font-medium text-zinc-300 flex items-center">
                          <Terminal className="h-4 w-4 mr-2 text-zinc-400" />
                          Terminal
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-auto text-zinc-300 hover:bg-zinc-700"
                          onClick={handleRunCode}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Run
                        </Button>
                      </div>
                      <div className="terminal-container custom-scrollbar">
                        {terminal.length === 0 ? (
                          <div className="text-zinc-500 italic">
                            Terminal ready. Click 'Run' to execute your code.
                          </div>
                        ) : (
                          terminal.map((line, i) => (
                            <div key={i} className="mb-1">
                              {line}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              {(visiblePanels.videos || visiblePanels.ai) && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel 
                    defaultSize={30} 
                    minSize={25}
                    className="flex flex-col gap-4 relative"
                  >
                    <ResizablePanelGroup direction="vertical">
                      {visiblePanels.videos && (
                        <ResizablePanel 
                          defaultSize={60} 
                          minSize={30}
                          className="border-t border-l border-r rounded-t-lg overflow-hidden"
                        >
                          <VideoCall onChatToggle={toggleChat} isChatOpen={isChatOpen} />
                        </ResizablePanel>
                      )}
                      
                      {visiblePanels.ai && (
                        <>
                          {visiblePanels.videos && <ResizableHandle withHandle />}
                          <ResizablePanel 
                            defaultSize={40} 
                            minSize={20} 
                            className="border rounded-b-lg overflow-hidden relative"
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

        <div className="flex items-center gap-4 mb-4 border rounded-md p-2 bg-muted/30">
          <div className="text-sm font-medium">Show panels:</div>
          <div className="flex items-center gap-6">
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

        <div className="h-[calc(100vh-12rem)]">
          <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg overflow-hidden">
            {showFileExplorer && (
              <>
                <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
                  <FileExplorer />
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}
              
            <ResizablePanel 
              defaultSize={showFileExplorer ? 55 : 70} 
              minSize={30}
              className="flex flex-col"
            >
              <div className="bg-muted/30 px-1.5 pt-1.5 border-b">
                <Tabs 
                  value={activeTab} 
                  className="w-full"
                  onValueChange={(value) => {
                    const selectedFile = files.find(f => f.name === value);
                    if (selectedFile) handleFileClick(selectedFile);
                  }}
                >
                  <TabsList className="bg-transparent h-9 w-full justify-start">
                    {files.map((file) => (
                      <TabsTrigger 
                        key={file.name} 
                        value={file.name}
                        className="data-[state=active]:bg-background px-3 py-1.5 h-8"
                      >
                        {file.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full">
                    <CodeEditor 
                      code={currentFile.content}
                      onChange={handleCodeChange}
                      language={currentFile.language}
                    />
                  </div>
                </ResizablePanel>
                
                <ResizablePanel defaultSize={30} minSize={15}>
                  <div className="h-full bg-zinc-900">
                    <div className="flex items-center p-2 bg-zinc-800 border-b border-zinc-700">
                      <h3 className="text-sm font-medium text-zinc-300 flex items-center">
                        <Terminal className="h-4 w-4 mr-2 text-zinc-400" />
                        Terminal
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto text-zinc-300 hover:bg-zinc-700"
                        onClick={handleRunCode}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                    </div>
                    <div className="terminal-container custom-scrollbar">
                      {terminal.length === 0 ? (
                        <div className="text-zinc-500 italic">
                          Terminal ready. Click 'Run' to execute your code.
                        </div>
                      ) : (
                        terminal.map((line, i) => (
                          <div key={i} className="mb-1">
                            {line}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            {(visiblePanels.videos || visiblePanels.ai) && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel 
                  defaultSize={30} 
                  minSize={25}
                  className="flex flex-col gap-4 relative"
                >
                  <ResizablePanelGroup direction="vertical">
                    {visiblePanels.videos && (
                      <ResizablePanel 
                        defaultSize={60} 
                        minSize={30}
                        className="border-t border-l border-r rounded-t-lg overflow-hidden"
                      >
                        <VideoCall onChatToggle={toggleChat} isChatOpen={isChatOpen} />
                      </ResizablePanel>
                    )}
                    
                    {visiblePanels.ai && (
                      <>
                        {visiblePanels.videos && <ResizableHandle withHandle />}
                        <ResizablePanel 
                          defaultSize={40} 
                          minSize={20} 
                          className="border rounded-b-lg overflow-hidden relative"
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
