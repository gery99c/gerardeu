import { useState } from 'react'
import { supabase } from '../supabase'

function TestUpload() {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`

      console.log('Intentando subir archivo:', fileName)

      // Subir archivo
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      console.log('Archivo subido. URL:', publicUrl)
      alert('¡Subida exitosa! URL: ' + publicUrl)

    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  
}

export default TestUpload 