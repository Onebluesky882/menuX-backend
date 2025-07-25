CREATE TABLE "mock" (
	"id" uuid
);
--> statement-breakpoint
ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employees" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "categories" CASCADE;--> statement-breakpoint
DROP TABLE "employees" CASCADE;--> statement-breakpoint
DROP TABLE "pages" CASCADE;--> statement-breakpoint
DROP TABLE "roles" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_line_user_id_unique";--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_line_user_id_users_line_user_id_fk";
--> statement-breakpoint
ALTER TABLE "menus" DROP CONSTRAINT "menus_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "menus" DROP CONSTRAINT "menus_page_id_pages_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "line_id" text;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "line_user_id";--> statement-breakpoint
ALTER TABLE "menus" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "menus" DROP COLUMN "page_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "nickname";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "birthday";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "emergency";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "emergency_contact";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "agent_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "line_user_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "line_picture_url";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "line_display_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "reset_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "reset_token_expiry";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_login_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "provider";