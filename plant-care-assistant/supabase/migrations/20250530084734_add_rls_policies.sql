-- Enable Row Level Security on all tables
ALTER TABLE "USER_PROFILE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PLANT" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PLANT_TYPE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "POST" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "COMMENT" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LIKES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "USERS_POST" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "USER_PLANT" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EVENT" ENABLE ROW LEVEL SECURITY;

-- UserProfile policies
CREATE POLICY "Users can manage their own profiles"
ON "USER_PROFILE" FOR ALL
USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
ON "USER_PROFILE" FOR SELECT
USING (true);

-- Plant policies
CREATE POLICY "Users can manage their own plants"
ON "PLANT" FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all plants"
ON "PLANT" FOR SELECT
USING (true);

-- PlantType policies (reference data - public read-only)
CREATE POLICY "Anyone can view plant types"
ON "PLANT_TYPE" FOR SELECT
USING (true);

-- Post policies
CREATE POLICY "Users can manage their own posts"
ON "POST" FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all posts"
ON "POST" FOR SELECT
USING (true);

-- Comment policies
CREATE POLICY "Users can manage their own comments"
ON "COMMENT" FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comments"
ON "COMMENT" FOR SELECT
USING (true);

-- Likes policies
CREATE POLICY "Users can view their own likes"
ON "LIKES" FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes"
ON "LIKES" FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON "LIKES" FOR DELETE
USING (auth.uid() = user_id);

-- UsersPost policies
CREATE POLICY "Users can manage their own user-post relationships"
ON "USERS_POST" FOR ALL
USING (auth.uid() = user_id);

-- UserPlant policies
CREATE POLICY "Users can manage their own user-plant relationships"
ON "USER_PLANT" FOR ALL
USING (auth.uid() = user_id);

-- Event policies
CREATE POLICY "Users can manage their own events"
ON "EVENT" FOR ALL
USING (auth.uid() = "userId");