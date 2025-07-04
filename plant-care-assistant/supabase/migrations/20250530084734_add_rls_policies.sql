-- Enable Row Level Security on all tables (only if tables exist)
DO $$
BEGIN
    -- Check if USER_PROFILE table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'USER_PROFILE') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'USER_PROFILE') THEN
            ALTER TABLE "USER_PROFILE" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
    
    -- Check if PLANT table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'PLANT') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'PLANT') THEN
            ALTER TABLE "PLANT" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
    
    -- Check if PLANT_TYPE table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'PLANT_TYPE') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'PLANT_TYPE') THEN
            ALTER TABLE "PLANT_TYPE" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
    
    -- Check if POST table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'POST') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'POST') THEN
            ALTER TABLE "POST" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
    
    -- Check if COMMENT table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'COMMENT') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'COMMENT') THEN
            ALTER TABLE "COMMENT" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
    
    -- Check if LIKES table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'LIKES') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'LIKES') THEN
            ALTER TABLE "LIKES" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
    
    -- Check if USERS_POST table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'USERS_POST') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'USERS_POST') THEN
            ALTER TABLE "USERS_POST" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
    
    -- Check if USER_PLANT table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'USER_PLANT') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'USER_PLANT') THEN
            ALTER TABLE "USER_PLANT" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
    
    -- Check if EVENT table exists and enable RLS if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'EVENT') THEN
        IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'EVENT') THEN
            ALTER TABLE "EVENT" ENABLE ROW LEVEL SECURITY;
        END IF;
    END IF;
END $$;

-- UserProfile policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'USER_PROFILE') THEN
        DROP POLICY IF EXISTS "Users can manage their own profiles" ON "USER_PROFILE";
        DROP POLICY IF EXISTS "Users can view all profiles" ON "USER_PROFILE";
        
        CREATE POLICY "Users can manage their own profiles"
        ON "USER_PROFILE" FOR ALL
        USING (auth.uid() = id);

        CREATE POLICY "Users can view all profiles"
        ON "USER_PROFILE" FOR SELECT
        USING (true);
    END IF;
END $$;

-- Plant policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'PLANT') THEN
        DROP POLICY IF EXISTS "Users can manage their own plants" ON "PLANT";
        DROP POLICY IF EXISTS "Users can view all plants" ON "PLANT";
        
        CREATE POLICY "Users can manage their own plants"
        ON "PLANT" FOR ALL
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can view all plants"
        ON "PLANT" FOR SELECT
        USING (true);
    END IF;
END $$;

-- PlantType policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'PLANT_TYPE') THEN
        DROP POLICY IF EXISTS "Anyone can view plant types" ON "PLANT_TYPE";
        
        CREATE POLICY "Anyone can view plant types"
        ON "PLANT_TYPE" FOR SELECT
        USING (true);
    END IF;
END $$;

-- Post policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'POST') THEN
        DROP POLICY IF EXISTS "Users can manage their own posts" ON "POST";
        DROP POLICY IF EXISTS "Users can view all posts" ON "POST";
        
        CREATE POLICY "Users can manage their own posts"
        ON "POST" FOR ALL
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can view all posts"
        ON "POST" FOR SELECT
        USING (true);
    END IF;
END $$;

-- Comment policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'COMMENT') THEN
        DROP POLICY IF EXISTS "Users can manage their own comments" ON "COMMENT";
        DROP POLICY IF EXISTS "Users can view all comments" ON "COMMENT";
        
        CREATE POLICY "Users can manage their own comments"
        ON "COMMENT" FOR ALL
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can view all comments"
        ON "COMMENT" FOR SELECT
        USING (true);
    END IF;
END $$;

-- Likes policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'LIKES') THEN
        DROP POLICY IF EXISTS "Users can view their own likes" ON "LIKES";
        DROP POLICY IF EXISTS "Users can insert their own likes" ON "LIKES";
        DROP POLICY IF EXISTS "Users can delete their own likes" ON "LIKES";
        
        CREATE POLICY "Users can view their own likes"
        ON "LIKES" FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own likes"
        ON "LIKES" FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own likes"
        ON "LIKES" FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- UsersPost policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'USERS_POST') THEN
        DROP POLICY IF EXISTS "Users can manage their own user-post relationships" ON "USERS_POST";
        
        CREATE POLICY "Users can manage their own user-post relationships"
        ON "USERS_POST" FOR ALL
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- UserPlant policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'USER_PLANT') THEN
        DROP POLICY IF EXISTS "Users can manage their own user-plant relationships" ON "USER_PLANT";
        
        CREATE POLICY "Users can manage their own user-plant relationships"
        ON "USER_PLANT" FOR ALL
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Event policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'EVENT') THEN
        DROP POLICY IF EXISTS "Users can manage their own events" ON "EVENT";
        
        CREATE POLICY "Users can manage their own events"
        ON "EVENT" FOR ALL
        USING (auth.uid() = "userId");
    END IF;
END $$;