import { validateUser, validatePartialUser, isValidationError } from "@utils/validation";

describe("validateUser", () => {
  it("should reject invalid email formats", () => {
    const user = { username: "testuser", email: "invalid-email", password: "Valid123!" };
    const result = validateUser(user);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/email/i);
    }
  });

  it("should reject passwords that are too short", () => {
    const user = { username: "testuser", email: "user@example.com", password: "123" };
    const result = validateUser(user);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/password/i);
    }
  });

  it("should reject passwords missing required character types", () => {
    const user = { username: "testuser", email: "user@example.com", password: "password" }; // no number or special char
    const result = validateUser(user);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/password/i);
    }
  });

  it("should reject missing required fields", () => {
    const user = { email: "user@example.com", password: "Valid123!" }; // missing username
    const result = validateUser(user);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/username/i);
    }
  });

  it("should accept a valid user", () => {
    const user = { username: "testuser", email: "user@example.com", password: "Valid123!" };
    const result = validateUser(user);
    expect(isValidationError(result)).toBe(false);
  });
});

describe("validatePartialUser", () => {
  it("should allow partial updates with valid fields", () => {
    const user = { email: "newemail@example.com" };
    const result = validatePartialUser(user);
    expect(isValidationError(result)).toBe(false);
  });

  it("should reject invalid email in partial update", () => {
    const user = { email: "not-an-email" };
    const result = validatePartialUser(user);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/email/i);
    }
  });

  it("should reject invalid password in partial update", () => {
    const user = { password: "short" };
    const result = validatePartialUser(user);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/password/i);
    }
  });
});