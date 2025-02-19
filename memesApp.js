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
// hola
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

  const { publicURL, error: urlError } = supabase
    .storage
    .from('memes')
    .getPublicUrl(fileName);

  if (urlError) {
    console.error('Error getting public URL:', urlError);
    return null;
  }

  return publicURL;
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
  const fileInput = document.querySelector('#fileInput'); // Asegúrate de tener un input de archivo en tu HTML
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
      const addedMeme = await addMemeWithPhoto('Nuevo Meme', file);
      console.log('Added Meme:', addedMeme);
    }
  });
})();
