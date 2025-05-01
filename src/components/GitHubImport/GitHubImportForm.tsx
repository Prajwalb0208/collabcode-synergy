
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface GitHubImportFormProps {
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
  error: string | null;
  onImport: () => void;
}

const GitHubImportForm: React.FC<GitHubImportFormProps> = ({
  url,
  setUrl,
  loading,
  error,
  onImport,
}) => {
  return (
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
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          onClick={onImport} 
          disabled={!url || loading}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Importing..." : "Import Files"}
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default GitHubImportForm;
