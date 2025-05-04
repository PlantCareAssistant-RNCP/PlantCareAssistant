import { headers } from "next/headers";

// Modified to support testing with different user IDs
export function getCurrentUserId(req?: Request): number {
  // Check for test header first
  if (req) {
    const testUserId = req.headers.get("X-Test-User-Id");
    if (testUserId) {
      return parseInt(testUserId);
    }
  }
  
  // When no test header, fall back to default user
  return 1;
}

// This will be expanded later to verify tokens, etc.
export function isAuthenticated(): boolean {
  return true; // Always return true for now
}