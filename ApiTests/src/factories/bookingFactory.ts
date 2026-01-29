import type { BookingPayload } from "../client/BookerClient";

/**
 * Converts a Date to ISO `YYYY-MM-DD` (Restful Booker expects this format).
 */
function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Inclusive random integer helper.
 * Example: randInt(1, 3) => 1 | 2 | 3
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a random item from an array.
 * Assumes `arr` is non-empty (we only use it with seeded arrays below).
 */
function randFrom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/**
 * Generates a lightweight random name set.
 * Keeping lists small is intentional:
 * - deterministic enough to debug
 * - avoids external deps (faker) for this case
 */
function randomName(): { firstname: string; lastname: string } {
  const first = ["Alex", "Mia", "Noah", "Lina", "Efe", "Ada", "Leo", "Zeynep"];
  const last = [
    "Smith",
    "Brown",
    "Johnson",
    "Garcia",
    "Yilmaz",
    "Kaya",
    "Demir",
    "Celik",
  ];

  return { firstname: randFrom(first), lastname: randFrom(last) };
}

/**
 * Factory: builds a valid BookingPayload with realistic constraints.
 *
 * Why we use a factory:
 * - Avoids brittle hardcoded data
 * - Improves coverage (different values each run)
 * - Keeps test intent clear: "create a valid booking"
 */
export function buildRandomBooking(): BookingPayload {
  const { firstname, lastname } = randomName();

  // check-in: 1..30 days from today (always future-ish to avoid edge cases)
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + randInt(1, 30));

  // check-out: 1..10 days after check-in (ensures checkout > checkin)
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + randInt(1, 10));

  return {
    firstname,
    lastname,

    // Price range chosen to be wide but still reasonable for test variability
    totalprice: randInt(50, 5000),

    // Random boolean: simple coverage for both states
    depositpaid: Math.random() < 0.5,

    bookingdates: {
      checkin: isoDate(checkin),
      checkout: isoDate(checkout),
    },

    // Optional field in API; we still include it to exercise payload shape
    additionalneeds: randFrom(["Breakfast", "Late Checkout", "None"]),
  };
}