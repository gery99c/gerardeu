import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rrclsnobkthwwvnfxyuf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2xzbm9ia3Rod3d2bmZ4eXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzOTQzOTQsImV4cCI6MjA1NTk3MDM5NH0.R4SdQ_5UZC8aerokqKiauDrWYELq5Q_UywLo-dlb3CU'
)

function S3Upload() {
  const [uploading, setUploading] = useState(false)
  const [buckets, setBuckets] = useState([])

  useEffect(() => {
    // Listar buckets disponibles al cargar
    async function listBuckets() {
      const { data, error } = await supabase.storage.listBuckets()
      if (error) {
        console.error('Error al listar buckets:', error)
      } else {
        console.log('Buckets disponibles:', data)
        setBuckets(data || [])
      }
    }
    listBuckets()
  }, [])

  const handleUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      // Primero, listar buckets para verificar
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets()
      console.log('Buckets actuales:', bucketsData)

      if (bucketsError) {
        throw new Error('Error al listar buckets: ' + bucketsError.message)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `upload_${Date.now()}.${fileExt}`

      // Usar el primer bucket disponible
      const bucketName = bucketsData[0]?.name
      if (!bucketName) {
        throw new Error('No hay buckets disponibles')
      }

      console.log('Intentando subir a bucket:', bucketName)

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
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
      <div style={{ marginBottom: '20px' }}>
        <h3>Buckets disponibles:</h3>
        <ul>
          {buckets.map(bucket => (
            <li key={bucket.id}>
              {bucket.name} {bucket.public ? '(público)' : '(privado)'}
            </li>
          ))}
        </ul>
        {buckets.length === 0 && (
          <p style={{ color: 'red' }}>No hay buckets disponibles</p>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ marginBottom: '10px' }}
      />
      {uploading && <p>Subiendo...</p>}
    </div>
  )
}

export default S3Upload 