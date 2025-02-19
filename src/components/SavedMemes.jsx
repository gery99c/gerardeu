import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function SavedMemes() {
  const [memes, setMemes] = useState([])

  useEffect(() => {
    loadMemes()
  }, [])

  async function loadMemes() {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al cargar memes:', error)
      return
    }

    setMemes(data)
  }

  return (
    <div className="saved-memes">
      <h2>Memes Guardados</h2>
      <div className="memes-grid">
        {memes.map(meme => (
          <div key={meme.id} className="meme-card">
            <img src={meme.image_url} alt="Meme" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SavedMemes 