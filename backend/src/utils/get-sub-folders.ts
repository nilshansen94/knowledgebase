import { Folder } from "../api";

/**
 * Get array of ids of the subFolders, including the searched id
 * If no subFolders are present, return array with the searched id
 * */
export const getSubFolders = (tree: Folder[], id: number) => {
  for(const folder of tree) {
    if(folder.id === id){
      const subFolders = getChildrenOf(folder).map(c => c.id);
      return [id, ...subFolders];
    } else if (folder.childNodes?.length > 0){
      return getSubFolders(folder.childNodes, id);
    }
  }
  return [id];
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
