
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CodeFile } from "../types";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface EditorTabBarProps {
  files: CodeFile[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentFile: CodeFile;
  onRenameFile?: (oldName: string, newName: string) => void;
  onDeleteFile?: (fileName: string) => void;
}

const EditorTabBar: React.FC<EditorTabBarProps> = ({
  files,
  activeTab,
  onTabChange,
  currentFile,
  onRenameFile,
  onDeleteFile,
}) => {
  const [isRenamingFile, setIsRenamingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const { toast } = useToast();

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file rename
  const handleRenameFileClick = () => {
    setIsRenamingFile(true);
    setNewFileName(currentFile.name);
  };

  // Submit file rename
  const submitRenameFile = () => {
    if (newFileName.trim() === "" || newFileName === currentFile.name) {
      setIsRenamingFile(false);
      return;
    }

    if (onRenameFile) {
      onRenameFile(currentFile.name, newFileName);
      setIsRenamingFile(false);
      toast({
        title: "File Renamed",
        description: `Renamed ${currentFile.name} to ${newFileName}`
      });
    }
  };

  // Handle file deletion
  const handleDeleteFile = () => {
    if (files.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You need to have at least one file in the project",
        variant: "destructive"
      });
      return;
    }

    if (onDeleteFile) {
      onDeleteFile(currentFile.name);
      toast({
        title: "File Deleted",
        description: `Deleted ${currentFile.name}`
      });
    }
  };

  return (
    <div className="bg-muted/30 px-1.5 pt-1.5 border-b">
      <Tabs 
        value={activeTab} 
        className="w-full"
        onValueChange={(value) => {
          const selectedFile = files.find(f => f.name === value);
          if (selectedFile) onTabChange(value);
        }}
      >
        <div className="flex justify-between items-center">
          <TabsList className="bg-transparent h-9 justify-start overflow-x-auto">
            {files.map((file) => (
              <TabsTrigger 
                key={file.name} 
                value={file.name}
                className="data-[state=active]:bg-background px-3 py-1.5 h-8 whitespace-nowrap"
              >
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-1 mr-2">
            {isRenamingFile ? (
              <div className="flex items-center">
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="h-7 text-sm mr-1 w-32"
                  autoFocus
                  onBlur={submitRenameFile}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitRenameFile();
                    if (e.key === 'Escape') setIsRenamingFile(false);
                  }}
                />
                <Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => setIsRenamingFile(false)}>
                  ✕
                </Button>
              </div>
            ) : (
              <>
                {onRenameFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRenameFileClick}
                    className="h-7"
                    title="Rename File"
                  >
                    Rename
                  </Button>
                )}
                {onDeleteFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteFile}
                    className="h-7 text-red-500 hover:text-red-600"
                    title="Delete File"
                  >
                    Delete
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadFile}
                  className="h-7"
                  title="Download File"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default EditorTabBar;
