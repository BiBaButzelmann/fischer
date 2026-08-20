"use server";

import { db } from "@/db/client";
import { pageView } from "@/db/schema/pageView";
import { auth } from "@/auth/utils";

export async function logPageView(path: string) {
  const session = await auth();
  if (!session) {
    return;
  }
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 512) {
    return;
  }

  try {
    await db.insert(pageView).values({ userId: session.user.id, path });
  } catch (error) {
    console.error("Failed to log page view:", error);
  }
}
