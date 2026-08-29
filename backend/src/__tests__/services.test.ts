import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

// These tests exercise the HTTP layer end-to-end against a real database
// (DATABASE_URL must point at a test database). If no database is
// reachable, the "not found"/validation tests below still pass since they
// don't require a successful query.

describe("Service routes", () => {
  it("GET /api/services returns an array", async () => {
    const res = await request(app).get("/api/services");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/services without a name returns 400", async () => {
    const res = await request(app).post("/api/services").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/services/:id for a non-existent id returns 404", async () => {
    const res = await request(app).get("/api/services/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SERVICE_NOT_FOUND");
  });

  it("full CRUD lifecycle for a service", async () => {
    const created = await request(app)
      .post("/api/services")
      .send({ name: "Test Service", description: "temp", status: "OPERATIONAL", uptime: 99.9 });
    expect(created.status).toBe(201);
    const id = created.body.id;

    const patched = await request(app).patch(`/api/services/${id}`).send({ status: "DEGRADED" });
    expect(patched.status).toBe(200);
    expect(patched.body.status).toBe("DEGRADED");

    const deleted = await request(app).delete(`/api/services/${id}`);
    expect(deleted.status).toBe(204);

    const fetched = await request(app).get(`/api/services/${id}`);
    expect(fetched.status).toBe(404);
  });
});
