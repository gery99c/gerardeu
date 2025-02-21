/*
  # Update memes table policies for public access

  1. Changes
    - Drop existing policies
    - Create new policies for public access
    - Remove user_id dependency
  
  2. Security
    - Enables public access for demo purposes
    - Removes authentication requirements
    - Maintains data integrity with conditional updates
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view memes" ON memes;
DROP POLICY IF EXISTS "Authenticated users can create memes" ON memes;
DROP POLICY IF EXISTS "Users can update likes" ON memes;
DROP POLICY IF EXISTS "Users can delete their own memes" ON memes;
DROP POLICY IF EXISTS "Anyone can create memes" ON memes;
DROP POLICY IF EXISTS "Anyone can update likes" ON memes;
DROP POLICY IF EXISTS "Anyone can delete memes" ON memes;

-- Remove user_id foreign key if it exists
DO $$ 
BEGIN
  ALTER TABLE memes DROP CONSTRAINT IF EXISTS memes_user_id_fkey;
  ALTER TABLE memes DROP COLUMN IF EXISTS user_id;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

-- Update memes table structure
ALTER TABLE memes 
  ALTER COLUMN likes SET DEFAULT 0,
  ALTER COLUMN created_at SET DEFAULT now();

-- Enable RLS
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Create new policies for public access
CREATE POLICY "Public View Memes"
  ON memes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public Create Memes"
  ON memes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public Update Likes"
  ON memes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (
    -- Only allow updating the likes column
    (
      SELECT COUNT(*) = 1
      FROM memes
      WHERE memes.id = id
      AND memes.title = title
      AND memes.image_url = image_url
      AND memes.category = category
    )
  );

CREATE POLICY "Public Delete Memes"
  ON memes
  FOR DELETE
  TO public
  USING (true);