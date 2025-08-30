-- Migration file for plant-images storage bucket policies

-- Create plant-images bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'plant-images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'plant-images',
            'plant-images',
            false, 
            5242880,
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        );
    END IF;
END $$;

-- Storage policies for plant-images bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can upload their own plant images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view all plant images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own plant images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own plant images" ON storage.objects;
    
    -- Create policy for uploading plant images
    CREATE POLICY "Users can upload their own plant images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'plant-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

    -- Create policy for viewing all plant images
    CREATE POLICY "Users can view all plant images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'plant-images');

    -- Create policy for updating own plant images
    CREATE POLICY "Users can update their own plant images"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'plant-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

    -- Create policy for deleting own plant images
    CREATE POLICY "Users can delete their own plant images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'plant-images' 
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