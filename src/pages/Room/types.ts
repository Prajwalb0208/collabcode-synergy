
export interface VisiblePanels {
  editor: boolean;
  terminal: boolean;
  videos: boolean;
  collaboration: boolean;
}

export interface CodeFile {
  name: string;
  language: string;
  content: string;
  lastEdited?: Date;
  editedBy?: string;
  path?: string;
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  lastSaved?: Date;
}

export interface GitHubRepo {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}
