import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ybytyrxlktjmbqxunrhw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieXR5cnhsa3RqbWJxeHVucmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY0NjcsImV4cCI6MjA1NTUzMjQ2N30.Sjec8zFzC8xlLdAoSekkbZG5x93suFMc91CUYY-YRhc'
)

function MemeGrid() {
  const [memes, setMemes] = useState([])

  useEffect(() => {
    loadMemes()
    // Suscribirse a cambios en la tabla
    const subscription = supabase
      .channel('joy_images_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'joy_images' }, loadMemes)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadMemes = async () => {
    const { data, error } = await supabase
      .from('joy_images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando memes:', error)
      return
    }

    setMemes(data || [])
  }

  const handleLike = async (memeId, currentLikes) => {
    const { error } = await supabase
      .from('joy_images')
      .update({ likes: currentLikes + 1 })
      .eq('id', memeId)

    if (error) {
      console.error('Error al dar like:', error)
    }
  }

  const handleShare = async (memeId, currentShares, memeUrl) => {
    // Intentar usar Web Share API si está disponible
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mira este meme',
          text: '¡Échale un vistazo a este meme!',
          url: memeUrl
        })
        
        // Actualizar contador de shares
        const { error } = await supabase
          .from('joy_images')
          .update({ shares: currentShares + 1 })
          .eq('id', memeId)

        if (error) throw error
      } catch (error) {
        console.error('Error al compartir:', error)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(memeUrl)
      alert('¡URL copiada al portapapeles!')
    }
  }

  return (
    <div className="meme-grid">
      {memes.map(meme => (
        <div key={meme.id} className="meme-card">
          <img src={meme.url} alt={meme.name} className="meme-image" />
          <div className="meme-info">
            <span className="meme-category">{meme.category}</span>
            <div className="meme-actions">
              <button 
                onClick={() => handleLike(meme.id, meme.likes)}
                className="action-button like-button"
              >
                👍 {meme.likes}
              </button>
              <button 
                onClick={() => handleShare(meme.id, meme.shares, meme.url)}
                className="action-button share-button"
              >
                📤 {meme.shares}
              </button>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .meme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
        }

        .meme-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .meme-card:hover {
          transform: translateY(-4px);
        }

        .meme-image {
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .meme-info {
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .meme-category {
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 14px;
        }

        .meme-actions {
          display: flex;
          gap: 8px;
        }

        .action-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 8px;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-button:hover {
          background-color: #f0f0f0;
        }

        .like-button {
          color: #4a90e2;
        }

        .share-button {
          color: #43a047;
        }
      `}</style>
    </div>
  )
}

export default MemeGrid 