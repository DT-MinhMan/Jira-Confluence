import { getLoginDelaySeconds } from './login-delay.policy';
import { LoginAttemptThrottleService } from './login-attempt-throttle.service';

describe('getLoginDelaySeconds', () => {
  it('starts cooldown after the fifth failed attempt', () => {
    expect(getLoginDelaySeconds(1)).toBe(0);
    expect(getLoginDelaySeconds(4)).toBe(0);
    expect(getLoginDelaySeconds(5)).toBe(1);
    expect(getLoginDelaySeconds(6)).toBe(2);
    expect(getLoginDelaySeconds(10)).toBe(30);
    expect(getLoginDelaySeconds(11)).toBe(60);
    expect(getLoginDelaySeconds(100)).toBe(60);
  });
});

describe('LoginAttemptThrottleService (In-Memory)', () => {
  const context = { email: ' User@Example.com ', ip: ' 127.0.0.1 ' };
  let service: LoginAttemptThrottleService;

  beforeEach(() => {
    service = new LoginAttemptThrottleService();
  });

  it('tracks failures and applies progressive delay', async () => {
    for (let i = 1; i <= 4; i++) {
      const res = await service.registerFailure(context);
      expect(res.emailAttempts).toBe(i);
      expect(res.retryAfterSeconds).toBe(0);
    }

    // 5th attempt -> 1s delay
    const fifth = await service.registerFailure(context);
    expect(fifth.emailAttempts).toBe(5);
    expect(fifth.retryAfterSeconds).toBe(1);

    const retrySec = await service.getRetryAfterSeconds(context);
    expect(retrySec).toBeGreaterThanOrEqual(1);
  });

  it('clears attempt state after success', async () => {
    await service.registerFailure(context);
    await service.registerFailure(context);

    await service.clear(context);
    const retrySec = await service.getRetryAfterSeconds(context);
    expect(retrySec).toBe(0);

    const fresh = await service.registerFailure(context);
    expect(fresh.emailAttempts).toBe(1);
  });
});
