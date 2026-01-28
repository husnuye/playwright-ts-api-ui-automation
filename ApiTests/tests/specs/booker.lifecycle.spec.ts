import { test, expect } from "@playwright/test";
import { BookerClient } from "../../src/client/BookerClient";
import { buildRandomBooking } from "../../src/factories/bookingFactory";
import { validateSchema } from "../../src/utils/schemaValidate";
import bookingSchema from "../schemas/booking.get.schema.json";

test.describe("Restful Booker API - Lifecycle", () => {
  test("auth -> create -> get(schema) -> update -> delete", async () => {
    const baseURL =
      process.env.BOOKER_BASE_URL ?? "https://restful-booker.herokuapp.com";
    const username = process.env.BOOKER_USERNAME ?? "admin";
    const password = process.env.BOOKER_PASSWORD ?? "password123";

    const client = new BookerClient(baseURL, username, password);
    await client.init();

    let bookingId: number | undefined;

    try {
      // 1) Auth
      await client.auth();

      // 2) Create (dynamic)
      const createPayload = buildRandomBooking();
      const created = await client.createBooking(createPayload);

      bookingId = created.bookingid;
      expect(typeof bookingId).toBe("number");

      // 3) Get + schema validation
      const got = await client.getBooking(bookingId);
      expect(got.status).toBe(200);

      const schemaResult = validateSchema(bookingSchema as object, got.body);
      expect(schemaResult.ok, JSON.stringify(schemaResult.errors, null, 2)).toBeTruthy();

      // Sanity assertions (data integrity)
      expect(got.body.firstname).toBe(createPayload.firstname);
      expect(got.body.lastname).toBe(createPayload.lastname);

      // 4) Update (token)
      const updatePayload = { ...createPayload, additionalneeds: "Breakfast" };
      const updated = await client.updateBooking(bookingId, updatePayload);
      expect(updated.status).toBe(200);
      expect(updated.body.additionalneeds).toBe("Breakfast");

      // 5) Delete
      const delStatus = await client.deleteBooking(bookingId);
      expect([200, 201, 204]).toContain(delStatus);

      // Negative check after delete (env may vary)
      const after = await client.getBooking(bookingId);
      expect([404, 405, 410]).toContain(after.status);
    } finally {
      // Cleanup best-effort (avoid leaving data behind if test fails mid-way)
      if (bookingId) {
        try {
          await client.deleteBooking(bookingId);
        } catch {
          // ignore cleanup errors
        }
      }
      await client.dispose();
    }
  });
});