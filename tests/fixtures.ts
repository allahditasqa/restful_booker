import { test as base } from '@playwright/test';
import { BookingApi } from '../src/api/booking-api';

export const test = base.extend<{ api: BookingApi }>({
  api: async ({ request }, use) => {
    await use(new BookingApi(request));
  },
});

export { expect } from '@playwright/test';
