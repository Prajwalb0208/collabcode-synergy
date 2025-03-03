
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique room ID
export function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

// Convert file extension to language
export function fileExtensionToLanguage(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'go': 'go',
    'rust': 'rust',
    'php': 'php',
    'md': 'markdown',
  };
  
  return extension ? (languageMap[extension] || 'plaintext') : 'plaintext';
}
