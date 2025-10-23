import { validateImage, isValidationError } from "@utils/validation";
import { createMockFile } from "../../mocks/fileMock";

describe("validateImage", () => {
  it("should return error if no file is provided", () => {
    const result = validateImage(undefined as any);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/no file/i);
      expect(result.status).toBe(400);
    }
  });

  it("should reject invalid file types", () => {
    const file = createMockFile({ type: "application/pdf" });
    const result = validateImage(file);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/allowed/i);
      expect(result.status).toBe(400);
    }
  });

  it("should reject files larger than 5MB", () => {
    const file = createMockFile({ size: 6 * 1024 * 1024 });
    const result = validateImage(file);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/less than 5MB/i);
      expect(result.status).toBe(400);
    }
  });

  it("should accept valid image files", () => {
    const file = createMockFile({ type: "image/jpeg", size: 1024 * 1024 });
    const result = validateImage(file);
    expect(isValidationError(result)).toBe(false);
    expect(result).toBe(file);
  });

  it("should accept a file exactly 5MB in size", () => {
    const file = createMockFile({ type: "image/png", size: 5 * 1024 * 1024 });
    const result = validateImage(file);
    expect(isValidationError(result)).toBe(false);
    expect(result).toBe(file);
  });

  it("should accept all allowed image types", () => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    allowedTypes.forEach(type => {
      const file = createMockFile({ type, size: 1024 });
      const result = validateImage(file);
      expect(isValidationError(result)).toBe(false);
      expect(result).toBe(file);
    });
  });

  it("should accept an empty file (size 0) with valid type", () => {
    const file = createMockFile({ type: "image/png", size: 0 });
    const result = validateImage(file);
    expect(isValidationError(result)).toBe(false);
    expect(result).toBe(file);
  });

  it("should reject a corrupted file object (missing type)", () => {
    const file = createMockFile({ size: 1024 });
    // Remove the type property to simulate corruption
    Object.defineProperty(file, "type", { value: undefined });
    const result = validateImage(file);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/allowed/i);
      expect(result.status).toBe(400);
    }
  });

});