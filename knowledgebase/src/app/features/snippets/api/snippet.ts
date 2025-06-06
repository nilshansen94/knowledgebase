export interface Snippet {
  id: number;
  title: string;
  content: string;
  user_id: number;
  user_name: string;
  folder: number;
  isOwnSnippet: boolean;
  isPinned: boolean|number;//mysql returns 0 or 1
  public: boolean|number;//mysql returns 0 or 1
  isActive?: boolean;
}
