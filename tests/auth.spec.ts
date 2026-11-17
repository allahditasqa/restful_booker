import { test, expect } from './fixtures';
import { ADMIN, buildBooking } from '../src/data/booking-data';

test.describe('Auth - CreateToken', () => {
  test('TC_AUTH_01 - Valid admin credentials return a token', async ({ api }) => {
    const res = await api.createToken(ADMIN);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(5);
  });

  test('TC_AUTH_02 - Wrong password returns "Bad credentials" and no token', async ({ api }) => {
    const res = await api.createToken({ username: 'admin', password: 'wrong' });
    expect(res.status()).toBe(200); // this API reports the failure in the body, not in the status
    const body = await res.json();
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });

  test('TC_AUTH_03 - Unknown username returns "Bad credentials"', async ({ api }) => {
    const body = await (await api.createToken({ username: 'nobody', password: 'password123' })).json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('TC_AUTH_04 - Empty body returns "Bad credentials"', async ({ api }) => {
    const body = await (await api.createToken({})).json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('TC_AUTH_05 - A fresh token is accepted by a protected endpoint', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    const token = await api.getToken();
    const res = await api.deleteBooking(id, 'token', token);
    expect(res.status()).toBe(201);
  });
});
