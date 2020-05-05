import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database/db.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guard/jwt.strategy';

@Module({
  imports: [  
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: '123345',
      signOptions: {
        expiresIn: '1h',
      },
    }),],
  controllers: [AppController],
  providers: [AppService, DatabaseService, JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class AppModule {}
