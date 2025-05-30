import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        UserModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
      ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UserService, PrismaService, ConfigService],
    exports: [AuthService],
})
export class AuthModule {}
