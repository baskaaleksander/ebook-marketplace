import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.url.startsWith('/stripe/webhook')) {
      return true;
    }

    if (request.url === '/ping' || request.url === '/api/v1/ping') {
      return true;
    }
    
    const apiKey = request.headers['x-api-key'];

    const validApiKeys = this.configService.get<string>('API_KEY');

    if (!apiKey || !validApiKeys?.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
