-- Migration file for post-images storage bucket policies

-- Create post-images bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'post-images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'post-images',
            'post-images',
            true,
            10485760, -- 10MB limit
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        );
    END IF;
END $$;

-- Storage policies for post-images bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can upload their own post images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view all post images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own post images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own post images" ON storage.objects;
    
    -- Create policy for uploading images
    CREATE POLICY "Users can upload their own post images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'post-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

    -- Create policy for viewing all images
    CREATE POLICY "Users can view all post images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'post-images');

    -- Create policy for updating own images
    CREATE POLICY "Users can update their own post images"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'post-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

    -- Create policy for deleting own images
    CREATE POLICY "Users can delete their own post images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'post-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
END $$;

-- Enable RLS on storage.objects if not already enabled
DO $$
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')) THEN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;