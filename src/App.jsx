import React, { useState } from 'react'

const memes = [
  {
    id: 1,
    title: 'First Meme',
    url: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 2,
    title: 'Second Meme',
    url: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 3,
    title: 'Third Meme',
    url: 'https://picsum.photos/400/300?random=3'
  }
]

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % memes.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + memes.length) % memes.length)
  }

  const currentMeme = memes[currentIndex]

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '20px' }}>Meme Viewer</h1>
      
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
        <h2 style={{ marginBottom: '10px' }}>{currentMeme.title}</h2>
        <img 
          src={currentMeme.url} 
          alt={currentMeme.title}
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={handlePrev}
          style={{ padding: '8px 16px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Previous
        </button>
        <button 
          onClick={handleNext}
          style={{ padding: '8px 16px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default App
