"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function updateUserRole(role: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const client = await clerkClient();
    
    // Update the user's public metadata with the role
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "Failed to update user role" };
  }
}
