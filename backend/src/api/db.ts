export interface DbUser {
  id: number;
  name: string;
  email?: string;
  password: string;
  salt: string;
  secret: string;
}
