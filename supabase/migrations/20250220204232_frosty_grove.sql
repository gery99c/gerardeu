/*
  # Update storage policies for public access

  1. Changes
    - Drop existing storage policies
    - Create bucket if not exists
    - Create new public access policies
  
  2. Security
    - Enables public access for demo purposes
    - Removes authentication requirements
    - Maintains bucket configuration
*/

-- Create a bucket for meme images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Own" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Own" ON storage.objects;

-- Create new policies with unique names for public access
CREATE POLICY "Storage Public Select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'memes');

CREATE POLICY "Storage Public Insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'memes');

CREATE POLICY "Storage Public Update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'memes');

CREATE POLICY "Storage Public Delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'memes');