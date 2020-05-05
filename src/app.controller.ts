import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DatabaseService } from './database/db.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { get } from 'http';
import { async } from 'rxjs/internal/scheduler/async';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { email, name, password } = body;
    const isUserExist = await this.databaseService.find({ email }, 'auths');
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

  @Get('profile')
  async getUsers(@Body() any){
    const { name } = any;
    const user = await this.databaseService.find({ name }, 'auths');
    if (!user) {
      throw new HttpException(
        `User profile not found in the database.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
    
  }



}
