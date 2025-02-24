import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function TestUpload() {
  const [uploading, setUploading] = useState(false)
  const [buckets, setBuckets] = useState([])

  useEffect(() => {
    // Listar buckets al cargar el componente
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

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `test_${Date.now()}.${fileExt}`

      // Primero, intentemos listar los buckets para ver qué tenemos disponible
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets()
      console.log('Buckets disponibles:', bucketsData)
      
      if (bucketsError) {
        throw new Error('Error al listar buckets: ' + bucketsError.message)
      }

      // Subir a Storage usando el primer bucket disponible
      const bucketName = bucketsData[0]?.name
      if (!bucketName) {
        throw new Error('No hay buckets disponibles')
      }

      console.log('Intentando subir al bucket:', bucketName)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`public/${fileName}`, file)

      if (uploadError) {
        console.error('Error al subir a storage:', uploadError)
        throw uploadError
      }

      console.log('Archivo subido correctamente:', uploadData)

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`public/${fileName}`)

      console.log('URL pública generada:', publicUrl)
      alert('¡Imagen subida con éxito! URL: ' + publicUrl)

    } catch (error) {
      console.error('Error completo:', error)
      alert('Error: ' + (error.message || 'Error desconocido'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test de Subida de Imagen</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Buckets disponibles:</h3>
        <ul>
          {buckets.map(bucket => (
            <li key={bucket.id || bucket.name}>
              {bucket.name} {bucket.public ? '(público)' : '(privado)'}
            </li>
          ))}
        </ul>
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

export default TestUpload 