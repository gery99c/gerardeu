import { useState } from 'react'
import { supabase } from '../lib/supabase'

function ImageUploader() {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event) => {
    try {
      setUploading(true)

      // Obtener el archivo
      const file = event.target.files[0]
      if (!file) return

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      // Guardar información en la base de datos
      const { data, error } = await supabase
        .from('images')
        .insert([
          {
            title: file.name,
            image_url: publicUrl,
            description: 'Imagen subida desde prueba'
          }
        ])

      if (error) throw error

      alert('¡Imagen subida con éxito!')
      console.log('URL de la imagen:', publicUrl)

    } catch (error) {
      console.error('Error:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h2>Subir Imagen</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Subiendo...</p>}
    </div>
  )
}

export default ImageUploader 