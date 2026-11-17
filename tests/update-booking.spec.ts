import { test, expect } from './fixtures';
import { buildBooking } from '../src/data/booking-data';

test.describe('Booking - UpdateBooking (PUT)', () => {
  test('TC_UPDATE_01 - Full update with a token cookie returns the new data', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const token = await api.getToken();
      const updated = buildBooking({ firstname: 'James', totalprice: 999, depositpaid: false, additionalneeds: 'Dinner' });
      const res = await api.updateBooking(id, updated, 'token', token);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual(updated);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_UPDATE_02 - The update is stored (GET returns the new data)', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const token = await api.getToken();
      const updated = buildBooking({ firstname: 'Stored', totalprice: 321 });
      await api.updateBooking(id, updated, 'token', token);
      expect(await (await api.getBooking(id)).json()).toEqual(updated);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_UPDATE_03 - Full update with Basic auth works as an alternative to the token', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const updated = buildBooking({ firstname: 'BasicAuth' });
      const res = await api.updateBooking(id, updated, 'basic');
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual(updated);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_UPDATE_04 - Update without any authorization returns 403', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const res = await api.updateBooking(id, buildBooking({ firstname: 'NoAuth' }), 'none');
      expect(res.status()).toBe(403);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_UPDATE_05 - Update with an invalid token returns 403', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const res = await api.updateBooking(id, buildBooking({ firstname: 'BadToken' }), 'badtoken');
      expect(res.status()).toBe(403);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_UPDATE_06 - A rejected update leaves the booking unchanged', async ({ api }) => {
    const original = buildBooking();
    const id = await api.createAndGetId(original);
    try {
      await api.updateBooking(id, buildBooking({ firstname: 'ShouldNotApply' }), 'none');
      expect(await (await api.getBooking(id)).json()).toEqual(original);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_UPDATE_07 - Update of a booking id that does not exist returns 405', async ({ api }) => {
    const token = await api.getToken();
    const res = await api.updateBooking(99999999, buildBooking(), 'token', token);
    expect(res.status()).toBe(405);
  });
});
