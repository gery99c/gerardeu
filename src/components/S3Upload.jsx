import { useState } from 'react'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client, SUPABASE_PROJECT_ID, SUPABASE_BUCKET, SUPABASE_TABLE } from '../lib/s3'
import { supabase } from '../supabase' // Asegúrate de tener este import

function S3Upload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (event) => {
    try {
      setUploading(true)
      setProgress(0)
      
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `upload_${Date.now()}.${fileExt}`

      console.log('Iniciando subida:', {
        bucket: SUPABASE_BUCKET,
        fileName,
        projectId: SUPABASE_PROJECT_ID
      })

      // 1. Subir archivo a S3
      const parallelUploads3 = new Upload({
        client: s3Client,
        params: {
          Bucket: SUPABASE_BUCKET,
          Key: fileName,
          Body: file,
          ContentType: file.type,
          ACL: 'public-read'
        },
        queueSize: 4,
        partSize: 1024 * 1024 * 5
      })

      parallelUploads3.on('httpUploadProgress', (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100)
        setProgress(percentage)
        console.log(`Progreso: ${percentage}%`)
      })

      await parallelUploads3.done()
      
      // Generar URL pública
      const publicUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`
      
      // 2. Guardar referencia en la base de datos
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .insert([
          {
            url: publicUrl,
            name: fileName,
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      console.log('Archivo subido y guardado en BD:', data)
      alert('¡Subida exitosa!\nURL: ' + publicUrl)

    } catch (error) {
      console.error('Error en la subida:', error)
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Subir Imagen (S3)</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          style={{ marginBottom: '10px' }}
        />
        {uploading && (
          <div>
            <p>Subiendo... {progress}%</p>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#f0f0f0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease-in-out'
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default S3Upload 