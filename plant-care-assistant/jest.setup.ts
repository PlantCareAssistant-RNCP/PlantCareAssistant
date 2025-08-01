import { PrismaClient } from "@prisma/client";

// Mock PrismaClient
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    plant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userProfile: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    // More models here when required
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock @supabase/supabase-js
jest.mock("@supabase/supabase-js", () => {
  return {
    createClient: jest.fn(() => ({
      auth: {
        getUser: jest.fn(),
        signIn: jest.fn(),
        signUp: jest.fn(),
      },
    })),
  };
});

// Mock @supabase/ssr
jest.mock("@supabase/ssr", () => {
  const mockClient = {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
  };

  return {
    createServerClient: jest.fn(() => mockClient),
    createBrowserClient: jest.fn(() => mockClient),
  };
});

// Mock Next.js
global.Request = class {} as unknown as typeof Request;
global.Response = class {} as unknown as typeof Response;
