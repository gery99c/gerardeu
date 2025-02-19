import { supabase } from './supabaseClient';

// Función para obtener memes
async function getMemes() {
  const { data, error } = await supabase
    .from('memes')
    .select('*');

  if (error) {
    console.error('Error fetching memes:', error);
    return [];
  }

  return data;
}

// Función para agregar un nuevo meme
async function addMeme(meme) {
  const { data, error } = await supabase
    .from('memes')
    .insert([meme]);

  if (error) {
    console.error('Error adding meme:', error);
    return null;
  }

  return data;
}

// Ejemplo de uso
(async () => {
  const memes = await getMemes();
  console.log('Memes:', memes);

  const newMeme = { title: 'Nuevo Meme', url: 'https://example.com/meme.jpg' };
  const addedMeme = await addMeme(newMeme);
  console.log('Added Meme:', addedMeme);
})();
