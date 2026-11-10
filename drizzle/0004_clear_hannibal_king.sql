CREATE TABLE "transaction_heads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"head_type" varchar(100) NOT NULL,
	"default_transaction_type" varchar(10) DEFAULT 'BOTH' NOT NULL,
	"requires_rental_dates" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_transactions" DROP CONSTRAINT "account_transactions_deleted_by_admin_id_admins_id_fk";
--> statement-breakpoint
DROP INDEX "account_transactions_purpose_idx";--> statement-breakpoint
DROP INDEX "account_transactions_deleted_idx";--> statement-breakpoint
ALTER TABLE "account_transactions" ADD COLUMN "transaction_head_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "account_transactions" ADD COLUMN "related_to_transaction_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_heads_name_idx" ON "transaction_heads" USING btree ("name");--> statement-breakpoint
CREATE INDEX "transaction_heads_type_idx" ON "transaction_heads" USING btree ("head_type");--> statement-breakpoint
CREATE INDEX "transaction_heads_active_idx" ON "transaction_heads" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_transaction_head_id_transaction_heads_id_fk" FOREIGN KEY ("transaction_head_id") REFERENCES "public"."transaction_heads"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_related_to_transaction_id_account_transactions_id_fk" FOREIGN KEY ("related_to_transaction_id") REFERENCES "public"."account_transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_transactions_head_idx" ON "account_transactions" USING btree ("transaction_head_id");--> statement-breakpoint
CREATE INDEX "account_transactions_related_idx" ON "account_transactions" USING btree ("related_to_transaction_id");--> statement-breakpoint
CREATE INDEX "account_transactions_updated_by_idx" ON "account_transactions" USING btree ("updated_by_admin_id");--> statement-breakpoint
ALTER TABLE "account_transactions" DROP COLUMN "purpose";--> statement-breakpoint
ALTER TABLE "account_transactions" DROP COLUMN "deleted_by_admin_id";--> statement-breakpoint
ALTER TABLE "account_transactions" DROP COLUMN "deleted_at";