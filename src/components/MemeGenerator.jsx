import { supabase } from '../supabase'

function MemeGenerator() {
  // ... existing code ...

  const handleSaveMeme = async () => {
    try {
      // Obtener el canvas
      const canvas = document.querySelector('.meme canvas')
      if (!canvas) {
        alert('Por favor, genera un meme primero')
        return
      }

      // Convertir el canvas a blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const fileName = `meme_${Date.now()}.png`

      // Subir a Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes')
        .upload(fileName, blob, {
          contentType: 'image/png'
        })

      if (uploadError) {
        alert('Error al subir la imagen')
        console.error(uploadError)
        return
      }

      // Obtener URL pública
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
        alert('Error al guardar en la base de datos')
        console.error(error)
        return
      }

      alert('¡Meme guardado con éxito!')

    } catch (error) {
      alert('Error al guardar el meme')
      console.error(error)
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