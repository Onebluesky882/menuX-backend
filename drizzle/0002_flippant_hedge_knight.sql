ALTER TABLE "shops" ADD COLUMN "receive_bank" text;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "receiver_id" text;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "receiver_name" text;--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "bank_code";--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "bank_account";--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "bank_id";