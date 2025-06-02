import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
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
    // Add more models as needed
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
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