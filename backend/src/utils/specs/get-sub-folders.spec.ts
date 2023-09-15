import {listToTree} from "../list-to-tree";
import {getSubFolders} from "../get-sub-folders";

describe('getSubFolders', () => {

  const list = [
    {id: 1, name: 'Akros', parent_id: null, user_id: 1},
    {id: 2, name: 'SQL', parent_id: null, user_id: 1},
    {id: 3, name: 'PSQL', parent_id: 2, user_id: 1},
    {id: 4, name: 'A', parent_id: 3, user_id: 1},
    {id: 5, name: 'B', parent_id: 3, user_id: 1},
    {id: 6, name: 'Mysql', parent_id: 2, user_id: 1},
    {id: 7, name: 'Misc', parent_id: null, user_id: 1},
    {id: 8, name: 'other_user', parent_id: null, user_id: 2},
  ];

  it('should get subFolders', () => {
    const tree = listToTree(list);
    const result = getSubFolders(tree, 2);
    expect(result).toStrictEqual([2,3,4,5,6]);
  });

  it('should return requested id when no subFolders are present', () => {
    const tree = listToTree(list);
    const result = getSubFolders(tree, 8);
    expect(result).toStrictEqual([8]);
  })

});
