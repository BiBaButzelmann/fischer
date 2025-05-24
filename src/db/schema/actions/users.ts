import { and } from "drizzle-orm";
import { db } from "../client";

export async function getUser(email: string, passwordHash: string) {
    await db.query.users.findFirst({
        where: (users, { eq }) =>
            and(eq(users.email, email), eq(users.password, passwordHash)),
    });
}
