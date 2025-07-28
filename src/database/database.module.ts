import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from './database-connection';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../database';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.getOrThrow('DATABASE_URL'),
        });
        try {
          await pool.connect();
        } catch (error) {
          console.error('❌ Failed to connect to DB:', error);
          throw error; // ให้ NestJS รู้ว่า boot ไม่ผ่าน
        }
        return drizzle(pool, { schema });
      },

      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
