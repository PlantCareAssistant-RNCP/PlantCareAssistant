-- Enable Row Level Security on all tables (idempotent)
ALTER TABLE "USER_PROFILE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PLANT" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PLANT_TYPE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "POST" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "COMMENT" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LIKES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "USERS_POST" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "USER_PLANT" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EVENT" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to make it idempotent
DROP POLICY IF EXISTS "Users can manage their own profiles" ON "USER_PROFILE";
DROP POLICY IF EXISTS "Users can view all profiles" ON "USER_PROFILE";
DROP POLICY IF EXISTS "Users can manage their own plants" ON "PLANT";
DROP POLICY IF EXISTS "Users can view all plants" ON "PLANT";
DROP POLICY IF EXISTS "Anyone can view plant types" ON "PLANT_TYPE";
DROP POLICY IF EXISTS "Users can manage their own posts" ON "POST";
DROP POLICY IF EXISTS "Users can view all posts" ON "POST";
DROP POLICY IF EXISTS "Users can manage their own comments" ON "COMMENT";
DROP POLICY IF EXISTS "Users can view all comments" ON "COMMENT";
DROP POLICY IF EXISTS "Users can view their own likes" ON "LIKES";
DROP POLICY IF EXISTS "Users can insert their own likes" ON "LIKES";
DROP POLICY IF EXISTS "Users can delete their own likes" ON "LIKES";
DROP POLICY IF EXISTS "Users can manage their own user-post relationships" ON "USERS_POST";
DROP POLICY IF EXISTS "Users can manage their own user-plant relationships" ON "USER_PLANT";
DROP POLICY IF EXISTS "Users can manage their own events" ON "EVENT";

-- Create policies
CREATE POLICY "Users can manage their own profiles"
ON "USER_PROFILE" FOR ALL
USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
ON "USER_PROFILE" FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own plants"
ON "PLANT" FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all plants"
ON "PLANT" FOR SELECT
USING (true);

CREATE POLICY "Anyone can view plant types"
ON "PLANT_TYPE" FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own posts"
ON "POST" FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all posts"
ON "POST" FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own comments"
ON "COMMENT" FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comments"
ON "COMMENT" FOR SELECT
USING (true);

CREATE POLICY "Users can view their own likes"
ON "LIKES" FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes"
ON "LIKES" FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON "LIKES" FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own user-post relationships"
ON "USERS_POST" FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own user-plant relationships"
ON "USER_PLANT" FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own events"
ON "EVENT" FOR ALL
USING (auth.uid() = "userId");