import { InferInsertModel } from 'drizzle-orm';
import { lineUser } from '../database';

export type LineUsersDto = InferInsertModel<typeof lineUser>;
