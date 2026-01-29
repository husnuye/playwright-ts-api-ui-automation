import { APIRequestContext, request, expect, type APIResponse } from "@playwright/test";

/**
 * Domain Types
 * - We keep API payload shapes in one place so tests stay clean and strongly typed.
 */
export type BookingDates = {
  checkin: string;
  checkout: string;
};

export type BookingPayload = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
};

/**
 * Generic API read result.
 *
 * Why we need this:
 * - Some endpoints return JSON when successful.
 * - But failures (e.g., 404) can come back as plain text ("Not Found"),
 *   which would crash `res.json()` with "Unexpected token".
 *
 * This wrapper makes tests resilient and keeps parsing logic out of specs.
 */
export type ApiResult<T> = {
  status: number;
  ok: boolean;
  body?: T;
  rawText?: string;
};

/**
 * BookerClient is a thin "API Page Object" (aka API Client wrapper).
 *
 * Design goals:
 * - Centralize request creation (baseURL + headers)
 * - Provide intention-revealing methods (auth, createBooking, getBooking, etc.)
 * - Keep tests focused on behavior/assertions, not low-level HTTP details
 */
export class BookerClient {
  private ctx!: APIRequestContext;
  private token?: string;

  constructor(
    private readonly baseURL: string,
    private readonly username: string,
    private readonly password: string
  ) {}

  /**
   * Creates an isolated API request context.
   *
   * Important:
   * - This is similar to launching a browser context in UI tests.
   * - Each test suite can init and dispose cleanly to avoid shared state.
   */
  async init(): Promise<void> {
    this.ctx = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });
  }

  /**
   * Always dispose request context to release resources.
   * This is especially important in CI and when running many tests.
   */
  async dispose(): Promise<void> {
    await this.ctx?.dispose();
  }

  /**
   * Reads response safely:
   * - If response is JSON → returns parsed JSON in `body`
   * - If response is NOT JSON (e.g., "Not Found") → returns text in `rawText`
   *
   * Why not just `res.json()`?
   * - Because the API sometimes responds with plain text on failures.
   * - We want tests to assert on status/body without crashing at parse time.
   */
  private async readJsonOrText<T>(res: APIResponse): Promise<ApiResult<T>> {
    const status = res.status();
    const ok = res.ok();

    const contentType = (res.headers()["content-type"] ?? "").toLowerCase();
    const isJson = contentType.includes("application/json");

    if (isJson) {
      // Safe when content-type is JSON
      const body = (await res.json()) as T;
      return { status, ok, body };
    }

    // Safe fallback for non-JSON responses (prevents JSON parse exceptions)
    const rawText = await res.text();
    return { status, ok, rawText };
  }

  /**
   * Authenticates and stores token for update/delete operations.
   *
   * API expectation:
   * - /auth returns JSON: { token: string }
   */
  async auth(): Promise<string> {
    const res = await this.ctx.post("/auth", {
      data: { username: this.username, password: this.password },
    });

    // First line of defense: HTTP-level success
    expect(res.ok(), `Auth failed: HTTP ${res.status()}`).toBeTruthy();

    // Second line: payload-level expectation (token presence)
    const parsed = await this.readJsonOrText<{ token?: string }>(res);
    expect(
      parsed.body?.token,
      `Auth token missing. Raw response: ${parsed.rawText ?? ""}`
    ).toBeTruthy();

    this.token = parsed.body!.token!;
    return this.token;
  }

  /**
   * Creates a booking.
   *
   * API expectation:
   * - /booking returns JSON: { bookingid: number, booking: BookingPayload }
   */
  async createBooking(
    payload: BookingPayload
  ): Promise<{ bookingid: number; booking: BookingPayload }> {
    const res = await this.ctx.post("/booking", { data: payload });

    expect(res.ok(), `Create failed: HTTP ${res.status()}`).toBeTruthy();

    const parsed = await this.readJsonOrText<{
      bookingid: number;
      booking: BookingPayload;
    }>(res);

    expect(
      parsed.body,
      `Create response is not JSON. Raw response: ${parsed.rawText ?? ""}`
    ).toBeTruthy();

    return parsed.body!;
  }

  /**
   * Fetches a booking by id.
   *
   * Returned shape:
   * - Success: { status, ok, body: <json> }
   * - Failure (e.g. 404): { status, ok, rawText: "Not Found" }
   */
  async getBooking(id: number): Promise<ApiResult<BookingPayload>> {
    const res = await this.ctx.get(`/booking/${id}`);
    return this.readJsonOrText<BookingPayload>(res);
  }

  /**
   * Updates an existing booking.
   *
   * Requires:
   * - auth() called first (token)
   * - Token is passed via Cookie header, as required by Restful Booker API
   */
  async updateBooking(id: number, payload: BookingPayload): Promise<ApiResult<BookingPayload>> {
    if (!this.token) {
      throw new Error("Missing token. Call auth() before updateBooking().");
    }

    const res = await this.ctx.put(`/booking/${id}`, {
      data: payload,
      headers: { Cookie: `token=${this.token}` },
    });

    return this.readJsonOrText<BookingPayload>(res);
  }

  /**
   * Deletes an existing booking.
   *
   * We return only the status code because Restful Booker delete typically has no JSON body.
   */
  async deleteBooking(id: number): Promise<number> {
    if (!this.token) {
      throw new Error("Missing token. Call auth() before deleteBooking().");
    }

    const res = await this.ctx.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${this.token}` },
    });

    return res.status();
  }
}