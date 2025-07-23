import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { roles } from './roles';
export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text('email').unique(), // Required
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  active: boolean('active').default(false),
  nickname: text('nickname'),
  imageUrl: text('image_url'),
  updatedAt: timestamp('updated_at'),
  username: text('username'),
  birthday: text('birthday'),
  phone: text('phone'),
  emergency: text('emergency'),
  emergencyContact: text('emergency_contact'),
  agentId: uuid('agent_id'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  roleId: uuid('role_id').references(() => roles.id),
  lineUserId: text('line_user_id').unique(),
  linePictureUrl: text('line_picture_url'),
  lineDisplayName: text('line_display_name'),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  lastLoginAt: timestamp('last_login_at'),
  emailVerified: boolean('email_verified').default(false),
  provider: varchar('provider', { length: 50 }),
});
