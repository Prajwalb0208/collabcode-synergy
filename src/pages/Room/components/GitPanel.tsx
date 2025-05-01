
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CodeFile } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Github, GitBranch, GitCommit, GitPullRequest } from "lucide-react";

interface GitPanelProps {
  files: CodeFile[];
}

const GitPanel: React.FC<GitPanelProps> = ({ files }) => {
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("main");
  const [githubRepo, setGithubRepo] = useState<string>("");
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const { toast } = useToast();

  const handleCommit = () => {
    if (commitMessage.trim()) {
      setIsPushing(true);
      
      // Simulate a commit and push operation
      setTimeout(() => {
        setIsPushing(false);
        setCommitMessage("");
        
        toast({
          title: "Commit successful",
          description: `Changes committed to ${branchName} branch`,
        });
      }, 1500);
    }
  };
  
  const handleConnectGitRepo = () => {
    if (githubRepo.trim()) {
      toast({
        title: "Repository connected",
        description: `Connected to GitHub repository: ${githubRepo}`,
      });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* GitHub Repository Connection */}
        <div className="rounded-md border border-zinc-700 p-3">
          <p className="text-sm font-medium text-zinc-300 mb-2">GitHub Repository</p>
          <div className="flex gap-2">
            <Input 
              placeholder="username/repository" 
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-300"
            />
            <Button 
              size="sm" 
              onClick={handleConnectGitRepo}
              className="whitespace-nowrap"
            >
              <Github className="h-3.5 w-3.5 mr-2" />
              Connect
            </Button>
          </div>
        </div>
        
        {/* Branch Management */}
        <div className="rounded-md border border-zinc-700 p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-1">Current Branch</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">{branchName}</span>
                <Button variant="outline" size="sm" className="text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 h-7">
                  <GitBranch className="h-3.5 w-3.5 mr-1" />
                  Switch
                </Button>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 h-7"
            >
              <GitPullRequest className="h-3.5 w-3.5 mr-1" />
              Pull
            </Button>
          </div>
        </div>
        
        {/* Modified Files */}
        <div className="rounded-md border border-zinc-700 p-3">
          <p className="text-sm font-medium text-zinc-300 mb-2">Modified Files</p>
          <div className="space-y-2 mb-3">
            {files.slice(0, 3).map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between gap-2 text-xs p-1.5 bg-zinc-800 rounded-md text-zinc-300"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>{file.name}</span>
                </div>
                <div className="text-zinc-500 text-xs">Modified</div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="commit-message" className="text-zinc-300 text-sm">Commit Message</Label>
            <Input 
              id="commit-message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter commit message..."
              className="bg-zinc-800 border-zinc-700 text-zinc-300"
            />
            <Button 
              className="w-full" 
              variant="default"
              size="sm" 
              onClick={handleCommit}
              disabled={!commitMessage.trim() || isPushing}
            >
              <GitCommit className="h-3.5 w-3.5 mr-2" />
              {isPushing ? "Committing..." : "Commit Changes"}
            </Button>
          </div>
        </div>
        
        {/* Recent Commits */}
        <div className="rounded-md border border-zinc-700 p-3">
          <p className="text-sm font-medium text-zinc-300 mb-2">Recent Commits</p>
          <div className="space-y-2">
            <div className="text-xs p-2 bg-zinc-800 rounded-md">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Initial commit</span>
                <span className="text-zinc-500">2 hours ago</span>
              </div>
              <p className="text-zinc-500 mt-1 border-t border-zinc-700 pt-1">Initial project setup</p>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default GitPanel;
