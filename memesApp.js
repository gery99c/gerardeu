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

// Ejemplo de uso
(async () => {
  const memes = await getMemes();
  console.log('Memes:', memes);
})();
