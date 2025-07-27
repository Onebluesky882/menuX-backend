import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'types/auth';
import { InsertUsers } from 'src/users/user.dto';
import { Response as ExpressResponse } from 'express';
import { Request } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthRequest,
    @Res() res: ExpressResponse,
  ) {
    const { tokens } = await this.authService.validateOrCreate(req.user);

    // Handle cookie setting in the controller
    this.authService.setTokenCookies(res, tokens);

    return res.redirect(
      process.env.ClIENT_REDIRECT_URL ?? 'http://localhost:5173/controller',
    );
  }

  @Post('register')
  async register(
    @Body() dto: InsertUsers,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    // 1) delegate creation to the plain UsersService
    const result = await this.authService.register(dto);

    // 2) issue a token
    this.authService.setTokenCookies(res, {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });

    // 4) return the token (and/or user profile)
    return {
      success: true,
      message: 'Registration successful',
      user: result.user,
      access_token: result.access_token,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: { email: string; password: string },
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    try {
      const result = await this.authService.login(dto.email, dto.password);

      this.authService.setTokenCookies(res, {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });

      return {
        success: true,
        message: 'Login successful',
        user: result.user,
        access_token: result.access_token,
      };
    } catch (error) {
      console.error('login failed', error);
      throw error;
    }
  }

  // ===== REFRESH TOKEN =====
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshToken(refreshToken);
    this.authService.setTokenCookies(res, {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
    return {
      success: true,
      access_token: result.access_token,
      user: result.user,
    };
  }

  // ===== LOGOUT =====
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: ExpressResponse) {
    this.authService.clearTokenCookies(res);
    return { success: true, message: 'Logout successful' };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: AuthRequest) {
    return {
      success: true,
      user: req.user,
    };
  }

  // line login

  // @Post(':id')
  // async loginByLine(
  //   @Body() body: LineUsersDto,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   const lineUserId = await this.lineUsersService.create(body);
  //   const jwt = await this.authService.loginByLine(lineUserId);
  //   res.cookie('access_token', jwt.access_token, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === 'production',
  //     maxAge: 7 * 86400 * 1000,
  //   });
  //   return { success: true };
  // }
}
