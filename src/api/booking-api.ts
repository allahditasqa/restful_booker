import { APIRequestContext, APIResponse } from '@playwright/test';
import { ADMIN, BASIC_AUTH, Booking } from '../data/booking-data';

export type AuthMode = 'token' | 'basic' | 'none' | 'badtoken';

/** Thin client for the Restful-Booker API. Tests never build URLs or headers themselves. */
export class BookingApi {
  constructor(private readonly request: APIRequestContext) {}

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  createToken(data: object = ADMIN): Promise<APIResponse> {
    return this.request.post('/auth', { data });
  }

  async getToken(): Promise<string> {
    const body = await (await this.createToken()).json();
    return body.token as string;
  }

  getBookingIds(query: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: query });
  }

  getBooking(id: number | string, accept = 'application/json'): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`, { headers: { Accept: accept } });
  }

  createBooking(data: unknown, headers: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.post('/booking', { data, headers });
  }

  /** Creates a booking and returns its id (fails the test if the API does not answer 200). */
  async createAndGetId(booking: Booking): Promise<number> {
    const res = await this.createBooking(booking);
    if (res.status() !== 200) throw new Error(`Setup failed: create booking returned ${res.status()}`);
    return (await res.json()).bookingid as number;
  }

  updateBooking(id: number | string, data: unknown, auth: AuthMode = 'token', token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data, headers: this.authHeaders(auth, token) });
  }

  partialUpdateBooking(id: number | string, data: unknown, auth: AuthMode = 'token', token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data, headers: this.authHeaders(auth, token) });
  }

  deleteBooking(id: number | string, auth: AuthMode = 'token', token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeaders(auth, token) });
  }

  /** Best-effort cleanup so the shared demo server is not filled with test data. */
  async cleanup(id: number): Promise<void> {
    const token = await this.getToken();
    await this.deleteBooking(id, 'token', token);
  }

  private authHeaders(mode: AuthMode, token?: string): Record<string, string> {
    switch (mode) {
      case 'token':
        return { Cookie: `token=${token ?? ''}` };
      case 'badtoken':
        return { Cookie: 'token=thisisnotavalidtoken' };
      case 'basic':
        return { Authorization: BASIC_AUTH };
      default:
        return {};
    }
  }
}
