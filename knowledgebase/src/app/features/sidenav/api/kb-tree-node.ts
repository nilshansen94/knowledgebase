import {Folder} from './folder';

export interface KbTreeNode extends Folder{
  isFolder: boolean;
  childNodes?: KbTreeNode[]
}
