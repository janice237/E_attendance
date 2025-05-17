// course.test.js for course test cases
import request from "supertest";
import app from "../index.js";

describe("Course API", () => {
  it("should create a course", async () => {
    const response = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer YOUR_TEST_TOKEN`)
      .send({ name: "Math 101", description: "Basic Math", credits: 3, instructorId: "TEST-INSTRUCTOR-ID" });
    expect(response.status).toBe(201);
  });
});