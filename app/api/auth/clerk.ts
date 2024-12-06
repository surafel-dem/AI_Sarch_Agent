import { clerkClient } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs";

export async function createUser(email: string) {
  try {
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      skipPasswordRequirement: true,
      skipEmailVerification: true,
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
