export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export const ADMIN = { username: 'admin', password: 'password123' };

/** Basic auth header value for admin:password123 (the alternative to the token cookie). */
export const BASIC_AUTH = 'Basic YWRtaW46cGFzc3dvcmQxMjM=';

/** Builds a valid booking. A unique last name keeps parallel tests from clashing in search results. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return {
    firstname: 'Jim',
    lastname: `Brown${unique}`,
    totalprice: 111,
    depositpaid: true,
    bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
