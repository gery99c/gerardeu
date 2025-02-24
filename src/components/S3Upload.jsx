import { useState } from 'react'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../lib/s3'

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

      console.log('Iniciando subida de:', fileName)

      // Convertir archivo a Buffer
      const buffer = await file.arrayBuffer()

      const command = new PutObjectCommand({
        Bucket: 'images', // Asegúrate de que este es el nombre correcto de tu bucket
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read'
      })

      console.log('Enviando archivo a S3...')
      const response = await s3Client.send(command)
      console.log('Respuesta S3:', response)

      const publicUrl = `https://vbytyrxlktjmbqxunrhw.supabase.co/storage/v1/object/public/images/${fileName}`
      
      console.log('URL pública:', publicUrl)
      alert('¡Archivo subido con éxito!\nURL: ' + publicUrl)
      setProgress(100)

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