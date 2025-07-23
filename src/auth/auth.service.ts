import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { schema, users } from 'src/database';
import { CreateUserDto } from 'src/users/user.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { Cookie } from 'fastify-cookie';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ===== REGISTER =====
  async register(data: CreateUserDto) {
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    try {
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
          emailVerified: false,
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

      await this.db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.data?.id));

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

  async requestPasswordReset(email: string) {
    // find match email
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // handle if fail
    if (!user) {
      return {
        success: true,
        message: 'If email exists, reset instructions sent',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await this.db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
      })
      .where(eq(users.id, user.id));
    this.logger.log(`Password reset requested for ${email}`);
    return {
      success: true,
      message: 'Password reset instructions sent to email',
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.resetToken, token),
    });

    if (!user || !user.resetTokenExpiry || user.resetToken) {
      throw new BadRequestException('Invalid or expiry reset the password');
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);

    await this.db
      .update(users)
      .set({
        password: hashPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    return { success: true, message: 'Password reset successfully' };
  }

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

  async validateOrCreate(oauthUser: any, res: Response) {
    let user = await this.db.query.users.findFirst({
      where: eq(users.email, oauthUser.email),
    });

    if (!user) {
      const newUser = await this.db
        .insert(users)
        .values({
          email: oauthUser.email,
          username: oauthUser.username,
          emailVerified: true,
          provider: 'google',
        })
        .returning();
      user = newUser[0];
    }

    const tokens = await this.generateTokens({
      id: user?.id ?? '',
      email: user?.email ?? '',
      username: user?.username ?? '',
    });

    this.setTokenCookies(res, tokens);

    return tokens;
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
    res: Cookie,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearTokenCookies(res: Cookie) {
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
