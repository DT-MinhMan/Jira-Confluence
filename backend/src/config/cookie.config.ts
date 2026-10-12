import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
  parsePositiveTtlSeconds,
} from '../modules/auth/config/auth-token-config.util';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
  domain?: string;
}

const BASE_COOKIE_OPTIONS = (
  configService: ConfigService,
): Omit<CookieOptions, 'maxAge'> => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const rawSameSite = configService.get<string>('COOKIE_SAME_SITE')?.toLowerCase();
  const sameSite: 'strict' | 'lax' | 'none' =
    rawSameSite === 'none' || rawSameSite === 'lax' || rawSameSite === 'strict'
      ? rawSameSite
      : isProduction
        ? 'strict'
        : 'lax';

  return {
    httpOnly: true,
    secure: isProduction || sameSite === 'none',
    sameSite,
    path: '/',
    domain: isProduction
      ? configService.get<string>('COOKIE_DOMAIN')
      : undefined,
  };
};

// Access token cookie maxAge follows ACCESS_TOKEN_TTL_SECONDS.
export const getAccessCookieOptions = (
  configService: ConfigService,
): CookieOptions => ({
  ...BASE_COOKIE_OPTIONS(configService),
  maxAge:
    parsePositiveTtlSeconds(
      configService.get<string>('ACCESS_TOKEN_TTL_SECONDS'),
      'ACCESS_TOKEN_TTL_SECONDS',
      DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
    ) * 1000,
});

// Refresh token cookie maxAge follows REFRESH_TOKEN_TTL_SECONDS.
export const getRefreshCookieOptions = (
  configService: ConfigService,
): CookieOptions => ({
  ...BASE_COOKIE_OPTIONS(configService),
  maxAge:
    parsePositiveTtlSeconds(
      configService.get<string>('REFRESH_TOKEN_TTL_SECONDS'),
      'REFRESH_TOKEN_TTL_SECONDS',
      DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
    ) * 1000,
});

// Device id cookie: 1 năm. HttpOnly + lax để browser tự gửi theo mọi request trong cùng site.
// Mục đích: định danh browser cho "Tài khoản gần đây trên thiết bị này".
// Không nhạy cảm (chỉ là UUID ngẫu nhiên, không leak identity), nên có thể giữ 1 năm.
export const getDeviceCookieOptions = (
  configService: ConfigService,
): CookieOptions => {
  const base = BASE_COOKIE_OPTIONS(configService);
  return {
    ...base,
    sameSite: base.sameSite === 'none' ? 'none' : 'lax',
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 năm
  };
};

// Backward-compat alias
export const getCookieOptions = getAccessCookieOptions;

export const JWT_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';
