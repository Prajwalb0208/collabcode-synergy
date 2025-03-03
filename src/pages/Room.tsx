
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import CodeEditor from "@/components/CodeEditor";
import AIAssistant from "@/components/AIAssistant";
import CollaborationPanel from "@/components/CollaborationPanel";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Play, Download, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
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

  const handleRunCode = () => {
    toast({
      title: "Code Execution",
      description: "Code is now running...",
    });
  };

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
};

export default Room;
