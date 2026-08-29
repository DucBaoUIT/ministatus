import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("Incident routes", () => {
  it("GET /api/incidents returns an array", async () => {
    const res = await request(app).get("/api/incidents");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/incidents without a title returns 400", async () => {
    const res = await request(app).post("/api/incidents").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("full CRUD lifecycle for an incident, including auto resolvedAt", async () => {
    const created = await request(app)
      .post("/api/incidents")
      .send({ title: "Test incident", severity: "LOW", status: "INVESTIGATING" });
    expect(created.status).toBe(201);
    const id = created.body.id;
    expect(created.body.resolvedAt).toBeNull();

    const resolved = await request(app).patch(`/api/incidents/${id}`).send({ status: "RESOLVED" });
    expect(resolved.status).toBe(200);
    expect(resolved.body.status).toBe("RESOLVED");
    expect(resolved.body.resolvedAt).not.toBeNull();

    const deleted = await request(app).delete(`/api/incidents/${id}`);
    expect(deleted.status).toBe(204);
  });
});
