export interface SnippetPinRequest {
  snippetId: number,
  folder: number,
  /** if true the pinned snippet needs to be removed, if false, it needs to be added*/
  remove: boolean;
}
