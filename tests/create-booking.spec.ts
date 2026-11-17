import { test, expect } from './fixtures';
import { buildBooking } from '../src/data/booking-data';

test.describe('Booking - CreateBooking', () => {
  test('TC_CREATE_01 - Creates a booking and echoes it with a new bookingid', async ({ api }) => {
    const booking = buildBooking();
    const res = await api.createBooking(booking);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.bookingid).toBe('number');
    expect(body.booking).toEqual(booking);
    await api.cleanup(body.bookingid);
  });

  test('TC_CREATE_02 - The created booking can be read back with the same data', async ({ api }) => {
    const booking = buildBooking({ firstname: 'Readback', totalprice: 250, depositpaid: false });
    const id = await api.createAndGetId(booking);
    try {
      expect(await (await api.getBooking(id)).json()).toEqual(booking);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_CREATE_03 - The created id appears in the booking list', async ({ api }) => {
    const booking = buildBooking();
    const id = await api.createAndGetId(booking);
    try {
      const list: { bookingid: number }[] = await (await api.getBookingIds({ lastname: booking.lastname })).json();
      expect(list.map((b) => b.bookingid)).toContain(id);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_CREATE_04 - Two bookings get two different ids', async ({ api }) => {
    const a = await api.createAndGetId(buildBooking());
    const b = await api.createAndGetId(buildBooking());
    try {
      expect(a).not.toBe(b);
    } finally {
      await api.cleanup(a);
      await api.cleanup(b);
    }
  });

  test('TC_CREATE_05 - additionalneeds is optional', async ({ api }) => {
    const booking = buildBooking();
    delete booking.additionalneeds;
    const res = await api.createBooking(booking);
    expect(res.status()).toBe(200);
    await api.cleanup((await res.json()).bookingid);
  });

  test('TC_CREATE_06 - XML payload with Accept: application/xml creates a booking', async ({ api }) => {
    const xml =
      '<booking><firstname>Xml</firstname><lastname>User</lastname><totalprice>10</totalprice>' +
      '<depositpaid>true</depositpaid><bookingdates><checkin>2018-01-01</checkin>' +
      '<checkout>2019-01-01</checkout></bookingdates><additionalneeds>None</additionalneeds></booking>';
    const res = await api.createBooking(xml, { 'Content-Type': 'text/xml', Accept: 'application/xml' });
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('<created-booking>');
    const id = Number(/<bookingid>(\d+)<\/bookingid>/.exec(text)?.[1]);
    expect(id).toBeGreaterThan(0);
    await api.cleanup(id);
  });

  test('TC_CREATE_07 - A payload with missing required fields is rejected with 500', async ({ api }) => {
    const res = await api.createBooking({ firstname: 'OnlyName' });
    expect(res.status()).toBe(500);
  });

  test('TC_CREATE_08 - An empty payload is rejected with 500', async ({ api }) => {
    const res = await api.createBooking({});
    expect(res.status()).toBe(500);
  });
});
