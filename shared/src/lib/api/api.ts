export interface Folder {
  id: number;
  name: string;
  parent_id?: number;
  user_id?: number;
  childNodes?: Folder[];
  snippets?: Snippet[];
}

export interface KbTreeNode extends Folder{
  isFolder: boolean;
  childNodes?: KbTreeNode[];
}

export interface Snippet {
  id: number;
  title: string;
  content: string;
  user_id: number;
  ufs_user?: number;
  user_name: string;
  folder: number;
  is_own_snippet: boolean;
  is_pinned: boolean|number;//mysql returns 0 or 1
  public: boolean|number;//mysql returns 0 or 1
  isActive?: boolean;
}

export function isSnippet(obj: any) {
  return obj?.hasOwnProperty('is_own_snippet');
}

export interface User {
  id: number;
  name: string;
  email?: string;
}
