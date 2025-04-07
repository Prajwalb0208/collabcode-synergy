
import { Button } from "@/components/ui/button";
import { Play, Download, Save, FileText } from "lucide-react";

interface RoomHeaderProps {
  roomId?: string;
  handleRunCode: () => void;
  showFileExplorer: boolean;
  setShowFileExplorer: (show: boolean) => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId,
  handleRunCode,
  showFileExplorer,
  setShowFileExplorer
}) => {
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
  );
};

export default RoomHeader;
