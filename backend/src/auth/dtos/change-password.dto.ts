import { IsEmail, IsString } from "class-validator";

export class ChangePasswordDto {
    @IsEmail()
    email: string;
    @IsString()
    password: string;
    @IsString()
    newPassword: string;
}