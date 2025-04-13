
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Code, Terminal, Video } from "lucide-react";
import { VisiblePanels } from "../types";

interface PanelToggleBarProps {
  visiblePanels: VisiblePanels;
  togglePanelVisibility: (panel: keyof VisiblePanels) => void;
}

const PanelToggleBar: React.FC<PanelToggleBarProps> = ({
  visiblePanels,
  togglePanelVisibility
}) => {
  return (
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
      </div>
    </div>
  );
};

export default PanelToggleBar;
