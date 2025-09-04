import {
  validatePlant,
  validatePartialPlant,
  isValidationError,
} from "@utils/validation";

describe("validatePlant", () => {
  it("should reject missing plant_name", () => {
    const plant = { plant_type_id: 1, photo: "ficus.jpg" };
    const result = validatePlant(plant);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/plant[_ ]?name/i);
    }
  });

  it("should reject missing plant_type_id", () => {
    const plant = { plant_name: "My Ficus", photo: "ficus.jpg" };
    const result = validatePlant(plant);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/plant[_ ]?type[_ ]?id/i);
    }
  });

  it("should reject non-string plant_name", () => {
    const plant = { plant_name: 12345, plant_type_id: 1 };
    const result = validatePlant(plant);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/plant[_ ]?name/i);
    }
  });

  it("should reject empty plant_name", () => {
    const plant = { plant_name: "", plant_type_id: 1 };
    const result = validatePlant(plant);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/plant[_ ]?name/i);
    }
  });

  it("should reject non-numeric plant_type_id", () => {
    const plant = { plant_name: "My Ficus", plant_type_id: "not-a-number" };
    const result = validatePlant(plant);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/plant[_ ]?type[_ ]?id/i);
    }
  });

  it("should accept a valid plant", () => {
    const plant = {
      plant_name: "My Ficus",
      plant_type_id: 1,
      photo: "ficus.jpg",
    };
    const result = validatePlant(plant);
    expect(isValidationError(result)).toBe(false);
  });
});

describe("validatePartialPlant", () => {
  it("should allow partial updates with valid fields", () => {
    const plant = { photo: "newphoto.jpg" };
    const result = validatePartialPlant(plant);
    expect(isValidationError(result)).toBe(false);
  });

  it("should reject invalid plant_name in partial update", () => {
    const plant = { plant_name: "" };
    const result = validatePartialPlant(plant);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/plant[_ ]?name/i);
    }
  });

  it("should reject invalid plant_type_id in partial update", () => {
    const plant = { plant_type_id: "not-a-number" };
    const result = validatePartialPlant(plant);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/plant[_ ]?type[_ ]?id/i);
    }
  });
});
