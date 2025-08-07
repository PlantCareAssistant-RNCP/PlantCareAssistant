import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  validateEvent,
  isValidationError,
  EventInput,
} from "@utils/validation";
import MockDate from "mockdate";

describe("Event time validation", () => {
  beforeEach(() => {
    MockDate.set(new Date(2025, 5, 3, 10, 0, 0, 0));
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("Should accept all-day events", () => {
    const today = new Date(2025, 5, 3);
    const input: EventInput = {
      title: "All Day Event",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString(),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 0).toISOString(),
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(false);
  });

  it("Should accept timed events with valid time range", () => {
    const today = new Date(2025, 5, 3);
    const input: EventInput = {
      title: "Timed Event",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0).toISOString(),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0).toISOString(),
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(false);
  });

  it("Should reject events where end time is before start time on same day", () => {
    const today = new Date(2025, 5, 3);
    const input: EventInput = {
      title: "Invalid Time Range",
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0).toISOString(),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0).toISOString(),
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(true);
    if (isValidationError(result)) {
      expect(result.error).toMatch(/start time must be earlier/i);
      expect(result.status).toBe(400);
    }
  });
});