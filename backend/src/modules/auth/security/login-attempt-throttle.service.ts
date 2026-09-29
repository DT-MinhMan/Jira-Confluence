import { Injectable, Logger } from '@nestjs/common';
import { getLoginDelaySeconds, LOGIN_DELAY_POLICY } from './login-delay.policy';

export interface LoginAttemptContext {
  email: string;
  ip: string;
}

export interface LoginFailureDelay {
  emailAttempts: number;
  ipAttempts: number;
  retryAfterSeconds: number;
}

interface AttemptRecord {
  attempts: number;
  windowExpiresAt: number;
  cooldownUntil: number;
}

@Injectable()
export class LoginAttemptThrottleService {
  private readonly logger = new Logger(LoginAttemptThrottleService.name);
  private readonly records = new Map<string, AttemptRecord>();

  async getRetryAfterSeconds(context: LoginAttemptContext): Promise<number> {
    const now = Date.now();
    const emailRecord = this.records.get(this.getKey('email', context.email));
    const ipRecord = this.records.get(this.getKey('ip', context.ip));

    const emailCooldown =
      emailRecord && emailRecord.cooldownUntil > now
        ? Math.ceil((emailRecord.cooldownUntil - now) / 1000)
        : 0;
    const ipCooldown =
      ipRecord && ipRecord.cooldownUntil > now
        ? Math.ceil((ipRecord.cooldownUntil - now) / 1000)
        : 0;

    return Math.max(emailCooldown, ipCooldown);
  }

  async registerFailure(
    context: LoginAttemptContext,
  ): Promise<LoginFailureDelay> {
    const now = Date.now();
    const emailResult = this.registerScopeFailure('email', context.email, now);
    const ipResult = this.registerScopeFailure('ip', context.ip, now);

    return {
      emailAttempts: emailResult.attempts,
      ipAttempts: ipResult.attempts,
      retryAfterSeconds: Math.max(
        emailResult.retryAfterSeconds,
        ipResult.retryAfterSeconds,
      ),
    };
  }

  async clear(context: LoginAttemptContext): Promise<void> {
    this.records.delete(this.getKey('email', context.email));
    this.records.delete(this.getKey('ip', context.ip));
  }

  private registerScopeFailure(
    scope: 'email' | 'ip',
    value: string,
    now: number,
  ): { attempts: number; retryAfterSeconds: number } {
    const key = this.getKey(scope, value);
    let record = this.records.get(key);

    if (!record || record.windowExpiresAt < now) {
      record = {
        attempts: 0,
        windowExpiresAt: now + LOGIN_DELAY_POLICY.failureWindowMs,
        cooldownUntil: 0,
      };
    }

    record.attempts += 1;
    record.windowExpiresAt = now + LOGIN_DELAY_POLICY.failureWindowMs;
    const delay = getLoginDelaySeconds(record.attempts);
    record.cooldownUntil = delay > 0 ? now + delay * 1000 : 0;
    this.records.set(key, record);

    return {
      attempts: record.attempts,
      retryAfterSeconds: delay,
    };
  }

  private getKey(scope: string, value: string): string {
    const normalized =
      scope === 'email'
        ? value.normalize('NFKC').trim().toLowerCase()
        : value.trim() || 'unknown';
    return `${scope}:${normalized}`;
  }
}
