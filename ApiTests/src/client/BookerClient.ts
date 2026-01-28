import { APIRequestContext, request, expect } from "@playwright/test";

export type BookingDates = { checkin: string; checkout: string };

export type BookingPayload = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
};

type ApiResult<T> = {
  status: number;
  ok: boolean;
  body?: T;
  rawText?: string;
};

export class BookerClient {
  private ctx!: APIRequestContext;
  private token?: string;

  constructor(
    private readonly baseURL: string,
    private readonly username: string,
    private readonly password: string
  ) {}

  async init(): Promise<void> {
    this.ctx = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: { "Content-Type": "application/json" },
    });
  }

  async dispose(): Promise<void> {
    await this.ctx?.dispose();
  }

  /**
   * Reads response safely:
   * - If response is JSON → returns parsed JSON in `body`
   * - If response is NOT JSON (e.g., "Not Found") → returns text in `rawText`
   */
  private async readJsonOrText<T>(res: any): Promise<ApiResult<T>> {
    const status = res.status();
    const ok = res.ok();

    const contentType = (res.headers()["content-type"] ?? "").toLowerCase();

    // If server says it's JSON, parse JSON.
    if (contentType.includes("application/json")) {
      return { status, ok, body: (await res.json()) as T };
    }

    // Otherwise safely read as text (prevents JSON parse crashes).
    const rawText = await res.text();
    return { status, ok, rawText };
  }

  async auth(): Promise<string> {
    const res = await this.ctx.post("/auth", {
      data: { username: this.username, password: this.password },
    });

    expect(res.ok(), `Auth failed: ${res.status()}`).toBeTruthy();

    const parsed = await this.readJsonOrText<{ token?: string }>(res);
    expect(parsed.body?.token, `Auth token missing. Raw: ${parsed.rawText ?? ""}`).toBeTruthy();

    this.token = parsed.body!.token!;
    return this.token;
  }

  async createBooking(
    payload: BookingPayload
  ): Promise<{ bookingid: number; booking: BookingPayload }> {
    const res = await this.ctx.post("/booking", { data: payload });
    expect(res.ok(), `Create failed: ${res.status()}`).toBeTruthy();

    const parsed = await this.readJsonOrText<{ bookingid: number; booking: BookingPayload }>(res);
    expect(parsed.body, `Create response is not JSON. Raw: ${parsed.rawText ?? ""}`).toBeTruthy();

    return parsed.body!;
  }

  /**
   * Get booking
   * - Returns status + body (when JSON)
   * - If server responds with plain text (e.g., 404 Not Found), body will be undefined and rawText will be set.
   */
  async getBooking(id: number): Promise<ApiResult<any>> {
    const res = await this.ctx.get(`/booking/${id}`);
    return this.readJsonOrText<any>(res);
  }

  async updateBooking(id: number, payload: BookingPayload): Promise<ApiResult<any>> {
    if (!this.token) throw new Error("No token. Call auth() first.");

    const res = await this.ctx.put(`/booking/${id}`, {
      data: payload,
      headers: { Cookie: `token=${this.token}` },
    });

    return this.readJsonOrText<any>(res);
  }

  async deleteBooking(id: number): Promise<number> {
    if (!this.token) throw new Error("No token. Call auth() first.");

    const res = await this.ctx.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${this.token}` },
    });

    return res.status();
  }
}