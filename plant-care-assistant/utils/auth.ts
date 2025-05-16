// import { headers } from "next/headers";

// Modified to support testing with different user IDs
// export function getCurrentUserId(req?: Request): number {
//   // Check for test header first
//   if (req) {
//     const testUserId = req.headers.get("X-Test-User-Id");
//     if (testUserId) {
//       return parseInt(testUserId);
//     }
//   }
  
//   // When no test header, fall back to default user
//   return 1;
// }

export function isAuthenticated(request?: Request): boolean {
  console.log("Auth check - Request:", request);
  console.log("Auth check - Headers:", request?.headers);
  console.log("Auth check - X-Test-User-Id:", request?.headers.get("X-Test-User-Id"));
  
  if (request) {
    const testUserId = request?.headers.get("X-Test-User-Id");
    console.log("UserId from header:", testUserId, "Type:", typeof testUserId);
    return !!testUserId;
  }
  return false;
}

export function getCurrentUserId(request?: Request): number {
  if (request) {
    const testUserId = request.headers.get("X-Test-User-Id");
    if (testUserId) {
      return parseInt(testUserId);
    }
  }
  throw new Error("No authenticated user"); // Instead of returning a default
}