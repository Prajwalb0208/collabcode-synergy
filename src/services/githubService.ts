
import { toast } from "@/components/ui/use-toast";
import { GitHubRepo, CodeFile } from "@/pages/Room/types";

/**
 * Fetch a file from GitHub repository
 */
export const fetchFileFromGitHub = async (repo: GitHubRepo, filePath: string): Promise<string> => {
  try {
    const branch = repo.branch || 'main';
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${filePath}?ref=${branch}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // GitHub API returns content as base64 encoded
    return atob(data.content);
  } catch (error) {
    console.error("Error fetching file from GitHub:", error);
    toast({
      title: "GitHub Error",
      description: `Could not fetch file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    return '';
  }
};

/**
 * Fetch repository contents from GitHub
 */
export const fetchRepoContents = async (repo: GitHubRepo, path: string = ''): Promise<any[]> => {
  try {
    const branch = repo.branch || 'main';
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${path}?ref=${branch}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repository contents: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching repository contents:", error);
    toast({
      title: "GitHub Error",
      description: `Could not fetch repository contents: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Get file language from file extension
 */
export const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php'
  };
  
  return languageMap[extension] || 'plaintext';
};

/**
 * Import files from GitHub repository
 */
export const importFilesFromGitHub = async (repo: GitHubRepo): Promise<CodeFile[]> => {
  try {
    const contents = await fetchRepoContents(repo, repo.path || '');
    const files: CodeFile[] = [];
    
    // Process only files (not directories) and limit to common web dev file types
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md'];
    
    for (const item of contents) {
      if (item.type === 'file') {
        const extension = `.${item.name.split('.').pop()}`;
        
        if (allowedExtensions.includes(extension)) {
          const content = await fetchFileFromGitHub(repo, item.path);
          
          files.push({
            name: item.name,
            path: item.path,
            language: getLanguageFromFileName(item.name),
            content
          });
        }
      }
    }
    
    toast({
      title: "GitHub Import",
      description: `Successfully imported ${files.length} files from ${repo.owner}/${repo.repo}`,
    });
    
    return files;
  } catch (error) {
    console.error("Error importing files from GitHub:", error);
    toast({
      title: "GitHub Import Error",
      description: `Failed to import files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Parse GitHub repository URL into components
 */
export const parseGitHubUrl = (url: string): GitHubRepo | null => {
  try {
    // Handle different GitHub URL formats
    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)(?:\/(.+))?)?/;
    const match = url.match(githubRegex);
    
    if (!match) return null;
    
    const [, owner, repo, branch, path] = match;
    
    return {
      owner,
      repo: repo.replace('.git', ''),
      branch: branch || 'main',
      path: path || ''
    };
  } catch (error) {
    console.error("Error parsing GitHub URL:", error);
    return null;
  }
};
