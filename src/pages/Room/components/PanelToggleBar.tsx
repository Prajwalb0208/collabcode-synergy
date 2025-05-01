
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Code, Terminal, GitBranch } from "lucide-react";
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
            id="git" 
            checked={visiblePanels.git} 
            onCheckedChange={() => togglePanelVisibility('git')}
          />
          <Label htmlFor="git" className="flex items-center text-sm cursor-pointer">
            <GitBranch className="h-3.5 w-3.5 mr-1.5 text-primary/80" />
            Git
          </Label>
        </div>
      </div>
    </div>
  );
};

export default PanelToggleBar;
