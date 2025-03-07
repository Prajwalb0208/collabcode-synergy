import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import CodeEditor from "@/components/CodeEditor";
import AIAssistant from "@/components/AIAssistant";
import CollaborationPanel from "@/components/CollaborationPanel";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Play, Download, Save, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CodeFile {
  name: string;
  language: string;
  content: string;
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

  // Create a new room or joining an existing room
  if (!roomId) {
    // Creating a new room - no access control needed
    return (
      <MainLayout>
        <div className="container h-[calc(100vh-5rem)] py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                {roomId ? `Room: ${roomId}` : "New Room"}
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

          <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-12rem)] border rounded-lg">
            <ResizablePanel defaultSize={20} minSize={15}>
              <div className="flex h-full flex-col">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-sm">Files</h3>
                </div>
                <ScrollArea className="flex-1">
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
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={55}>
              <CodeEditor 
                code={currentFile.content}
                onChange={handleCodeChange}
                language={currentFile.language}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={25}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={50}>
                  <AIAssistant code={currentFile.content} />
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={50}>
                  <CollaborationPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
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
              {roomId ? `Room: ${roomId}` : "New Room"}
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

        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-12rem)] border rounded-lg">
          <ResizablePanel defaultSize={20} minSize={15}>
            <div className="flex h-full flex-col">
              <div className="p-3 border-b">
                <h3 className="font-medium text-sm">Files</h3>
              </div>
              <ScrollArea className="flex-1">
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
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={55}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <CodeEditor 
                  code={currentFile.content}
                  onChange={handleCodeChange}
                  language={currentFile.language}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={30}>
                <div className="h-full flex flex-col">
                  <div className="bg-black text-green-400 font-mono text-sm p-3 h-full overflow-auto">
                    {terminal.map((line, i) => (
                      <div key={i} className="mb-1">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={25}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50}>
                <AIAssistant code={currentFile.content} />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={50}>
                <CollaborationPanel isOwner={isRoomOwner(roomId || "")} roomId={roomId || ""} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </MainLayout>
  );
};

export default Room;
