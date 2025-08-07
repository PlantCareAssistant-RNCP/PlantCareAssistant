import { describe, it, expect } from "@jest/globals";
import { isAllDayEvent, formatEventDateTime } from "./timeUtils";

describe("Time utility functions", () => {
  describe("isAllDayEvent", () => {
    it("Should correctly identify all-day events", () => {
      const allDayStart = new Date("2024-03-15T00:00:00");
      const allDayEnd = new Date("2024-03-15T23:59:00");

      expect(isAllDayEvent(allDayStart, allDayEnd)).toBe(true);
    });

    it("Should correctly identify timed events", () => {
      const timedStart = new Date("2024-03-15T09:00:00");
      const timedEnd = new Date("2024-03-15T10:00:00");

      expect(isAllDayEvent(timedStart, timedEnd)).toBe(false);
    });
  });

  describe("formatEventDateTime", () => {
    it("Should format all-day events correctly", () => {
      const allDayStart = new Date("2024-03-15T00:00:00");
      const allDayEnd = new Date("2024-03-15T23:59:00");

      const result = formatEventDateTime(allDayStart, allDayEnd);
      expect(result).toContain("(All day)");
    });

    it("Should format timed events correctly", () => {
      const timedStart = new Date("2024-03-15T09:00:00");
      const timedEnd = new Date("2024-03-15T10:00:00");

      const result = formatEventDateTime(timedStart, timedEnd);
      expect(result).toContain("from");
      expect(result).toContain("to");
    });
  });
});
