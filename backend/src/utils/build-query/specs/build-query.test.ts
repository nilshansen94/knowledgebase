import {buildSelectSnippetQuery} from '../build-query';
import {promisePoolTest} from './db-config-test';
import {createSql} from './create';
import {insertSql} from './insert';
import {Snippet} from '../../../../../knowledgebase/src/app/features/snippets/api/snippet';

const executeSqlStatements = async (sql: string) => {
  // Split by semicolon and filter out empty statements
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  // Execute each statement
  for (const statement of statements) {
    await promisePoolTest.query(statement);
  }
};

const CLEANUP = false;

const dropTables = async () => {
  const tables = ['usr_fold_snip', 'snip_tag', 'tags', 'comment', 'snippet', 'folder', 'user'];
  for(const table of tables) {
    const result = await promisePoolTest.query(`DROP TABLE IF EXISTS \`${table}\``);
    console.log('dropped table', table, result);
  }
}

describe('buildSelectSnippetQuery', () => {

  beforeAll(async () => {
    if(CLEANUP) {
      // Setup database schema and insert test data
      await dropTables();
      await executeSqlStatements(createSql);
      await executeSqlStatements(insertSql);
    }
  });

  afterAll(async () => {
    await promisePoolTest.end();
  });

  it('should return own and pinned snippets when visiting a folder', async () => {
    const query = buildSelectSnippetQuery(undefined, 1, NaN);
    console.log(query);
    const [rows] = await promisePoolTest.execute(query, {
      search: undefined,
      userId: 1,
      userParam: 1,
      folderIds: 1
    }) as any;
    console.log(rows);
    expect(rows.length).toBe(2);
    expect(rows[0].title).toBe('A1 folder1');
    expect(rows[1].title).toBe('B2 folder1 public');
  });

  it('should return correct snippets when searching with specific parameters', async () => {
    // Build the query
    const searchParam = 'like';
    const folderId = 1;
    const userId = 1;

    const query = buildSelectSnippetQuery(searchParam, folderId, NaN);

    // Execute the query with parameters
    const [rows] = await promisePoolTest.execute(query, {
      search: searchParam,
      userId: userId,
      userParam: userId,
      folderIds: folderId
    }) as [Snippet[], any];

    // Expectations
    console.log(rows);
    console.log(query);
    expect(rows.length).toBe(3);
    expect(rows[0].title).toBe('A1 folder1');
    expect(rows[0].isOwnSnippet).toBe(1);
    expect(rows[0].isPinned).toBe(0);
    expect(rows[1].title).toBe('B2 folder1 public');
    expect(rows[1].isOwnSnippet).toBe(0);
    expect(rows[1].isPinned).toBe(1);
    expect(rows[1].public).toBe(1);
    expect(rows[2].title).toBe('B3 folder1 public');
    expect(rows[2].isOwnSnippet).toBe(0);
    expect(rows[2].isPinned).toBe(0);
    expect(rows[2].public).toBe(1);
  });

});
