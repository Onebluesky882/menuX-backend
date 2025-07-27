import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { schema, users } from 'src/database';
import { InsertUsers } from 'src/users/user.dto';
import { ConfigService } from '@nestjs/config';
import { Response as ExpressResponse } from 'express';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ===== REGISTER =====
  async register(data: InsertUsers) {
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    try {
      // Guard input
      if (!data.email || !data.password || !data.username) {
        throw new BadRequestException('Missing required fields');
      }
      // Check if user already exists
      const existingUser = await this.db.query.users.findFirst({
        where: eq(users.email, data.email),
      });
      if (existingUser) {
        throw new BadRequestException('user with this email already exists');
      }

      // Create user
      const [newUser] = (await this.db
        .insert(users)
        .values({
          email: data.email,
          username: data.username,
          password: hashedPassword,
        })
        .returning()) as any[];

      // Generate access & refresh tokens
      const tokens = await this.generateTokens({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });

      const { password: _, ...safeUser } = newUser;
      return {
        message: 'Registration successful',
        success: true,
        user: safeUser,
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw error;
    }
  }

  // ===== LOGIN =====
  async login(email: string, password: string) {
    try {
      const user = await this.validateUser(email, password);

      if (!user.success) {
        throw new UnauthorizedException('invalid credentials');
      }

      const tokens = await this.generateTokens({
        id: String(user?.data?.id),
        email: String(user?.data?.email),
        username: String(user?.data?.username),
      });

      return {
        message: 'Login successful',
        status: 'success',
        success: true,
        user: user.data,
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Login failed:', error);
      throw error;
    }
  }

  // ===== REFRESH TOKEN =====
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.db.query.users.findFirst({
        where: eq(users.id, payload.id),
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email ?? '',
        username: user.username ?? '',
      });

      const { password: _, ...safeUser } = user;

      return {
        success: true,
        user: safeUser,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  //  ===== PASSWORD RESET =====

  async validateUser(email: string, password: string) {
    //fide user
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // handle error if not found
    if (!user || !user.password) {
      return { success: false };
    }

    // try to match password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false };
    }

    // replace password for protect
    const { password: _, ...safeUser } = user;

    return { success: true, data: safeUser };
  }
  // AuthService
  async validateOrCreate(oauthUser: any) {
    let user = await this.db.query.users.findFirst({
      where: eq(users.email, oauthUser.email),
    });

    if (!user) {
      const newUser = await this.db
        .insert(users)
        .values({
          email: oauthUser.email,
          username: oauthUser.username,
        })
        .returning();
      user = newUser[0];
    }

    const tokens = await this.generateTokens({
      id: user?.id ?? '',
      email: user?.email ?? '',
      username: user?.username ?? '',
    });

    return { tokens, user };
  }

  // ===== UTILITY METHODS =====

  async generateTokens(payload: {
    id: string;
    email: string;
    username?: string;
  }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  setTokenCookies(
    res: ExpressResponse,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false, // <--- secure เฉพาะ production
      sameSite: isProd ? 'strict' : 'lax', // <--- Lax สำหรับ dev
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // <--- secure เฉพาะ production
      sameSite: isProd ? 'strict' : 'lax', // <--- Lax สำหรับ dev
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearTokenCookies(res: ExpressResponse) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  signToken(payload: { id: string; email?: string; username?: string }) {
    return this.jwtService.sign(payload);
  }

  // line validate
  // async validateLineLogin(id: string) {
  //   const user = await this.db.query.users.findFirst({
  //     where: eq(users.lineUserId, id),
  //   });
  //   if (!user) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  //   return user;
  // }

  // async loginByLine(lineUserId: string) {
  //   const user = await this.validateLineLogin(lineUserId);
  //   const payload = {
  //     id: user.id,
  //   };
  //   const token = this.jwtService.sign(payload);
  //   console.log('access_token :', token);
  //   return { access_token: token };
  // }
}
