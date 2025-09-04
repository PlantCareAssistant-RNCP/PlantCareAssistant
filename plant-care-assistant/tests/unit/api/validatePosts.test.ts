import {
  validatePost,
  validatePartialPost,
  isValidationError,
} from "@utils/validation";

describe("validatePost", () => {
  it("should reject missing title", () => {
    const post = { content: "Some content", plant_id: 1 };
    const result = validatePost(post);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/title/i);
    }
  });

  it("should reject missing content", () => {
    const post = { title: "My Post", plant_id: 1 };
    const result = validatePost(post);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/content/i);
    }
  });

  it("should reject excessively long title", () => {
    const post = {
      title: "A".repeat(101),
      content: "Some content",
      plant_id: 1,
    };
    const result = validatePost(post);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/title/i);
    }
  });

  it("should reject excessively long content", () => {
    const post = {
      title: "My Post",
      content: "A".repeat(10001),
      plant_id: 1,
    };
    const result = validatePost(post);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/content/i);
    }
  });

  it("should reject invalid photo type", () => {
    const post = {
      title: "My Post",
      content: "Some content",
      plant_id: 1,
      photo: 12345,
    };
    const result = validatePost(post);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/photo/i);
    }
  });

  it("should accept a valid post", () => {
    const post = {
      title: "My Post",
      content: "Some content",
      plant_id: 1,
      photo: "https://example.com/photo.jpg",
    };
    const result = validatePost(post);
    expect(isValidationError(result)).toBe(false);
  });
});

describe("validatePartialPost", () => {
  it("should allow partial updates with valid fields", () => {
    const post = { title: "Updated Title" };
    const result = validatePartialPost(post);
    expect(isValidationError(result)).toBe(false);
  });

  it("should reject excessively long title in partial update", () => {
    const post = { title: "A".repeat(101) };
    const result = validatePartialPost(post);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/title/i);
    }
  });

  it("should reject invalid photo type in partial update", () => {
    const post = { photo: 12345 };
    const result = validatePartialPost(post);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/photo/i);
    }
  });
});