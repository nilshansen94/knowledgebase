import {listToTree} from "../list-to-tree";

describe('list-to-tree', () => {

  it('should convert list to tree', () => {
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
    const tree = listToTree(list);
    expect(tree.find(i => i.name === 'SQL').childNodes[0].childNodes.length).toBe(2);
    expect(tree.length).toBe(4);
  })

});
