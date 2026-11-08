
import "dotenv/config";

import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { db } from "../lib/db";
import { admins, adminLoginAudit } from "../lib/db/schema";

async function createSuperAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be provided."
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email address.");
  }

  if (password.length < 12) {
    throw new Error(
      "Password must contain at least 12 characters."
    );
  }

  const existingAdmin = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  if (existingAdmin.length > 0) {
    throw new Error(
      "An admin with this email already exists."
    );
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const [newAdmin] = await db
    .insert(admins)
    .values({
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    })
    .returning({
      id: admins.id,
      email: admins.email,
    });

  await db.insert(adminLoginAudit).values({
    adminId: newAdmin.id,
    attemptedEmail: newAdmin.email,
    eventType: "ADMIN_CREATED",
    metadata: {
      method: "CLI_SEED",
      role: "SUPER_ADMIN",
    },
  });

  console.log("Super Admin created successfully.");
  console.log("Admin ID:", newAdmin.id);
  console.log("Admin Email:", newAdmin.email);
}

createSuperAdmin().catch((error) => {
  console.error("Admin creation failed:", error.message);
  process.exitCode = 1;
});
