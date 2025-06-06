import {Folder} from '../api';

/**
 * Get array of ids of the subFolders, including the searched id
 * If no subFolders are present, return array with the searched id
 * */
export const getSubFolders = (tree: Folder[], id: number): number[] => {
  const folder = findInTree(tree, id);
  if(!folder){
    //return impossible value so sql doesn't throw (https://stackoverflow.com/questions/13210233)
    return [-1];
  }
  return [folder.id, ...getChildrenOf(folder).map(f => f.id)];
}

const findInTree = (tree: Folder[], id: number): Folder => {
  for(const folder of tree) {
    if (folder.id === id){
      return folder;
    }
    if(folder.childNodes?.length > 0){
      const result = findInTree(folder.childNodes, id);
      if(result){return result}
    }
  }
}

const getChildrenOf = (folder: Folder): Folder[] => {
  const children = [];
  for(const child of folder.childNodes){
    children.push(child);
    if(child.childNodes?.length > 0){
      children.push(...getChildrenOf(child));
    }
  }
  return children;
}
