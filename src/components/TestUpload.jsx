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
      const fileName = `test_${Date.now()}.${fileExt}`

      console.log('Iniciando subida de archivo:', fileName)

      // Subir a Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('joy-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Error al subir a storage:', uploadError)
        throw uploadError
      }

      console.log('Archivo subido correctamente:', uploadData)

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('joy-images')
        .getPublicUrl(fileName)

      console.log('URL pública generada:', publicUrl)
      alert('¡Imagen subida con éxito! URL: ' + publicUrl)

    } catch (error) {
      console.error('Error completo:', error)
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test de Subida de Imagen</h2>
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