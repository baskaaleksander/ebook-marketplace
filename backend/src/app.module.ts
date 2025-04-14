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
import { ListingModule } from './listing/listing.module';
import { StripeModule } from './stripe/stripe.module';
import { ScheduleModule } from './schedule/schedule.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [ConfigModule.forRoot(
    { 
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.dev' : '.env'
    }), UserModule, AuthModule, ListingModule, StripeModule, ScheduleModule, UploadModule],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
