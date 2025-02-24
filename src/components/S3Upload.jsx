import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Crear un nuevo cliente de Supabase con las credenciales correctas
const supabase = createClient(
  'https://rrclsnobkthwwvnfxyuf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2xzbm9ia3Rod3d2bmZ4eXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzOTQzOTQsImV4cCI6MjA1NTk3MDM5NH0.R4SdQ_5UZC8aerokqKiauDrWYELq5Q_UywLo-dlb3CU'
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

      // Subir archivo usando el cliente de Supabase
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
      alert('¡Subida exitosa!\nURL: ' + publicUrl)

    } catch (error) {
      console.error('Error completo:', error)
      alert('Error: ' + (error.message || 'Error desconocido'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Subir Imagen</h2>
      <div style={{ marginBottom: '10px', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        <pre style={{ margin: 0, fontSize: '14px' }}>
          Bucket: joy-images
        </pre>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ marginBottom: '10px' }}
      />
      {uploading && (
        <div style={{ 
          padding: '10px',
          backgroundColor: '#e8f5e9',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          <p style={{ margin: 0 }}>Subiendo archivo...</p>
        </div>
      )}
    </div>
  )
}

export default S3Upload 