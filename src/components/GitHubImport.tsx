
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CodeFile, GitHubRepo } from "@/pages/Room/types";
import { parseGitHubUrl, importFilesFromGitHub } from "@/services/githubService";
import { Github, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GitHubImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (files: CodeFile[]) => void;
}

const GitHubImport: React.FC<GitHubImportProps> = ({
  open,
  onOpenChange,
  onImportComplete
}) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const repoInfo = parseGitHubUrl(url);
      
      if (!repoInfo) {
        setError("Invalid GitHub URL. Please provide a valid GitHub repository URL.");
        setLoading(false);
        return;
      }
      
      const files = await importFilesFromGitHub(repoInfo);
      
      if (files.length === 0) {
        setError("No suitable files found in the repository. Try a different repository or path.");
        setLoading(false);
        return;
      }
      
      onImportComplete(files);
      onOpenChange(false);
      
      toast({
        title: "GitHub Import Successful",
        description: `Imported ${files.length} files from ${repoInfo.owner}/${repoInfo.repo}`,
      });
    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            Enter a GitHub repository URL to import files into your coding room.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">GitHub Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/username/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Example: https://github.com/facebook/react
            </p>
          </div>
          
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!url || loading}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Importing..." : "Import Files"}
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubImport;
