/*
  # Setup Storage for Memes

  1. Storage Configuration
    - Create a public bucket for meme images
    - Set up storage policies for:
      - Public read access
      - Authenticated upload access
*/

-- Create a bucket for meme images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to meme images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'memes');

-- Policy to allow authenticated users to upload meme images
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memes');

-- Policy to allow authenticated users to update their own uploads
CREATE POLICY "Authenticated Update Own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'memes' AND auth.uid() = owner);

-- Policy to allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated Delete Own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memes' AND auth.uid() = owner);