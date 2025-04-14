
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Code, Terminal, Video, Users } from "lucide-react";
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
    <div className="flex flex-wrap items-center gap-4 mb-4 border rounded-md p-3 bg-card shadow-sm">
      <div className="text-sm font-medium text-muted-foreground">Workspace Panels:</div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
          <Switch 
            id="editor" 
            checked={visiblePanels.editor} 
            onCheckedChange={() => togglePanelVisibility('editor')}
          />
          <Label htmlFor="editor" className="flex items-center text-sm cursor-pointer">
            <Code className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
            Editor
          </Label>
        </div>
        <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
          <Switch 
            id="terminal" 
            checked={visiblePanels.terminal} 
            onCheckedChange={() => togglePanelVisibility('terminal')}
          />
          <Label htmlFor="terminal" className="flex items-center text-sm cursor-pointer">
            <Terminal className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
            Terminal
          </Label>
        </div>
        <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
          <Switch 
            id="videos" 
            checked={visiblePanels.videos} 
            onCheckedChange={() => togglePanelVisibility('videos')}
          />
          <Label htmlFor="videos" className="flex items-center text-sm cursor-pointer">
            <Video className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
            Video
          </Label>
        </div>
        <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
          <Switch 
            id="collaboration" 
            checked={visiblePanels.collaboration} 
            onCheckedChange={() => togglePanelVisibility('collaboration')}
          />
          <Label htmlFor="collaboration" className="flex items-center text-sm cursor-pointer">
            <Users className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
            Collaboration
          </Label>
        </div>
      </div>
    </div>
  );
};

export default PanelToggleBar;
