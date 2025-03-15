import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true}), UserModule, AuthModule],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaService, AuthService, JwtService, UserService],
})
export class AppModule {}
