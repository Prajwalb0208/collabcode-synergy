
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CodeFile, GitHubRepo } from "@/pages/Room/types";
import { parseGitHubUrl, importFilesFromGitHub } from "@/services/githubService";
import { Github } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import GitHubImportForm from "./GitHubImportForm";

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
        
        <GitHubImportForm 
          url={url}
          setUrl={setUrl}
          loading={loading}
          error={error}
          onImport={handleImport}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubImport;
