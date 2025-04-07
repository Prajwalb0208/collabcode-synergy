
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderOpen, FolderClosed, FileText, FileCode, ChevronRight, ChevronDown, FilePlus, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeFile } from "@/pages/Room/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
  expanded?: boolean;
  content?: string;
}

interface FileExplorerProps {
  files?: CodeFile[];
  onFileSelect?: (file: CodeFile) => void;
  onCreateFile?: (fileName: string, language: string, content?: string) => void;
  onCreateFolder?: (folderName: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  onFileSelect,
  onCreateFile,
  onCreateFolder
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const { toast } = useToast();

  // Convert flat files to tree structure
  useEffect(() => {
    if (files && files.length > 0) {
      // Group files into folders based on path
      const rootFolder: FileNode[] = [];
      
      // Add all files to the root directory for now
      files.forEach((file, index) => {
        rootFolder.push({
          id: `file-${index}`,
          name: file.name,
          type: "file",
          language: file.language,
          content: file.content
        });
      });
      
      setFileTree(rootFolder);
    } else {
      // Default demo file tree when no files are provided
      setFileTree([
        {
          id: "1",
          name: "src",
          type: "folder",
          expanded: true,
          children: [
            {
              id: "2",
              name: "components",
              type: "folder",
              expanded: true,
              children: [
                { id: "3", name: "Button.tsx", type: "file", language: "typescript" },
                { id: "4", name: "Card.tsx", type: "file", language: "typescript" },
                { id: "5", name: "Input.tsx", type: "file", language: "typescript" },
              ]
            },
            {
              id: "6",
              name: "pages",
              type: "folder",
              children: [
                { id: "7", name: "Home.tsx", type: "file", language: "typescript" },
                { id: "8", name: "About.tsx", type: "file", language: "typescript" },
              ]
            },
            { id: "9", name: "App.tsx", type: "file", language: "typescript" },
            { id: "10", name: "main.tsx", type: "file", language: "typescript" },
          ]
        },
        {
          id: "11",
          name: "public",
          type: "folder",
          children: [
            { id: "12", name: "index.html", type: "file", language: "html" },
            { id: "13", name: "favicon.ico", type: "file" },
          ]
        },
        { id: "14", name: "package.json", type: "file", language: "json" },
        { id: "15", name: "tsconfig.json", type: "file", language: "json" },
        { id: "16", name: "README.md", type: "file", language: "markdown" },
      ]);
    }
  }, [files]);

  const toggleFolder = (nodeId: string) => {
    setFileTree(prevFiles => {
      const toggleNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, expanded: !node.expanded };
          }
          if (node.children) {
            return { ...node, children: toggleNode(node.children) };
          }
          return node;
        });
      };
      return toggleNode(prevFiles);
    });
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === "folder") {
      return node.expanded ? <FolderOpen className="h-4 w-4 text-yellow-500" /> : <FolderClosed className="h-4 w-4 text-yellow-500" />;
    }
    
    switch (node.language) {
      case "typescript":
        return <FileCode className="h-4 w-4 text-blue-500" />;
      case "javascript":
        return <FileCode className="h-4 w-4 text-yellow-500" />;
      case "html":
        return <FileCode className="h-4 w-4 text-orange-500" />;
      case "css":
        return <FileCode className="h-4 w-4 text-blue-500" />;
      case "json":
        return <FileCode className="h-4 w-4 text-green-500" />;
      case "markdown":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleFileNodeClick = (node: FileNode) => {
    if (node.type === "file" && onFileSelect && files) {
      const selectedFile = files.find(f => f.name === node.name);
      if (selectedFile) {
        onFileSelect(selectedFile);
      }
    }
  };

  const handleCreateFile = () => {
    setIsCreatingFile(true);
    setIsCreatingFolder(false);
  };

  const handleCreateFolder = () => {
    setIsCreatingFolder(true);
    setIsCreatingFile(false);
  };

  const submitNewFile = () => {
    if (newFileName.trim() === "") {
      toast({
        title: "Error",
        description: "File name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (onCreateFile) {
      const extension = newFileName.split('.').pop()?.toLowerCase() || '';
      let language = 'javascript';
      
      if (extension === 'html') language = 'html';
      else if (extension === 'css') language = 'css';
      else if (extension === 'json') language = 'json';
      else if (extension === 'ts' || extension === 'tsx') language = 'typescript';
      else if (extension === 'md') language = 'markdown';
      
      onCreateFile(newFileName, language);
      setNewFileName("");
      setIsCreatingFile(false);
      toast({
        title: "Success",
        description: `Created new file: ${newFileName}`
      });
    } else {
      toast({
        title: "Error",
        description: "File creation not available in this view"
      });
    }
  };

  const submitNewFolder = () => {
    if (newFolderName.trim() === "") {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (onCreateFolder) {
      onCreateFolder(newFolderName);
      setNewFolderName("");
      setIsCreatingFolder(false);
      toast({
        title: "Success",
        description: `Created new folder: ${newFolderName}`
      });
    } else {
      toast({
        title: "Error",
        description: "Folder creation not available in this view"
      });
    }
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="file-tree-item">
        <div 
          className={cn(
            "flex items-center py-1 px-2 rounded-md hover:bg-muted/70 cursor-pointer select-none",
            "transition-colors duration-100",
            { "text-sm": level === 0, "text-xs": level > 0 }
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => node.type === "folder" ? toggleFolder(node.id) : handleFileNodeClick(node)}
        >
          {node.type === "folder" && (
            node.expanded ? 
              <ChevronDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> : 
              <ChevronRight className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          )}
          {node.type === "file" && <span className="w-3.5 mr-1"></span>}
          {getFileIcon(node)}
          <span className="ml-1.5 truncate">{node.name}</span>
        </div>
        
        {node.type === "folder" && node.expanded && node.children && (
          <div className="file-tree-children">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full border-t">
      <div className="p-2 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="text-sm font-medium">Project Files</h3>
        <div className="flex gap-1">
          <button 
            className="p-1 rounded hover:bg-muted"
            title="New File"
            onClick={handleCreateFile}
          >
            <FilePlus className="h-3.5 w-3.5" />
          </button>
          <button 
            className="p-1 rounded hover:bg-muted"
            title="New Folder"
            onClick={handleCreateFolder}
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {(isCreatingFile || isCreatingFolder) && (
        <div className="p-2 border-b flex items-center gap-2">
          <Input 
            size={1}
            placeholder={isCreatingFile ? "File name" : "Folder name"}
            value={isCreatingFile ? newFileName : newFolderName}
            onChange={(e) => {
              if (isCreatingFile) {
                setNewFileName(e.target.value);
              } else {
                setNewFolderName(e.target.value);
              }
            }}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                isCreatingFile ? submitNewFile() : submitNewFolder();
              } else if (e.key === 'Escape') {
                setIsCreatingFile(false);
                setIsCreatingFolder(false);
              }
            }}
            autoFocus
          />
          <Button 
            size="sm" 
            className="h-7 text-xs px-2"
            onClick={isCreatingFile ? submitNewFile : submitNewFolder}
          >
            Create
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 text-xs px-2"
            onClick={() => {
              setIsCreatingFile(false);
              setIsCreatingFolder(false);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      
      <ScrollArea className={`h-[calc(100%-${(isCreatingFile || isCreatingFolder) ? '80px' : '40px'})]`}>
        <div className="p-2">
          {renderTree(fileTree)}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
