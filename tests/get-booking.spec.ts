import { test, expect } from './fixtures';
import { buildBooking } from '../src/data/booking-data';

test.describe('Booking - GetBooking', () => {
  test('TC_GET_01 - Returns all documented fields for an existing booking', async ({ api }) => {
    const booking = buildBooking();
    const id = await api.createAndGetId(booking);
    try {
      const res = await api.getBooking(id);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');
      expect(await res.json()).toEqual(booking);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_GET_02 - Field types match the documentation', async ({ api }) => {
    const [first] = await (await api.getBookingIds()).json();
    const body = await (await api.getBooking(first.bookingid)).json();
    expect(typeof body.firstname).toBe('string');
    expect(typeof body.lastname).toBe('string');
    expect(typeof body.totalprice).toBe('number');
    expect(typeof body.depositpaid).toBe('boolean');
    expect(body.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.bookingdates.checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('TC_GET_03 - Accept: application/xml returns an XML body', async ({ api }) => {
    const [first] = await (await api.getBookingIds()).json();
    const res = await api.getBooking(first.bookingid, 'application/xml');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('<?xml');
    expect(text).toContain('<booking>');
    expect(text).toContain('<firstname>');
  });

  test('TC_GET_06 - The XML response is labelled with an XML content type', async ({ api }) => {
    test.fail(true, 'KNOWN DEFECT D-03: XML body is sent with Content-Type text/html');
    const [first] = await (await api.getBookingIds()).json();
    const res = await api.getBooking(first.bookingid, 'application/xml');
    expect(res.headers()['content-type']).toContain('xml');
  });

  test('TC_GET_04 - A booking id that does not exist returns 404', async ({ api }) => {
    const res = await api.getBooking(99999999);
    expect(res.status()).toBe(404);
  });

  test('TC_GET_05 - A non-numeric id returns 404', async ({ api }) => {
    const res = await api.getBooking('abc');
    expect(res.status()).toBe(404);
  });
});
