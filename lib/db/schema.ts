
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
  unique,
  uniqueIndex,
  date,
  numeric,
} from "drizzle-orm/pg-core";

// ========================================
// SUPER ADMIN ACCOUNTS
// ========================================

export const admins = pgTable(
  "admins",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    fullName: varchar("full_name", { length: 150 }),

    phone: varchar("phone", { length: 30 }),

    email: varchar("email", { length: 255 })
      .notNull()
      .unique(),

    passwordHash: text("password_hash").notNull(),

    role: varchar("role", { length: 30 })
      .notNull()
      .default("SUPER_ADMIN"),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("admins_email_idx").on(table.email),
  ]
);

// ========================================
// LOGIN OTP CHALLENGES
// ========================================

export const adminLoginOtps = pgTable(
  "admin_login_otps",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),

    otpHash: text("otp_hash").notNull(),

    attempts: integer("attempts")
      .notNull()
      .default(0),

    resendCount: integer("resend_count")
      .notNull()
      .default(0),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    lastSentAt: timestamp("last_sent_at", {
      withTimezone: true,
    }).notNull(),

    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
    }),

    consumedAt: timestamp("consumed_at", {
      withTimezone: true,
    }),

    ipAddress: varchar("ip_address", { length: 64 }),

    userAgent: text("user_agent"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("admin_otps_admin_id_idx").on(table.adminId),
    index("admin_otps_expiry_idx").on(table.expiresAt),
  ]
);

// ========================================
// AUTHENTICATED ADMIN SESSIONS
// ========================================

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),

    sessionTokenHash: varchar("session_token_hash", {
      length: 64,
    })
      .notNull()
      .unique(),

    ipAddress: varchar("ip_address", { length: 64 }),

    userAgent: text("user_agent"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    lastActivityAt: timestamp("last_activity_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("admin_sessions_admin_id_idx").on(table.adminId),
    index("admin_sessions_expiry_idx").on(table.expiresAt),
  ]
);

// ========================================
// ADMIN LOGIN AUDIT HISTORY
// ========================================

export const adminLoginAudit = pgTable(
  "admin_login_audit",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    adminId: uuid("admin_id").references(() => admins.id, {
      onDelete: "set null",
    }),

    attemptedEmail: varchar("attempted_email", {
      length: 255,
    }),

    eventType: varchar("event_type", {
      length: 50,
    }).notNull(),

    ipAddress: varchar("ip_address", { length: 64 }),

    userAgent: text("user_agent"),

    metadata: jsonb("metadata").$type<
      Record<string, unknown>
    >(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("admin_audit_admin_id_idx").on(table.adminId),
    index("admin_audit_event_type_idx").on(table.eventType),
    index("admin_audit_created_at_idx").on(table.createdAt),
    index("admin_audit_email_idx").on(table.attemptedEmail),
  ]
);

// ========================================
// ADMIN RATE LIMITS (SECURITY MEASURE)
// ========================================

export const adminRateLimits = pgTable(
  "admin_rate_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    key: varchar("key", { length: 64 }).notNull(),

    windowStart: timestamp("window_start", {
      withTimezone: true,
    }).notNull(),

    count: integer("count").notNull().default(0),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("admin_rate_limits_key_window_unique").on(
      table.key,
      table.windowStart
    ),
    index("admin_rate_limits_expiry_idx").on(
      table.expiresAt
    ),
  ]
);



// ========================================
// ACCOUNT TRANSACTIONS
// ========================================

export const accountTransactions = pgTable(
  "account_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    transactionType: varchar("transaction_type", {
      length: 10,
    }).notNull(),

    purpose: varchar("purpose", {
      length: 50,
    }).notNull(),

    transactionDate: date("transaction_date", {
      mode: "string",
    }).notNull(),

    rentalFromDate: date("rental_from_date", {
      mode: "string",
    }),

    rentalToDate: date("rental_to_date", {
      mode: "string",
    }),

    amount: numeric("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    remarks: text("remarks"),

    createdByAdminId: uuid("created_by_admin_id")
      .references(() => admins.id, { onDelete: "set null" }),

    updatedByAdminId: uuid("updated_by_admin_id")
      .references(() => admins.id, { onDelete: "set null" }),

    deletedByAdminId: uuid("deleted_by_admin_id")
      .references(() => admins.id, { onDelete: "set null" }),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("account_transactions_type_idx").on(table.transactionType),
    index("account_transactions_purpose_idx").on(table.purpose),
    index("account_transactions_date_idx").on(table.transactionDate),
    index("account_transactions_deleted_idx").on(table.deletedAt),
    index("account_transactions_created_by_idx").on(table.createdByAdminId),
  ]
);

