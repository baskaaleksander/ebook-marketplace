import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UserService } from '../user/user.service';
import { promisify } from 'util';
import { LoginUserDto } from './dtos/login-user.dto';
import { UserCredentialsDto } from './dtos/user-credentials.dto';
import { PrismaService } from '../prisma.service';
import { ChangePasswordDto } from './dtos/change-password.dto';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly userService: UserService, private prismaService: PrismaService) {}

    async register(user: CreateUserDto){


        const existingUser = await this.prismaService.user.findUnique({
            where: { email: user.email }
          });
          
          if (existingUser) {
            throw new UnauthorizedException('User already exists');
          }
          

        const salt = randomBytes(8).toString('hex');

        const hash = await scrypt(user.password, salt, 32) as Buffer;

        const result = salt + '.' + hash.toString('hex');

        const newUser = await this.userService.createUser({...user, password: result});

        
        return this.login({username: newUser.email, userId: newUser.id});
    }

    async validateCredentials(user: UserCredentialsDto){
        const users = await this.prismaService.user.findUnique({
            where: { email: user.email }
        });

        if(!users){
            throw new NotFoundException('User not found');
        }

        const [salt, storedHash] = users.password.split('.');
        const hash = await scrypt(user.password, salt, 32) as Buffer;

        if(storedHash !== hash.toString('hex')){
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.login({username: users.email, userId: users.id});
    }

    async changePassword(userId: string, user: ChangePasswordDto){
        const validated = await this.validateCredentials(user);
        
        if(!validated){
            throw new UnauthorizedException('Invalid credentials');
        }
        const salt = randomBytes(8).toString('hex');
        const hash = await scrypt(user.newPassword, salt, 32) as Buffer;
        const result = salt + '.' + hash.toString('hex');
        const updatedUser = await this.userService.updateUser(userId, {password: result});
        if(!updatedUser){
            throw new NotFoundException('User not found');
        }

        return this.login({username: updatedUser.data.email, userId: updatedUser.data.id});
    }

    async login(user: LoginUserDto){
        const payload = { username: user.username, userId: user.userId };
        return {
            access_token: this.jwtService.sign(payload, { secret: `${process.env.JWT_SECRET}` }),
            user: user.userId
        };
    }
}
