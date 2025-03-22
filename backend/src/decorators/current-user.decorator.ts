import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUserData } from 'src/dtos/current-user.interface';


export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    if (!request.user) {
      return null;
    }
    
    if (data) {
      return request.user[data];
    }
    
    return request.user;
  },
);