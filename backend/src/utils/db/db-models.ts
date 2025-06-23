import {Column, DataType, Model, Table} from 'sequelize-typescript';

@Table
export class User extends Model {
  //id is already there by default

  @Column(DataType.STRING(200))
  name: string;

  @Column(DataType.STRING(255))
  email: string;

  // these will be removed at some point
  @Column(DataType.TEXT)
  password: string;
  @Column(DataType.TEXT)
  salt: string;
  @Column(DataType.TEXT)
  secret: string;
}

@Table
export class Snippet extends Model {
  //id is already there by default

  @Column(DataType.STRING(500))
  title: string;

  @Column(DataType.TEXT)
  content: string;

  @Column(DataType.INTEGER)
  user_id: number;

  @Column(DataType.BOOLEAN)
  public: string;
}
