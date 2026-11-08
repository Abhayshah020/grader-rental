CREATE TABLE "admin_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_rate_limits_key_window_unique" UNIQUE("key","window_start")
);
--> statement-breakpoint
CREATE INDEX "admin_rate_limits_expiry_idx" ON "admin_rate_limits" USING btree ("expires_at");