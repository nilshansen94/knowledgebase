import {Column, DataType, Model, PrimaryKey, Table} from 'sequelize-typescript';

@Table({tableName: 'kb_user'})
export class KbUser extends Model {
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

@Table({tableName: 'snippet'})
  export class Snippet extends Model {
  //id is already there by default

  @Column(DataType.STRING(255))
  title: string;

  @Column(DataType.TEXT)
  content: string;

  @Column(DataType.INTEGER)
  user_id: number;

  @Column(DataType.BOOLEAN)
  public: boolean;
}

@Table({tableName: 'folder'})
export class Folder extends Model {

  @Column(DataType.STRING(200))
  name: string;

  @Column(DataType.INTEGER)
  parent_id: number;

  @Column(DataType.INTEGER)
  user_id: number;
}

@Table({tableName: 'usr_fold_snip'})
export class UsrFoldSnip extends Model {

  @PrimaryKey
  @Column(DataType.INTEGER)
  user_id: number;

  @PrimaryKey
  @Column(DataType.INTEGER)
  snip_id: number;

  @Column(DataType.INTEGER)
  folder: number;
}
