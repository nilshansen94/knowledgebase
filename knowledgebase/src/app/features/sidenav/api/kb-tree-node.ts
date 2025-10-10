import {Folder} from '@kb-rest/shared';

export interface KbTreeNode extends Folder{
  isFolder: boolean;
  childNodes?: KbTreeNode[]
}
