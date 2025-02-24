import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Configuración correcta del cliente de Supabase
const supabase = createClient(
  'https://ybytyrxlktjmbqxunrhw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieXR5cnhsa3RqbWJxeHVucmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY0NjcsImV4cCI6MjA1NTUzMjQ2N30.Sjec8zFzC8xlLdAoSekkbZG5x93suFMc91CUYY-YRhc'
)

function S3Upload() {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `upload_${Date.now()}.${fileExt}`

      console.log('Iniciando subida:', {
        bucket: 'joy-images',
        fileName,
        fileSize: file.size
      })

      // Subir archivo
      const { data, error } = await supabase.storage
        .from('joy-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error de subida:', error)
        throw error
      }

      console.log('Archivo subido:', data)

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('joy-images')
        .getPublicUrl(fileName)

      console.log('URL pública:', publicUrl)

      // Guardar referencia en la base de datos
      const { data: dbData, error: dbError } = await supabase
        .from('joy_images')
        .insert([
          {
            url: publicUrl,
            name: fileName,
            created_at: new Date().toISOString()
          }
        ])

      if (dbError) {
        console.error('Error al guardar en BD:', dbError)
        throw dbError
      }

      alert('¡Subida exitosa!\nURL: ' + publicUrl)

    } catch (error) {
      console.error('Error completo:', error)
      alert('Error: ' + (error.message || 'Error desconocido'))
    } finally {
      setUploading(false)
    }
  }

}

export default S3Upload 