export interface DbUser {
  id: number;
  name: string;
  password: string;
  salt: string;
  secret: string;
}
