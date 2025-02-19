import { supabase } from '../supabase'

function MemeGenerator() {
  // ... existing code ...

  const handleSaveMeme = async () => {
    try {
      console.log('Iniciando guardado del meme...')
      
      // 1. Obtener el canvas y verificar que existe
      const canvas = document.querySelector('canvas')
      if (!canvas) {
        throw new Error('No se encontró el canvas')
      }
      console.log('Canvas encontrado')

      // 2. Convertir canvas a Blob
      const blob = await new Promise((resolve, reject) => {
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Error al crear blob'))
            }
          }, 'image/png')
        } catch (error) {
          reject(error)
        }
      })
      console.log('Blob creado:', blob.size, 'bytes')

      // 3. Subir a Supabase Storage
      const fileName = `meme_${Date.now()}.png`
      console.log('Intentando subir:', fileName)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memes')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Error al subir: ${uploadError.message}`)
      }
      console.log('Archivo subido exitosamente:', uploadData)

      // 4. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('memes')
        .getPublicUrl(fileName)
      
      console.log('URL pública generada:', publicUrl)

      // 5. Guardar en la base de datos
      const { data: dbData, error: dbError } = await supabase
        .from('memes')
        .insert([
          {
            image_url: publicUrl,
            top_text: topText,
            bottom_text: bottomText,
            template_name: meme?.name || 'custom'
          }
        ])
        .select()

      if (dbError) {
        throw new Error(`Error en base de datos: ${dbError.message}`)
      }
      console.log('Meme guardado en la base de datos:', dbData)

      alert('¡Meme guardado con éxito!')

    } catch (error) {
      console.error('Error completo:', error)
      alert(error.message)
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