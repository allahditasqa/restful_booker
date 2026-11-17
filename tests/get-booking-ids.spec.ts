import { test, expect } from './fixtures';
import { buildBooking } from '../src/data/booking-data';
import { BookingApi } from '../src/api/booking-api';

type IdItem = { bookingid: number };

test.describe('Booking - GetBookingIds', () => {
  test('TC_IDS_01 - Returns a non-empty array of numeric booking ids', async ({ api }) => {
    const res = await api.getBookingIds();
    expect(res.status()).toBe(200);
    const body: IdItem[] = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const item of body.slice(0, 20)) expect(typeof item.bookingid).toBe('number');
  });

  test('TC_IDS_02 - Filter by firstname and lastname finds the new booking', async ({ api }) => {
    const booking = buildBooking({ firstname: 'Filtera' });
    const id = await api.createAndGetId(booking);
    try {
      const res = await api.getBookingIds({ firstname: booking.firstname, lastname: booking.lastname });
      expect(res.status()).toBe(200);
      expect((await res.json()).map((b: IdItem) => b.bookingid)).toContain(id);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_IDS_03 - Filter by lastname only finds exactly the new booking', async ({ api }) => {
    const booking = buildBooking();
    const id = await api.createAndGetId(booking);
    try {
      const body = await (await api.getBookingIds({ lastname: booking.lastname })).json();
      expect(body).toEqual([{ bookingid: id }]);
    } finally {
      await api.cleanup(id);
    }
  });

  // Date filters. The documentation says: "checkin/checkout date greater than or equal to the set date".
  // The live API does not fully follow it (see DEFECTS.md). Those cases are marked test.fail():
  // they pass while the defect exists and turn red as soon as the API is fixed.
  const dated = { checkin: '2031-05-10', checkout: '2031-05-20' };

  async function idsFor(api: BookingApi, lastname: string, query: Record<string, string>): Promise<number[]> {
    const body: IdItem[] = await (await api.getBookingIds({ lastname, ...query })).json();
    return body.map((b) => b.bookingid);
  }

  test('TC_IDS_04 - Filter by a checkin date before the booking checkin returns the booking', async ({ api }) => {
    const booking = buildBooking({ bookingdates: dated });
    const id = await api.createAndGetId(booking);
    try {
      expect(await idsFor(api, booking.lastname, { checkin: '2031-05-09' })).toContain(id);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_IDS_05 - Filter by a checkin date after the booking checkin does not return the booking', async ({ api }) => {
    const booking = buildBooking({ bookingdates: dated });
    const id = await api.createAndGetId(booking);
    try {
      expect(await idsFor(api, booking.lastname, { checkin: '2031-05-11' })).not.toContain(id);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_IDS_06 - Filter by the same checkin date returns the booking (>= rule)', async ({ api }) => {
    test.fail(true, 'KNOWN DEFECT D-01: checkin filter excludes the booking when the dates are equal');
    const booking = buildBooking({ bookingdates: dated });
    const id = await api.createAndGetId(booking);
    try {
      expect(await idsFor(api, booking.lastname, { checkin: dated.checkin })).toContain(id);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_IDS_07 - Filter by the same checkout date returns the booking', async ({ api }) => {
    const booking = buildBooking({ bookingdates: dated });
    const id = await api.createAndGetId(booking);
    try {
      expect(await idsFor(api, booking.lastname, { checkout: dated.checkout })).toContain(id);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_IDS_08 - Filter by a checkout date before the booking checkout returns the booking (>= rule)', async ({ api }) => {
    test.fail(true, 'KNOWN DEFECT D-02: checkout filter works as "<=" instead of ">="');
    const booking = buildBooking({ bookingdates: dated });
    const id = await api.createAndGetId(booking);
    try {
      expect(await idsFor(api, booking.lastname, { checkout: '2031-05-19' })).toContain(id);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_IDS_09 - Filter by a checkout date after the booking checkout does not return the booking (>= rule)', async ({ api }) => {
    test.fail(true, 'KNOWN DEFECT D-02: checkout filter works as "<=" instead of ">="');
    const booking = buildBooking({ bookingdates: dated });
    const id = await api.createAndGetId(booking);
    try {
      expect(await idsFor(api, booking.lastname, { checkout: '2031-05-21' })).not.toContain(id);
    } finally {
      await api.cleanup(id);
    }
  });

  test('TC_IDS_10 - A name that matches nothing returns an empty array', async ({ api }) => {
    const res = await api.getBookingIds({ firstname: 'NoSuchPerson', lastname: 'NoSuchFamily' });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test('TC_IDS_11 - An invalid date format is rejected with 500', async ({ api }) => {
    const res = await api.getBookingIds({ checkin: 'not-a-date' });
    expect(res.status()).toBe(500);
  });
});
