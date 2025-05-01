
import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FolderOpen, 
  FolderClosed, 
  FileText, 
  FileCode, 
  ChevronRight, 
  ChevronDown, 
  FilePlus, 
  FolderPlus,
  Move,
  Trash2,
  Edit
} from "lucide-react";
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
  parentId?: string;
}

interface FileExplorerProps {
  files?: CodeFile[];
  onFileSelect?: (file: CodeFile) => void;
  onCreateFile?: (fileName: string, language: string, folderId?: string, content?: string) => void;
  onCreateFolder?: (folderName: string, parentId?: string) => void;
  onMoveFile?: (fileId: string, targetFolderId: string) => void;
  onDeleteFile?: (fileName: string) => void;
  onRenameFile?: (oldName: string, newName: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onMoveFile,
  onDeleteFile,
  onRenameFile
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingNode, setRenamingNode] = useState<{id: string, oldName: string} | null>(null);
  const [newNodeName, setNewNodeName] = useState("");
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
  const [dropTargetNode, setDropTargetNode] = useState<FileNode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (files && files.length > 0) {
      const rootFolder: FileNode[] = [];
      
      files.forEach((file, index) => {
        rootFolder.push({
          id: file.id || `file-${index}`,
          name: file.name,
          type: "file",
          language: file.language,
          content: file.content
        });
      });
      
      setFileTree(rootFolder);
    } else {
      setFileTree([]);
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
    setSelectedNode(node);

    if (node.type === "file" && onFileSelect && files) {
      const selectedFile = files.find(f => f.name === node.name);
      if (selectedFile) {
        onFileSelect(selectedFile);
      } 
    } else if (node.type === "folder") {
      toggleFolder(node.id);
    }
  };

  const handleCreateFile = (folderId?: string) => {
    setSelectedNode(folderId ? findNodeById(folderId, fileTree) : null);
    setIsCreatingFile(true);
    setIsCreatingFolder(false);
    setIsRenaming(false);
  };

  const handleCreateFolder = (parentId?: string) => {
    setSelectedNode(parentId ? findNodeById(parentId, fileTree) : null);
    setIsCreatingFolder(true);
    setIsCreatingFile(false);
    setIsRenaming(false);
  };
  
  const handleRenameNode = (node: FileNode) => {
    setRenamingNode({ id: node.id, oldName: node.name });
    setNewNodeName(node.name);
    setIsRenaming(true);
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
  };
  
  const handleDeleteNode = (node: FileNode) => {
    if (node.type === "file" && onDeleteFile) {
      onDeleteFile(node.name);
    }
  };

  const findNodeById = (id: string, nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = findNodeById(id, node.children);
        if (found) return found;
      }
    }
    return null;
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
      
      onCreateFile(newFileName, language, selectedNode?.id);
      setNewFileName("");
      setIsCreatingFile(false);
      toast({
        title: "Success",
        description: `Created new file: ${newFileName} ${selectedNode ? 'in ' + selectedNode.name : ''}`
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
      onCreateFolder(newFolderName, selectedNode?.id);
      setNewFolderName("");
      setIsCreatingFolder(false);
      toast({
        title: "Success",
        description: `Created new folder: ${newFolderName} ${selectedNode ? 'in ' + selectedNode.name : ''}`
      });
    } else {
      toast({
        title: "Error",
        description: "Folder creation not available in this view"
      });
    }
  };
  
  const submitRename = () => {
    if (!renamingNode) return;
    
    if (newNodeName.trim() === "") {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const node = findNodeById(renamingNode.id, fileTree);
    if (node && node.type === "file" && onRenameFile) {
      onRenameFile(renamingNode.oldName, newNodeName);
      setIsRenaming(false);
      setRenamingNode(null);
      toast({
        title: "Success",
        description: `Renamed ${renamingNode.oldName} to ${newNodeName}`
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    setDraggedNode(node);
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedNode && node.type === 'folder' && node.id !== draggedNode.id) {
      setDropTargetNode(node);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = () => {
    setDropTargetNode(null);
  };

  const handleDrop = (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedNode && targetNode.type === 'folder' && targetNode.id !== draggedNode.id) {
      if (onMoveFile && draggedNode.type === 'file') {
        onMoveFile(draggedNode.id, targetNode.id);
        toast({
          title: "Success",
          description: `Moved ${draggedNode.name} to ${targetNode.name}`
        });
      }
    }
    
    setDraggedNode(null);
    setDropTargetNode(null);
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="file-tree-item">
        <div 
          className={cn(
            "flex items-center py-1 px-2 rounded-md hover:bg-muted/70 cursor-pointer select-none group",
            "transition-colors duration-100",
            { 
              "text-sm": level === 0, 
              "text-xs": level > 0,
              "bg-muted/50": selectedNode?.id === node.id,
              "border border-blue-400/50": dropTargetNode?.id === node.id
            }
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => handleFileNodeClick(node)}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
        >
          {node.type === "folder" && (
            node.expanded ? 
              <ChevronDown className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> : 
              <ChevronRight className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          )}
          {node.type === "file" && <span className="w-3.5 mr-1"></span>}
          {getFileIcon(node)}
          <span className="ml-1.5 truncate">{node.name}</span>
          
          {/* Context menu buttons on hover */}
          {node.type === "folder" && (
            <div className="ml-auto hidden group-hover:flex gap-1">
              <button 
                className="p-1 rounded hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFile(node.id);
                }}
                title="New File"
              >
                <FilePlus className="h-3 w-3" />
              </button>
              <button 
                className="p-1 rounded hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFolder(node.id);
                }}
                title="New Subfolder"
              >
                <FolderPlus className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {node.type === "file" && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1">
              <button 
                className="p-1 rounded hover:bg-muted"
                title="Rename File"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameNode(node);
                }}
              >
                <Edit className="h-3 w-3" />
              </button>
              <button 
                className="p-1 rounded hover:bg-muted"
                title="Delete File"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNode(node);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <button 
                className="p-1 rounded hover:bg-muted"
                title="Move File"
              >
                <Move className="h-3 w-3" />
              </button>
            </div>
          )}
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
            onClick={() => handleCreateFile()}
          >
            <FilePlus className="h-3.5 w-3.5" />
          </button>
          <button 
            className="p-1 rounded hover:bg-muted"
            title="New Folder"
            onClick={() => handleCreateFolder()}
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {(isCreatingFile || isCreatingFolder || isRenaming) && (
        <div className="p-2 border-b flex items-center gap-2">
          <Input 
            size={1}
            placeholder={
              isCreatingFile ? "File name" : 
              isCreatingFolder ? "Folder name" : 
              "New name"
            }
            value={
              isCreatingFile ? newFileName : 
              isCreatingFolder ? newFolderName : 
              newNodeName
            }
            onChange={(e) => {
              if (isCreatingFile) {
                setNewFileName(e.target.value);
              } else if (isCreatingFolder) {
                setNewFolderName(e.target.value);
              } else {
                setNewNodeName(e.target.value);
              }
            }}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (isCreatingFile) submitNewFile();
                else if (isCreatingFolder) submitNewFolder();
                else submitRename();
              } else if (e.key === 'Escape') {
                setIsCreatingFile(false);
                setIsCreatingFolder(false);
                setIsRenaming(false);
              }
            }}
            autoFocus
          />
          <Button 
            size="sm" 
            className="h-7 text-xs px-2"
            onClick={
              isCreatingFile ? submitNewFile : 
              isCreatingFolder ? submitNewFolder : 
              submitRename
            }
          >
            {isRenaming ? "Rename" : "Create"}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 text-xs px-2"
            onClick={() => {
              setIsCreatingFile(false);
              setIsCreatingFolder(false);
              setIsRenaming(false);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      
      <ScrollArea className={`h-[calc(100%-${(isCreatingFile || isCreatingFolder || isRenaming) ? '80px' : '40px'})]`}>
        <div className="p-2">
          {renderTree(fileTree)}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
