import mysql from 'mysql2';

const mysqlConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  namedPlaceholders: true,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : undefined
};

const pool = mysql.createPool(mysqlConfig);
export const promisePool = pool.promise();
