CREATE TABLE "account_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_type" varchar(10) NOT NULL,
	"purpose" varchar(50) NOT NULL,
	"transaction_date" date NOT NULL,
	"rental_from_date" date,
	"rental_to_date" date,
	"amount" numeric(12, 2) NOT NULL,
	"remarks" text,
	"created_by_admin_id" uuid,
	"updated_by_admin_id" uuid,
	"deleted_by_admin_id" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_created_by_admin_id_admins_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_updated_by_admin_id_admins_id_fk" FOREIGN KEY ("updated_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_deleted_by_admin_id_admins_id_fk" FOREIGN KEY ("deleted_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_transactions_type_idx" ON "account_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "account_transactions_purpose_idx" ON "account_transactions" USING btree ("purpose");--> statement-breakpoint
CREATE INDEX "account_transactions_date_idx" ON "account_transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "account_transactions_deleted_idx" ON "account_transactions" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "account_transactions_created_by_idx" ON "account_transactions" USING btree ("created_by_admin_id");