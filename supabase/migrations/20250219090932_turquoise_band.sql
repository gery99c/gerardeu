/*
  # Create memes table and storage

  1. New Tables
    - `memes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `image_url` (text)
      - `category` (text)
      - `likes` (integer)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `memes` table
    - Add policies for authenticated users to:
      - Read all memes
      - Create their own memes
      - Update likes on any meme
      - Delete their own memes
*/

-- Create memes table
CREATE TABLE IF NOT EXISTS memes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  likes integer DEFAULT 0,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view memes"
  ON memes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create memes"
  ON memes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update likes"
  ON memes
  FOR UPDATE
  TO authenticated
  USING (
    -- Solo permitir actualizar la columna likes
    (
      SELECT COUNT(*) = 1
      FROM memes
      WHERE memes.id = id
      AND memes.title = title
      AND memes.image_url = image_url
      AND memes.category = category
      AND memes.user_id = user_id
    )
  );

CREATE POLICY "Users can delete their own memes"
  ON memes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);