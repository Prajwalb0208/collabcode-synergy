
export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export interface VisiblePanels {
  editor: boolean;
  terminal: boolean;
  videos: boolean;
  ai: boolean;
}
