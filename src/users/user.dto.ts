import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from '../database';

export type SelectUsers = InferSelectModel<typeof users>;
export type InsertUsers = InferInsertModel<typeof users>;

export type CreateUserDto = Pick<
  InsertUsers,
  'email' | 'password' | 'username' | 'emailVerified'
>;
