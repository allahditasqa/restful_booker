import { test, expect } from './fixtures';
import { buildBooking } from '../src/data/booking-data';

test.describe('Booking - PartialUpdateBooking (PATCH)', () => {
  test('TC_PATCH_01 - Changes only the sent fields and keeps the others', async ({ api }) => {
    const original = buildBooking();
    const id = await api.createAndGetId(original);
    try {
      const token = await api.getToken();
      const res = await api.partialUpdateBooking(id, { firstname: 'Patched', lastname: original.lastname }, 'token', token);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ ...original, firstname: 'Patched' });
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_PATCH_02 - A single field (totalprice) can be changed', async ({ api }) => {
    const original = buildBooking();
    const id = await api.createAndGetId(original);
    try {
      const token = await api.getToken();
      const res = await api.partialUpdateBooking(id, { totalprice: 5000 }, 'token', token);
      expect(res.status()).toBe(200);
      expect((await res.json()).totalprice).toBe(5000);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_PATCH_03 - The change is stored (GET returns it)', async ({ api }) => {
    const original = buildBooking();
    const id = await api.createAndGetId(original);
    try {
      const token = await api.getToken();
      await api.partialUpdateBooking(id, { additionalneeds: 'Late checkout' }, 'token', token);
      expect(await (await api.getBooking(id)).json()).toEqual({ ...original, additionalneeds: 'Late checkout' });
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_PATCH_04 - The booking dates can be changed', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const token = await api.getToken();
      const dates = { checkin: '2030-03-01', checkout: '2030-03-09' };
      const res = await api.partialUpdateBooking(id, { bookingdates: dates }, 'token', token);
      expect(res.status()).toBe(200);
      expect((await res.json()).bookingdates).toEqual(dates);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_PATCH_05 - Partial update with Basic auth works', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const res = await api.partialUpdateBooking(id, { firstname: 'BasicPatch' }, 'basic');
      expect(res.status()).toBe(200);
      expect((await res.json()).firstname).toBe('BasicPatch');
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_PATCH_06 - Partial update without authorization returns 403', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const res = await api.partialUpdateBooking(id, { firstname: 'NoAuth' }, 'none');
      expect(res.status()).toBe(403);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_PATCH_07 - Partial update with an invalid token returns 403', async ({ api }) => {
    const id = await api.createAndGetId(buildBooking());
    try {
      const res = await api.partialUpdateBooking(id, { firstname: 'BadToken' }, 'badtoken');
      expect(res.status()).toBe(403);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_PATCH_08 - Partial update of a booking id that does not exist returns 405', async ({ api }) => {
    const token = await api.getToken();
    const res = await api.partialUpdateBooking(99999999, { firstname: 'Ghost' }, 'token', token);
    expect(res.status()).toBe(405);
  });
});
