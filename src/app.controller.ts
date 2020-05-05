import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DatabaseService } from './database/db.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './guard/payload.interface';
import { AuthGuard } from '@nestjs/passport';
import { get } from 'http';
import { async } from 'rxjs/internal/scheduler/async';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { email, name, password } = body;
    const isUserExist = await this.databaseService.findOne({ email }, 'auths');
    if (isUserExist) {
      throw new HttpException(
        `You are already registered with us.`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const createdUser = await this.databaseService.add(body, 'auths');
    return createdUser;
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    const user = await this.databaseService.find({ email, password }, 'auths');
    if (!user) {
      throw new HttpException(
        `You are not registered with us.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  @UseGuards(AuthGuard())
  @Get('profile')
  async getUsers(@Req() req: any): Promise<JwtPayload>{
    const user = req.user;

    return user;
  }



}
