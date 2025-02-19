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

// Función para subir una foto
async function uploadPhoto(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase
    .storage
    .from('memes')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading photo:', error);
    return null;
  }

  const url = `${supabase.storage.from('memes').getPublicUrl(fileName).publicURL}`;
  return url;
}

// Función para agregar un nuevo meme con foto
async function addMemeWithPhoto(title, file) {
  const photoUrl = await uploadPhoto(file);
  if (!photoUrl) return null;

  const newMeme = { title, url: photoUrl };
  return await addMeme(newMeme);
}

// Ejemplo de uso
(async () => {
  const memes = await getMemes();
  console.log('Memes:', memes);

  // Ejemplo de agregar un nuevo meme con foto
  const file = new File([''], 'example.jpg'); // Reemplaza con el archivo real
  const addedMeme = await addMemeWithPhoto('Nuevo Meme', file);
  console.log('Added Meme:', addedMeme);
})();
