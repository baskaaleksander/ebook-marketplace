import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {

      await super.canActivate(context);
    } catch (err) {

    }
    
    return true;
  }
  

  handleRequest(err, user, info, context) {

    return user;
  }
}