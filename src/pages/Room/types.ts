
export interface CodeFile {
  name: string;
  language: string;
  content: string;
  id?: string;
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
  color?: string;
  avatar?: string;
  status?: 'active' | 'away' | 'offline';
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

export interface LiveCursor {
  x: number;
  y: number;
  userName: string;
}
