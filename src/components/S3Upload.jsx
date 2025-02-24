import { useState } from 'react'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../lib/s3'

function S3Upload() {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `upload_${Date.now()}.${fileExt}`

      console.log('Iniciando subida al bucket joy-images...')
      console.log('Nombre del archivo:', fileName)

      // Convertir a Buffer
      const buffer = await file.arrayBuffer()

      const command = new PutObjectCommand({
        Bucket: 'joy-images', // Nombre correcto del bucket
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read'
      })

      console.log('Enviando comando a S3...')
      const response = await s3Client.send(command)
      console.log('Respuesta S3:', response)

      const publicUrl = `https://vbytyrxlktjmbqxunrhw.supabase.co/storage/v1/object/public/joy-images/${fileName}`
      console.log('URL pública:', publicUrl)
      alert('¡Subida exitosa! URL: ' + publicUrl)

    } catch (error) {
      console.error('Error completo:', error)
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Subir Imagen (S3)</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ marginBottom: '10px' }}
      />
      {uploading && <p>Subiendo...</p>}
      <p style={{ fontSize: '14px', color: '#666' }}>
        Subiendo al bucket: joy-images
      </p>
    </div>
  )
}

export default S3Upload 