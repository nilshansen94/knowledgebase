import {createSql} from './create';
import {PoolConnection} from 'mysql2/promise';
import {getClient} from './db-config';

const executeSqlStatements = async (sql: string, conn: PoolConnection) => {
  // Split by semicolon and filter out empty statements
  const statements = sql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

  // Execute each statement
  for (const statement of statements) {
    await conn.query(statement);
  }
};

export async function setupDb(): Promise<void> {
  const conn = await getClient();
  await executeSqlStatements(createSql, conn);
}
