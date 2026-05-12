CREATE TABLE "animals" (
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"sex" text,
	"age" text,
	"bio" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "animals_owner_id_name_pk" PRIMARY KEY("owner_id","name")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"post_author_id" text NOT NULL,
	"post_created_at" timestamp NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "comments_post_author_id_post_created_at_author_id_created_at_pk" PRIMARY KEY("post_author_id","post_created_at","author_id","created_at")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_id" text,
	"followee_id" text,
	"animal_owner_id" text,
	"animal_name" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "follows_follower_id_followee_id_animal_owner_id_animal_name_pk" PRIMARY KEY("follower_id","followee_id","animal_owner_id","animal_name")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"post_author_id" text NOT NULL,
	"post_created_at" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "likes_post_author_id_post_created_at_user_id_pk" PRIMARY KEY("post_author_id","post_created_at","user_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"author_id" text NOT NULL,
	"animal_name" text NOT NULL,
	"species" text NOT NULL,
	"details" text,
	"location" text,
	"media_url" text NOT NULL,
	"media_type" text NOT NULL,
	"status" text DEFAULT 'LOST' NOT NULL,
	"lat" real,
	"lng" real,
	"contact" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "posts_author_id_created_at_pk" PRIMARY KEY("author_id","created_at")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"post_author_id" text NOT NULL,
	"post_created_at" timestamp NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" text NOT NULL,
	"note" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "reports_post_author_id_post_created_at_reporter_id_created_at_pk" PRIMARY KEY("post_author_id","post_created_at","reporter_id","created_at")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"email" text PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"bio" text,
	"avatar_url" text,
	"location_lat" real,
	"location_lng" real,
	"radius_km" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "animals" ADD CONSTRAINT "animals_owner_id_users_email_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_email_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_author_id_post_created_at_posts_author_id_created_at_fk" FOREIGN KEY ("post_author_id","post_created_at") REFERENCES "public"."posts"("author_id","created_at") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_email_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followee_id_users_email_fk" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_animal_owner_id_animal_name_animals_owner_id_name_fk" FOREIGN KEY ("animal_owner_id","animal_name") REFERENCES "public"."animals"("owner_id","name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_email_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_author_id_post_created_at_posts_author_id_created_at_fk" FOREIGN KEY ("post_author_id","post_created_at") REFERENCES "public"."posts"("author_id","created_at") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_email_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_email_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_post_author_id_post_created_at_posts_author_id_created_at_fk" FOREIGN KEY ("post_author_id","post_created_at") REFERENCES "public"."posts"("author_id","created_at") ON DELETE no action ON UPDATE no action;