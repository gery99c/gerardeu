import { useState } from 'react'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, SUPABASE_PROJECT_ID, SUPABASE_BUCKET } from '../lib/s3'

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
        bucket: SUPABASE_BUCKET,
        fileName,
        projectId: SUPABASE_PROJECT_ID
      })

      const command = new PutObjectCommand({
        Bucket: SUPABASE_BUCKET,
        Key: fileName,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read'
      })

      const response = await s3Client.send(command)
      console.log('Respuesta:', response)

      const publicUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`
      console.log('URL pública:', publicUrl)
      alert('¡Subida exitosa!\nURL: ' + publicUrl)

    } catch (error) {
      console.error('Error detallado:', error)
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Subir Imagen</h2>
      <div style={{ marginBottom: '10px' }}>
        <code>
          Bucket: {SUPABASE_BUCKET}<br/>
          Project: {SUPABASE_PROJECT_ID}
        </code>
      </div>
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

export default S3Upload 