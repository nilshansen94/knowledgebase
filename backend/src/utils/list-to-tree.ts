// from https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
export const listToTree = (
  list: any[],
  parentKey = 'parent_id',
  idKey = 'id'
) => {
  const map = new Map<string, any>();
  list.forEach(item => {
    map.set(item[idKey], {...item, isFolder: true, childNodes: []});
  });
  const dataTree = [];
  list.forEach(item => {
    if(item[parentKey]) {
      const child = {...map.get(item[idKey]), parent_id: item[parentKey]};
      map.get(item[parentKey]).childNodes.push(child);
    } else {
      dataTree.push(map.get(item[idKey]));
    }
  });
  return dataTree;
}
