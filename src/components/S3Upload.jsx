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

      // Convertir el archivo a ArrayBuffer
      const fileBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsArrayBuffer(file)
      })

      const command = new PutObjectCommand({
        Bucket: SUPABASE_BUCKET,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        ACL: 'public-read'
      })

      console.log('Enviando comando...')
      const response = await s3Client.send(command)
      console.log('Respuesta:', response)

      const publicUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`
      console.log('URL pública:', publicUrl)
      alert('¡Subida exitosa!\nURL: ' + publicUrl)

    } catch (error) {
      console.error('Error detallado:', error)
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
          Bucket: {SUPABASE_BUCKET}
          Project: {SUPABASE_PROJECT_ID}
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