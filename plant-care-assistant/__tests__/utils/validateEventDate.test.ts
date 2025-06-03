import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  validateEvent,
  validateDateRange,
  isValidationError,
  ValidationError,
  ValidEvent,
  EventInput,
} from "@utils/validation";
import MockDate from "mockdate";

describe("Event date validation", () => {
  beforeEach(() => {
    MockDate.set(new Date(2025, 5, 3, 0, 0, 0, 0));
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("Should return an error if the start date is in the past", () => {
    const input: EventInput = {
      title: "Past Event",
      start: new Date(2024, 5, 2).toISOString(),
      end: new Date(2026, 3, 3).toISOString(),
    };
    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/cannot be before today/i);
      expect(result.status).toBe(400);
    }
  });

  it("Should return a succeful event with valid dates", () => {
    const input: EventInput = {
      title: "Future Event",
      start: new Date(2025, 5, 4).toISOString(),
      end: new Date(2025, 7, 5).toISOString(),
    };

    const result = validateEvent(input);

    expect(isValidationError(result)).toBe(false);

    if (!isValidationError(result)) {
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);

      expect(result.start.getFullYear()).toBe(2025);
      expect(result.start.getMonth()).toBe(5);
      expect(result.start.getDate()).toBe(4);

      expect(result.end.getFullYear()).toBe(2025);
      expect(result.end.getMonth()).toBe(7);
      expect(result.end.getDate()).toBe(5);
    }
  });
});
