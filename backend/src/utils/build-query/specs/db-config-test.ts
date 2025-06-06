import mysql from 'mysql2';

const mysqlConfigTest = {
  host: 'localhost',
  port: 8861,
  user: 'root',
  password: 'root',
  database: 'kb_rest_test',
  namedPlaceholders: true,
};

const pool = mysql.createPool(mysqlConfigTest);
export const promisePoolTest = pool.promise();
