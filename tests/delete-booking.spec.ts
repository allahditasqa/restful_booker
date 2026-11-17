import { test, expect } from './fixtures';
import { buildBooking } from '../src/data/booking-data';

test.describe('Booking - DeleteBooking', () => {
  test('TC_DELETE_01 - Delete with a token cookie returns 201 Created', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    const token = await api.getToken();
    const res = await api.deleteBooking(id, 'token', token);
    expect(res.status()).toBe(201);
    expect(await res.text()).toBe('Created');
  });

  test('TC_DELETE_02 - A deleted booking can no longer be read (404)', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    const token = await api.getToken();
    await api.deleteBooking(id, 'token', token);
    expect((await api.getBooking(id)).status()).toBe(404);
  });

  test('TC_DELETE_03 - A deleted booking disappears from the list', async ({ api }) => {
    const booking = buildBooking();
    const id = await api.createAndGetId(booking);
    const token = await api.getToken();
    await api.deleteBooking(id, 'token', token);
    expect(await (await api.getBookingIds({ lastname: booking.lastname })).json()).toEqual([]);
  });

  test('TC_DELETE_04 - Delete with Basic auth works as an alternative to the token', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    const res = await api.deleteBooking(id, 'basic');
    expect(res.status()).toBe(201);
    expect((await api.getBooking(id)).status()).toBe(404);
  });

  test('TC_DELETE_05 - Delete without authorization returns 403 and keeps the booking', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const res = await api.deleteBooking(id, 'none');
      expect(res.status()).toBe(403);
      expect((await api.getBooking(id)).status()).toBe(200);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_DELETE_06 - Delete with an invalid token returns 403', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const res = await api.deleteBooking(id, 'badtoken');
      expect(res.status()).toBe(403);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_DELETE_07 - Deleting a booking id that does not exist returns 405', async ({ api }) => {
    const token = await api.getToken();
    const res = await api.deleteBooking(99999999, 'token', token);
    expect(res.status()).toBe(405);
  });

  test('TC_DELETE_08 - Deleting the same booking twice: the second call returns 405', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    const token = await api.getToken();
    expect((await api.deleteBooking(id, 'token', token)).status()).toBe(201);
    expect((await api.deleteBooking(id, 'token', token)).status()).toBe(405);
  });
});
