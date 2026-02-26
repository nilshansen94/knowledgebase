import {Folder, KbTreeNode} from '../api';

export const listToTree = (
  list: Folder[],
  parentKey = 'parent_id',
  idKey = 'id'
): KbTreeNode[] => {
  const map = new Map<string, any>();
  list.forEach(item => {
    map.set(item[idKey], {...item, isFolder: true, childNodes: []});
  });
  const dataTree = [];
  list.forEach(item => {
    if(item[parentKey]) {
      const parent = map.get(item[parentKey]);
      parent?.childNodes.push(map.get(item[idKey]));
    } else {
      dataTree.push(map.get(item[idKey]));
    }
  });
  return dataTree;
}
