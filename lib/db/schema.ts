
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
  AnyPgColumn,
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

export const transactionHeads = pgTable(
  "transaction_heads",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 150,
    }).notNull(),

    // INCOME_SOURCE, PERSON, COLLECTIVE, EXPENSE, OTHER
    headType: varchar("head_type", {
      length: 100,
    }).notNull(),

    // CREDIT, DEBIT
    allowedTransactionType: varchar(
      "allowedTransactionType",
      { length: 10 }
    ).notNull().default("BOTH"),

    // Show rental from/to dates when selected
    requiresRentalDates: boolean("requires_rental_dates")
      .notNull()
      .default(false),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("transaction_heads_name_idx").on(table.name),
    index("transaction_heads_type_idx").on(table.headType),
    index("transaction_heads_active_idx").on(table.isActive),
  ]
);

export const accountTransactions = pgTable(
  "account_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // CREDIT or DEBIT
    transactionType: varchar("transaction_type", {
      length: 10,
    }).notNull(),

    // Reference to predefined transaction head
    transactionHeadId: uuid("transaction_head_id")
      .notNull()
      .references(() => transactionHeads.id, {
        onDelete: "restrict",
      }),

    // Transaction date
    transactionDate: date("transaction_date", {
      mode: "string",
    }).notNull(),

    // Applicable to rental transactions
    rentalFromDate: date("rental_from_date", {
      mode: "string",
    }),

    rentalToDate: date("rental_to_date", {
      mode: "string",
    }),

    // Transaction amount
    amount: numeric("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    remarks: text("remarks"),

    // Link expense to its related earning transaction
    relatedToTransactionId: uuid(
      "related_to_transaction_id"
    ).references(
      (): AnyPgColumn => accountTransactions.id,
      {
        onDelete: "restrict",
      }
    ),

    // Admin audit fields
    createdByAdminId: uuid("created_by_admin_id")
      .references(() => admins.id, {
        onDelete: "set null",
      }),

    updatedByAdminId: uuid("updated_by_admin_id")
      .references(() => admins.id, {
        onDelete: "set null",
      }),

    // Timestamps
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
    index("account_transactions_type_idx").on(
      table.transactionType
    ),

    index("account_transactions_head_idx").on(
      table.transactionHeadId
    ),

    index("account_transactions_date_idx").on(
      table.transactionDate
    ),

    index("account_transactions_related_idx").on(
      table.relatedToTransactionId
    ),

    index("account_transactions_created_by_idx").on(
      table.createdByAdminId
    ),

    index("account_transactions_updated_by_idx").on(
      table.updatedByAdminId
    ),
  ]
);


