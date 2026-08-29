import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("System endpoints", () => {
  it("GET /api/health returns 200 and status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /api/ready returns a status field", async () => {
    // Note: this test does not require a live database; it only asserts
    // the endpoint responds with the expected shape and a valid status code.
    const res = await request(app).get("/api/ready");
    expect([200, 503]).toContain(res.status);
    expect(["ready", "not_ready"]).toContain(res.body.status);
  });

  it("GET /api/runtime returns runtime info", async () => {
    const res = await request(app).get("/api/runtime");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("app", "ministatus");
    expect(res.body).toHaveProperty("version");
    expect(res.body).toHaveProperty("nodeVersion");
    expect(res.body).toHaveProperty("hostname");
  });

  it("GET /api/unknown returns 404 with JSON error shape", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error.code", "NOT_FOUND");
  });
});
