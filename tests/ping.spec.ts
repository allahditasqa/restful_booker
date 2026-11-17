import { test, expect } from './fixtures';

test.describe('Ping - HealthCheck', () => {
  test('TC_PING_01 - GET /ping answers 201 Created', async ({ api }) => {
    const res = await api.ping();
    expect(res.status()).toBe(201);
    expect(await res.text()).toBe('Created');
  });
});
