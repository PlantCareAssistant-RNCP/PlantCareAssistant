import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  validateEvent,
  isValidationError,
  EventInput,
} from "@utils/validation";
import MockDate from "mockdate";

describe("Recurring event validation", () => {
  beforeEach(() => {
    MockDate.set(new Date(2025, 5, 3, 0, 0, 0, 0));
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("Should accept valid weekly recurring event", () => {
    const input: EventInput = {
      title: "Weekly Meeting",
      start: new Date(2025, 5, 4).toISOString(),
      end: new Date(2025, 5, 4, 1).toISOString(),
      repeatWeekly: true,
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(false);

    if (!isValidationError(result)) {
      expect(result.title).toBe("Weekly Meeting");
    }
  });

  it("Should accept valid monthly recurring event", () => {
    const input: EventInput = {
      title: "Monthly Review", 
      start: new Date(2025, 5, 4).toISOString(),
      end: new Date(2025, 5, 4, 1).toISOString(),
      repeatMonthly: true,
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(false);
  });

  it("Should reject events with both weekly and monthly recurring", () => {
    const input: EventInput = {
      title: "Conflicted Event",
      start: new Date(2025, 5, 4).toISOString(), 
      end: new Date(2025, 5, 4, 1).toISOString(),
      repeatWeekly: true,
      repeatMonthly: true,
    };

    const result = validateEvent(input);
    expect(isValidationError(result)).toBe(true);
    
    if (isValidationError(result)) {
      expect(result.error).toMatch(/cannot repeat both weekly and monthly/i);
      expect(result.status).toBe(400);
    }
  });
});