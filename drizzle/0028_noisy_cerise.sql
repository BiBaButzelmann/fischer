ALTER TABLE "profile" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_email_unique" UNIQUE("email");