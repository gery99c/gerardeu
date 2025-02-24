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
    const subscription = supabase
      .channel('joy_images_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'joy_images' }, loadMemes)
      .subscribe()

    return () => subscription.unsubscribe()
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

    if (error) console.error('Error al dar like:', error)
  }

  const handleShare = async (memeId, currentShares, memeUrl) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mira este meme',
          text: '¡Échale un vistazo a este meme!',
          url: memeUrl
        })
        
        const { error } = await supabase
          .from('joy_images')
          .update({ shares: currentShares + 1 })
          .eq('id', memeId)

        if (error) throw error
      } catch (error) {
        console.error('Error al compartir:', error)
      }
    } else {
      navigator.clipboard.writeText(memeUrl)
      alert('¡URL copiada al portapapeles!')
    }
  }

  return (
    <div className="meme-container">
      {memes.map((meme, index) => (
        <div key={meme.id} className="meme-card">
          <div className="meme-image-container">
            <img src={meme.url} alt={meme.name} className="meme-image" />
            <div className="meme-title">Meme {index + 1}</div>
          </div>
          <div className="meme-footer">
            <span className="category-tag">{meme.category}</span>
            <div className="action-buttons">
              <button 
                className="action-button like-button" 
                onClick={() => handleLike(meme.id, meme.likes)}
              >
                <span className="heart-icon">❤️</span>
                <span className="count">{meme.likes || 0}</span>
              </button>
              <button 
                className="action-button share-button"
                onClick={() => handleShare(meme.id, meme.shares, meme.url)}
              >
                <span className="share-icon">↗️</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .meme-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
          background-color: #1a1f2e;
        }

        .meme-card {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: #2a2f3e;
          transition: transform 0.2s;
        }

        .meme-card:hover {
          transform: translateY(-5px);
        }

        .meme-image-container {
          position: relative;
          width: 100%;
          padding-top: 75%; /* 4:3 Aspect Ratio */
        }

        .meme-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .meme-title {
          position: absolute;
          top: 10px;
          left: 10px;
          color: white;
          font-size: 1.2em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .meme-footer {
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0,0,0,0.5);
        }

        .category-tag {
          color: #4a90e2;
          font-size: 0.9em;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .action-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px;
        }

        .like-button .count {
          color: #ff4757;
        }

        .heart-icon, .share-icon {
          font-size: 1.2em;
        }
      `}</style>
    </div>
  )
}

export default MemeGrid 