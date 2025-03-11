
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderOpen, FolderClosed, FileText, FileCode, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
  expanded?: boolean;
}

const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([
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

  const toggleFolder = (nodeId: string) => {
    setFiles(prevFiles => {
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
    
    // File icons based on language
    switch (node.language) {
      case "typescript":
        return <FileCode className="h-4 w-4 text-blue-500" />;
      case "html":
        return <FileCode className="h-4 w-4 text-orange-500" />;
      case "json":
        return <FileCode className="h-4 w-4 text-green-500" />;
      case "markdown":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
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
          onClick={() => node.type === "folder" && toggleFolder(node.id)}
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
      <div className="p-2 border-b bg-muted/30">
        <h3 className="text-sm font-medium">Project Files</h3>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-2">
          {renderTree(files)}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
