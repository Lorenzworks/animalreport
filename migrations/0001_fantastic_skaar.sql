ALTER TABLE "animals" DROP CONSTRAINT "animals_owner_id_users_email_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_users_email_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_post_author_id_post_created_at_posts_author_id_created_at_fk";
--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_users_email_fk";
--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_followee_id_users_email_fk";
--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_animal_owner_id_animal_name_animals_owner_id_name_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_user_id_users_email_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_post_author_id_post_created_at_posts_author_id_created_at_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_users_email_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_reporter_id_users_email_fk";
--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_post_author_id_post_created_at_posts_author_id_created_at_fk";
--> statement-breakpoint
ALTER TABLE "animals" DROP CONSTRAINT "animals_owner_id_name_pk";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_post_author_id_post_created_at_author_id_created_at_pk";--> statement-breakpoint
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_followee_id_animal_owner_id_animal_name_pk";--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_post_author_id_post_created_at_user_id_pk";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_created_at_pk";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_post_author_id_post_created_at_reporter_id_created_at_pk";--> statement-breakpoint
ALTER TABLE "animals" ALTER COLUMN "owner_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "author_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "follows" ALTER COLUMN "follower_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "follows" ALTER COLUMN "followee_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "user_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "author_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "reporter_id" SET DATA TYPE varchar;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'users'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "users" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "post_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ADD COLUMN "animal_id" varchar;--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "post_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "post_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "animals" ADD CONSTRAINT "animals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_followee_id_users_id_fk" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "post_author_id";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "post_created_at";--> statement-breakpoint
ALTER TABLE "follows" DROP COLUMN "animal_owner_id";--> statement-breakpoint
ALTER TABLE "follows" DROP COLUMN "animal_name";--> statement-breakpoint
ALTER TABLE "likes" DROP COLUMN "post_author_id";--> statement-breakpoint
ALTER TABLE "likes" DROP COLUMN "post_created_at";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "post_author_id";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "post_created_at";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");