import { supabase } from '../supabase'

function MemeGenerator() {
  // ... existing code ...

  const handleSaveMeme = async () => {
    try {
      // Obtener el canvas
      const canvas = document.querySelector('canvas')
      if (!canvas) {
        alert('Por favor, genera un meme primero')
        return
      }

      // Convertir el canvas a blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const fileName = `meme_${Date.now()}.png`

      // Subir la imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes')
        .upload(fileName, blob)

      if (uploadError) {
        console.error('Error al subir:', uploadError)
        alert('Error al subir la imagen')
        return
      }

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('memes')
        .getPublicUrl(fileName)

      // Guardar en la base de datos
      const { data, error } = await supabase
        .from('memes')
        .insert([
          {
            image_url: publicUrl,
            top_text: topText,
            bottom_text: bottomText,
            template_name: meme?.name || 'custom'
          }
        ])

      if (error) {
        console.error('Error al guardar:', error)
        alert('Error al guardar el meme')
        return
      }

      alert('¡Meme guardado con éxito!')

    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el meme')
    }
  }

  return (
    <div className="meme-generator">
      {/* ... existing code ... */}
      <div className="buttons">
        <button onClick={generateMeme}>Generar Meme</button>
        <button onClick={handleSaveMeme}>Guardar Meme</button>
      </div>
      {/* ... existing code ... */}
    </div>
  )
}

export default MemeGenerator 