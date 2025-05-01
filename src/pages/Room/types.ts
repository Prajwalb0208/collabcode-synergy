
export interface CodeFile {
  name: string;
  language: string;
  content: string;
  path?: string;
  folderId?: string;
}

export interface VisiblePanels {
  editor: boolean;
  terminal: boolean;
  git: boolean;
  videos: boolean;
  collaboration: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: string;
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
  timestamp: Date;
}

export interface GitHubRepo {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  children?: (Folder | FileReference)[];
}

export interface FileReference {
  id: string;
  name: string;
  fileId: string;
  parentId?: string;
}
