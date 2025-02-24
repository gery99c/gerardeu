-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT,
    image_url TEXT,
    description TEXT
);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Permitir lectura pública de imágenes"
ON images FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir inserción pública de imágenes"
ON images FOR INSERT
TO public
WITH CHECK (true); 