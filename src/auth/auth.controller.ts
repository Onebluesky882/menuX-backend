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
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthRequest,
    @Res() res: ExpressResponse,
  ) {
    const { tokens } = await this.authService.validateOrCreate(req.user);

    res.cookie('access_token', tokens, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.redirect(
      process.env.FRONTEND_REDIRECT_URL ?? 'http://localhost:5173/controller',
    );
  }

  // ... rest of your methods using ExpressResponse
}
