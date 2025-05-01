
import { useCallback } from 'react';
import { socketService } from "@/services/socketService";
import { CodeFile } from "../types";

export function useFileOperations({
  roomId,
  files,
  setFiles,
  currentFile,
  setCurrentFile,
  activeTab,
  setActiveTab,
  toast,
  updateRoomFiles,
  setLastSavedTime,
  autoSave,
  lastSavedTime,
  folders,
  setFolders
}) {
  // File operations
  const handleCodeChange = useCallback((newCode: string) => {
    setCurrentFile({
      ...currentFile,
      content: newCode
    });
    
    const updatedFiles = files.map(file => 
      file.name === currentFile.name 
        ? { ...file, content: newCode } 
        : file
    );
    
    setFiles(updatedFiles);
    
    if (roomId) {
      socketService.emit("file-update", { files: updatedFiles, roomId });
      
      if (autoSave) {
        const now = new Date();
        const timeSinceLastSave = lastSavedTime ? now.getTime() - lastSavedTime.getTime() : 60000;
        
        if (timeSinceLastSave > 5000) {
          updateRoomFiles(roomId, updatedFiles);
          setLastSavedTime(now);
          
          if (!lastSavedTime || timeSinceLastSave > 300000) {
            toast({
              title: "Changes Saved",
              description: "All your changes have been automatically saved.",
            });
          }
        }
      }
    }
  }, [currentFile, files, roomId, autoSave, lastSavedTime, updateRoomFiles, setLastSavedTime, setCurrentFile, setFiles, toast]);

  const handleFileClick = useCallback((file: CodeFile) => {
    setCurrentFile(file);
    setActiveTab(file.name);
    
    if (roomId) {
      socketService.emit("file-selected", { fileName: file.name, roomId });
    }
  }, [roomId, setCurrentFile, setActiveTab]);

  const handleCreateFile = useCallback((fileName: string, language: string, folderId?: string, content: string = "") => {
    if (files.some(file => file.name === fileName)) {
      toast({
        title: "Error",
        description: `File ${fileName} already exists`,
        variant: "destructive"
      });
      return;
    }
    
    let fileContent = content;
    if (!content) {
      if (language === 'html') {
        fileContent = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>New Document</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>";
      } else {
        fileContent = `// New ${language} file`;
      }
    }
    
    const newFile: CodeFile = {
      name: fileName,
      language,
      content: fileContent,
      id: `file-${Date.now()}`
    };
    
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setCurrentFile(newFile);
    setActiveTab(fileName);
    
    if (roomId) {
      socketService.emit("file-update", { files: updatedFiles, roomId });
      
      updateRoomFiles(roomId, updatedFiles);
      setLastSavedTime(new Date());
    }
    
    toast({
      title: "File Created",
      description: `Created new file: ${fileName}`,
    });
  }, [files, roomId, toast, setFiles, setCurrentFile, setActiveTab, updateRoomFiles, setLastSavedTime]);

  const handleDeleteFile = useCallback((fileName: string) => {
    // Prevent deleting the last file
    if (files.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You need at least one file in the project",
        variant: "destructive"
      });
      return;
    }
    
    const updatedFiles = files.filter(file => file.name !== fileName);
    setFiles(updatedFiles);
    
    // If we're deleting the current file, switch to another one
    if (currentFile.name === fileName) {
      const newCurrentFile = updatedFiles[0];
      setCurrentFile(newCurrentFile);
      setActiveTab(newCurrentFile.name);
    }
    
    if (roomId) {
      socketService.emit("file-update", { files: updatedFiles, roomId });
      
      updateRoomFiles(roomId, updatedFiles);
      setLastSavedTime(new Date());
    }
    
    toast({
      title: "File Deleted",
      description: `Deleted file: ${fileName}`,
    });
  }, [files, currentFile, roomId, setFiles, setCurrentFile, setActiveTab, toast, updateRoomFiles, setLastSavedTime]);

  const handleRenameFile = useCallback((oldName: string, newName: string) => {
    // Check if file with the new name already exists
    if (files.some(file => file.name === newName)) {
      toast({
        title: "Error",
        description: `File ${newName} already exists`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedFiles = files.map(file => 
      file.name === oldName 
        ? { ...file, name: newName } 
        : file
    );
    
    setFiles(updatedFiles);
    
    // Update current file if it was renamed
    if (currentFile.name === oldName) {
      setCurrentFile({ ...currentFile, name: newName });
      setActiveTab(newName);
    }
    
    if (roomId) {
      socketService.emit("file-update", { files: updatedFiles, roomId });
      
      updateRoomFiles(roomId, updatedFiles);
      setLastSavedTime(new Date());
    }
    
    toast({
      title: "File Renamed",
      description: `Renamed ${oldName} to ${newName}`,
    });
  }, [files, currentFile, roomId, toast, setFiles, setCurrentFile, setActiveTab, updateRoomFiles, setLastSavedTime]);

  const handleCreateFolder = useCallback((folderName: string, parentId?: string) => {
    // Implementation for folder creation
    toast({
      title: "Folder Created",
      description: `Created new folder: ${folderName}`,
    });
    
    const updatedFolders = [...(folders || []), folderName];
    
    if (setFolders) {
      setFolders(updatedFolders);
    }
    
    if (roomId) {
      socketService.emit("folder-update", { 
        folders: updatedFolders, 
        roomId 
      });
    }
  }, [folders, roomId, toast, setFolders]);

  const handleMoveFile = useCallback((fileId: string, targetFolderId: string) => {
    // Implementation for moving files
    toast({
      title: "File Moved",
      description: "File has been moved to the selected folder",
    });
    
    if (roomId) {
      socketService.emit("file-moved", { 
        fileId, 
        targetFolderId,
        roomId 
      });
    }
  }, [roomId, toast]);

  return {
    handleCodeChange,
    handleFileClick,
    handleCreateFile,
    handleDeleteFile,
    handleRenameFile,
    handleCreateFolder,
    handleMoveFile
  };
}
