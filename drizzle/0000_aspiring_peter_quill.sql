CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" text NOT NULL,
	"quality" integer NOT NULL,
	"mode" text NOT NULL,
	"hint_used" integer NOT NULL,
	"session_id" uuid NOT NULL,
	"answered_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" text NOT NULL,
	"ease_factor" real NOT NULL,
	"interval" integer NOT NULL,
	"repetitions" integer NOT NULL,
	"due_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"last_session_date" date,
	"new_cards_per_day" integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"login" text NOT NULL,
	"login_lower" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_states" ADD CONSTRAINT "card_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answers_user_card_idx" ON "answers" USING btree ("user_id","card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "answers_dedup_idx" ON "answers" USING btree ("user_id","session_id","card_id","answered_at");--> statement-breakpoint
CREATE UNIQUE INDEX "card_states_user_card_idx" ON "card_states" USING btree ("user_id","card_id");--> statement-breakpoint
CREATE INDEX "card_states_due_idx" ON "card_states" USING btree ("user_id","due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_card_idx" ON "favorites" USING btree ("user_id","card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_login_lower_idx" ON "users" USING btree ("login_lower");