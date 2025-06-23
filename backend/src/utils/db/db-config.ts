import mysql from 'mysql2';
import {QueryTypes} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';
import {Snippet, User} from './db-models';

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

// todo replace all usages of getClient() with the select/update/delete methods
export async function getClient(){
  return promisePool.getConnection();
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: false,//if true, it always writes createdAt and updatedAt columns
      freezeTableName: true,//keep table names
    },
    models: [User, Snippet],
  });

/*export function getSequelize(){
  return sequelize;
}*/

/*const User = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
});*/

/**
 * create tables if not existing
 */
export async function seqCreateTables(){
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`user\`(
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL)
    `);
  } catch (e) {
    console.log('cannot create table', e);
  }
}

//how to work with transactions and raw queries
// https://stackoverflow.com/questions/32965833

export function getTransaction(){
  return sequelize.transaction();
}

export async function select(sql: string, data?: any, transaction?: any): Promise<any[]> {
  if (data) {
    try {
      const res = await sequelize.query(sql, {
        bind: data,
        type: QueryTypes.SELECT,
        transaction,
      });
      return res;
    } catch (e) {
      console.error('cannot select', e);
    }
  }
  try {
    const res2 = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    });
    return res2;
  } catch (e) {
    console.log('cannot select', e);
  }
}

/**
 * Run an insert query
 * use $1, $2 and [val1, val2]
 * or $id, $name and {id:1, name: 'asdf'}
 * @param sql query
 * @param data Data to insert
 * @param transaction transaction for this query
 */
export async function insert(sql: string, data: any, transaction?: any) {
  try {
    const created = await sequelize.query(sql, {
      bind: data,
      type: QueryTypes.INSERT,
      transaction,
    });
    return created[1];//return number of affected rows
  } catch (e) {
    console.log('cannot insert', e);
  }
}

/**
 * Run an update query
 * use $1, $2 and [val1, val2]
 * or $id, $name and {id:1, name: 'asdf'}
 * @param sql query
 * @param data Data to set
 */
export async function update(sql: string, data: any, transaction?: any) {
  try {
    const [updated] = await sequelize.query(sql, {
      bind: data,
      type: QueryTypes.UPDATE,
      transaction,
    });
    return updated;//return number of affected rows
  } catch (e) {
    console.log('cannot update', e);
  }
}

export async function deleteFrom(sql: string, data?: any, transaction?: any) {
  try {
    if (data) {
      const del = await sequelize.query(sql, {
        bind: data,
        type: QueryTypes.DELETE,
        transaction,
      });
      return del;
    }
    const del2 = await sequelize.query(sql, {
      type: QueryTypes.DELETE,
    });
    return del2;
  } catch (e) {
    console.log('cannot delete', e);
  }
}
