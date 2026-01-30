import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/specs",
  timeout: 60_000,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.BOOKER_BASE_URL ?? "https://restful-booker.herokuapp.com",
    trace: "retain-on-failure",
  },
});