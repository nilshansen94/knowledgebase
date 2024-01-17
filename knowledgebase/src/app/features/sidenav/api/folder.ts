export interface Folder {
  id: number;
  name: string;
  parent_id?: number;
  user_id?: number;
  childNodes?: Folder[]
}
//todo move to lib
