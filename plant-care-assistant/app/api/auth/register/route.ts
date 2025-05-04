import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateUser, isValidationError, validationErrorResponse } from "@/utils/validation";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate user data
    const validationResult = validateUser(body);
    if(isValidationError(validationResult)){
      return validationErrorResponse(validationResult)
    }

    //Now validationResult is a ValidUser obj
    const validUser = validationResult;

    //Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{username: validUser.username}, {email:validUser.email}],
        deleted_at: null,
      }
    })

    if(existingUser){
      return NextResponse.json(
        {error:"Username or email already exists"},
        {status: 409}
      );
    }
// Create the user with validated data
const newUser = await prisma.user.create({
  data: {
    username: validUser.username,
    email: validUser.email,
    password_hash: validUser.password, // Would be hashed in production
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
  },
  select: {
    user_id: true,
    username: true,
    email: true,
    created_at: true
  }
});

return NextResponse.json(
  { message: "Registration successful", user: newUser },
  { status: 201 }
);
} catch (error: unknown) {
console.error("Registration error:", error);
return NextResponse.json(
  { error: "Failed to register user" },
  { status: 500 }
);
}
}