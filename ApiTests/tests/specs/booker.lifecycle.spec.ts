import { test, expect } from "@playwright/test";
import { BookerClient } from "../../src/client/BookerClient";
import { buildRandomBooking } from "../../src/factories/bookingFactory";
import { validateSchema } from "../../src/utils/schemaValidate";
import bookingSchema from "../schemas/booking.get.schema.json";

/**
 * API Lifecycle E2E (high-signal) test:
 * - Auth (token)
 * - Create booking (dynamic payload)
 * - Get booking + JSON schema validation
 * - Update booking (authorized)
 * - Delete booking (cleanup)
 *
 * Why this matters:
 * - Covers the most critical API user journey end-to-end.
 * - Includes contract checks (schema) + data integrity checks (fields match).
 */
test.describe("Restful Booker API - Lifecycle", () => {
  test("auth -> create -> get(schema) -> update -> delete", async () => {
    /**
     * Environment-first configuration:
     * - CI & local runs may provide env vars
     * - Defaults are here to keep the project runnable out-of-the-box
     */
    const baseURL =
      process.env.BOOKER_BASE_URL ?? "https://restful-booker.herokuapp.com";
    const username = process.env.BOOKER_USERNAME ?? "admin";
    const password = process.env.BOOKER_PASSWORD ?? "password123";

    /**
     * Client is our "API Page Object":
     * - Keeps request mechanics (headers/token/parsing) out of test code
     * - Test reads like a business flow
     */
    const client = new BookerClient(baseURL, username, password);
    await client.init();

    // We store created booking id so we can cleanup even if test fails mid-way.
    let bookingId: number | undefined;

    try {
      // 1) Auth: required for update/delete operations
      await client.auth();

      // 2) Create: dynamic data -> avoids brittle hardcoded payloads
      const createPayload = buildRandomBooking();
      const created = await client.createBooking(createPayload);

      bookingId = created.bookingid;

      // Basic sanity: booking id should exist and be a valid number
      expect(typeof bookingId).toBe("number");
      expect(bookingId).toBeGreaterThan(0);

      // 3) Get: validate contract (schema) + ensure data integrity
      const got = await client.getBooking(bookingId);

      // HTTP-level expectation
      expect(got.status).toBe(200);

      // Contract-level expectation (schema)
      expect(got.body).toBeDefined();
      const schemaResult = validateSchema(bookingSchema as object, got.body);

      // If schema fails, print helpful error details in assertion message
      expect(
        schemaResult.ok,
        JSON.stringify(schemaResult.errors, null, 2)
      ).toBeTruthy();

      // Data integrity: key fields should match what we created
      expect(got.body!.firstname).toBe(createPayload.firstname);
      expect(got.body!.lastname).toBe(createPayload.lastname);

      // 4) Update: token-based operation (client handles cookie header)
      const updatePayload = { ...createPayload, additionalneeds: "Breakfast" };
      const updated = await client.updateBooking(bookingId, updatePayload);

      expect(updated.status).toBe(200);
      expect(updated.body?.additionalneeds).toBe("Breakfast");

      // 5) Delete: ensure record is removed
      const delStatus = await client.deleteBooking(bookingId);

      // Restful Booker may return different success codes depending on infra/env
      expect([200, 201, 204]).toContain(delStatus);

      // Negative check: after delete, resource should not be retrievable
      const after = await client.getBooking(bookingId);

      // Env variance: some setups return 404/405/410
      expect([404, 405, 410]).toContain(after.status);
    } finally {
      /**
       * Cleanup (best effort):
       * - If test fails after creation, we still try to delete to avoid test pollution.
       * - Cleanup errors are intentionally ignored (do not mask the real test failure).
       */
      if (bookingId) {
        try {
          await client.deleteBooking(bookingId);
        } catch {
          // ignore cleanup errors
        }
      }

      // Always release API request context
      await client.dispose();
    }
  });
});