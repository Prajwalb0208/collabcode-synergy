
import { Button } from "@/components/ui/button";
import { Play, Download, Save, FileText, FilePlus, Share } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface RoomHeaderProps {
  roomId?: string;
  handleRunCode: () => void;
  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
  onCreateFile?: (fileName: string, language: string, content?: string) => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId,
  handleRunCode,
  showFileExplorer,
  setShowFileExplorer,
  onCreateFile
}) => {
  const { toast } = useToast();

  const handleNewFile = () => {
    if (onCreateFile) {
      const fileName = prompt("Enter file name:", "newfile.js");
      if (fileName) {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        let language = 'javascript';
        
        if (extension === 'html') language = 'html';
        else if (extension === 'css') language = 'css';
        else if (extension === 'json') language = 'json';
        else if (extension === 'ts' || extension === 'tsx') language = 'typescript';
        
        onCreateFile(fileName, language);
      }
    }
  };

  const handleShareRoom = () => {
    if (roomId) {
      navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
      toast({
        title: "Room link copied!",
        description: "Share this link with collaborators to join this room."
      });
    }
  };

  return (
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
        <Button variant="outline" size="sm" onClick={handleNewFile}>
          <FilePlus className="h-4 w-4 mr-2" />
          New File
        </Button>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={handleShareRoom}>
          <Share className="h-4 w-4 mr-2" />
          Share
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
  );
};

export default RoomHeader;
