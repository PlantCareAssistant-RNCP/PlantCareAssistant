import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  validateEvent,
  isValidationError,
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
    const tomorrow = new Date(2025, 5, 4); 
    const nextMonth = new Date(2025, 6, 5); 

    const input: EventInput = {
      title: "Future Event",
      start: tomorrow.toISOString(),
      end: nextMonth.toISOString(),
    };

    const result = validateEvent(input);

    expect(isValidationError(result)).toBe(false);

    if (!isValidationError(result)) {
      expect(result).toMatchObject({
        title: "Future Event",
      });
      expect(result.start.getTime()).toBe(tomorrow.getTime());
      expect(result.end.getTime()).toBe(nextMonth.getTime());
    }
  });

  it("Should accept events occurring on the same day", () => {
    const today = new Date(2025, 5, 3);
    today.setHours(10, 0, 0);

    const laterToday = new Date(2025, 5, 3);
    laterToday.setHours(16, 0, 0);

    const input: EventInput = {
      title: "Same Day Event",
      start: today.toISOString(),
      end: laterToday.toISOString(),
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(false);
  });

  it("Should accept events starting at midnight today", () => {
    const midnight = new Date(2025, 5, 3);
    midnight.setHours(0, 0, 0, 0);

    const input: EventInput = {
      title: "Midnight Event",
      start: midnight.toISOString(),
      end: new Date(2025, 5, 4).toISOString(),
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(false);
  });

  it("Should reject events where end date is before start date", () => {
    const tomorrow = new Date(2025, 5, 4);
    const today = new Date(2025, 5, 3);

    const input: EventInput = {
      title: "Invalid Date Range",
      start: tomorrow.toISOString(),
      end: today.toISOString(),
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/start time must be earlier/i);
      expect(result.status).toBe(400);
    }
  });

  it("Should accept events far in the future", () => {
    const farFuture = new Date(2030, 0, 1); 
    const evenFurtherFuture = new Date(2035, 11, 31); 

    const input: EventInput = {
      title: "Long-term Future Event",
      start: farFuture.toISOString(),
      end: evenFurtherFuture.toISOString(),
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(false);
  });

  it("Should reject events with missing required date fields", () => {
    const input: EventInput = {
      title: "Incomplete Event",
      start: new Date(2025, 5, 4).toISOString(),
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/required/i);
      expect(result.status).toBe(400);
    }
  });
});
