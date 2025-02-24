import { useState } from 'react'
import { supabase } from '../supabase'

function ImageUploader() {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`

      // Subir a Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('joy-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('joy-images')
        .getPublicUrl(fileName)

      // Guardar en la base de datos
      const { data, error } = await supabase
        .from('joy_images')
        .insert([
          {
            title: file.name,
            image_url: publicUrl,
            description: 'Imagen de prueba',
            category: 'test'
          }
        ])

      if (error) throw error

      alert('¡Imagen subida con éxito!')
      console.log('URL de la imagen:', publicUrl)

    } catch (error) {
      console.error('Error:', error)
      alert('Error al subir la imagen: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Subir Imagen a JoyFinder</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ marginBottom: '10px', display: 'block' }}
      />
      {uploading && <p>Subiendo...</p>}
    </div>
  )
}

export default ImageUploader 