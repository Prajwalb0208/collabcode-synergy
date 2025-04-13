
export interface CodeFile {
  name: string;
  language: string;
  content: string;
  path?: string;
}

export interface VisiblePanels {
  editor: boolean;
  terminal: boolean;
  videos: boolean;
  collaboration: boolean;
}

export interface GitHubRepo {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

export interface RoomSettings {
  name: string;
  description?: string;
  isPrivate: boolean;
  requireApproval: boolean;
  gitHubRepo?: GitHubRepo;
}
