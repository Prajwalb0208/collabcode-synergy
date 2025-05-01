
export interface CodeFile {
  name: string;
  language: string;
  content: string;
  id?: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  status: 'active' | 'away' | 'offline';
  cursorPosition?: {
    line: number;
    column: number;
    fileName: string;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor?: string;
  text: string;
  timestamp: Date | string;
}

export interface VisiblePanels {
  editor: boolean;
  terminal: boolean;
  git: boolean;
  videos: boolean;
  collaboration: boolean;
}

export interface GitHubRepo {
  name: string;
  url: string;
  owner: string;
  repo: string; // Added missing property
  branch?: string; // Added missing property
  path?: string; // Added missing property 
  isPrivate: boolean;
  description?: string;
  lastUpdated?: Date;
}
