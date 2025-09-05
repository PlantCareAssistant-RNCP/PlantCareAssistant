import { validateComment, isValidationError } from "@utils/validation";

describe("validateComment", () => {
  it("should reject missing content", () => {
    const comment = {};
    const result = validateComment(comment);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/content/i);
    }
  });

  it("should reject non-string content", () => {
    const comment = { content: 12345 };
    const result = validateComment(comment);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/content/i);
    }
  });

  it("should reject excessively long content", () => {
    const comment = { content: "A".repeat(10001) };
    const result = validateComment(comment);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/content/i);
    }
  });

  it("should reject invalid photo type", () => {
    const comment = { content: "Nice plant!", photo: 12345 };
    const result = validateComment(comment);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/photo/i);
    }
  });

  it("should accept a valid comment", () => {
    const comment = {
      content: "Nice plant!",
      photo: "https://example.com/photo.jpg",
    };
    const result = validateComment(comment);
    expect(isValidationError(result)).toBe(false);
  });
});