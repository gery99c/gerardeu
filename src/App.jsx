import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShare, FaArrowUp, FaArrowDown, FaHome, FaSearch, 
         FaHandsHelping, FaUpload, FaTimes, FaFolder, FaInfoCircle, FaShieldAlt,
         FaBullhorn, FaTwitter, FaInstagram, FaGithub, FaDiscord } from 'react-icons/fa';
import TestUpload from './components/TestUpload'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ybytyrxlktjmbqxunrhw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieXR5cnhsa3RqbWJxeHVucmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY0NjcsImV4cCI6MjA1NTUzMjQ2N30.Sjec8zFzC8xlLdAoSekkbZG5x93suFMc91CUYY-YRhc'
)

const categories = [
  { id: 'funny', name: 'Divertidos' },
  { id: 'programming', name: 'Programación' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'animals', name: 'Animales' },
  { id: 'random', name: 'Random' }
];

const newsUpdates = [
  {
    id: 1,
    date: '2024-02-15',
    title: '¡Grandes novedades en camino!',
    author: 'Equipo JoyFinder',
    content: 'Estamos trabajando en una nueva versión que incluirá perfiles de usuario y colecciones personalizadas. ¡Mantente atento!',
    tag: 'Actualización'
  },
  {
    id: 2,
    date: '2024-02-10',
    title: 'Modo Oscuro en Desarrollo',
    author: 'Equipo de Diseño',
    content: 'El modo oscuro está casi listo. Hemos estado trabajando en asegurar que la experiencia visual sea perfecta en ambos modos.',
    tag: 'En Desarrollo'
  },
  {
    id: 3,
    date: '2024-02-05',
    title: 'Mejoras en el Rendimiento',
    author: 'Equipo Técnico',
    content: 'Hemos optimizado el rendimiento de la aplicación. Ahora la carga de memes es un 50% más rápida.',
    tag: 'Mejora'
  },
  {
    id: 4,
    date: '2024-02-01',
    title: 'Creador de Memes',
    author: 'Equipo de Producto',
    content: 'Estamos desarrollando un creador de memes integrado que te permitirá crear contenido directamente en la plataforma.',
    tag: 'Próximamente'
  }
];

function App() {
  const [memes, setMemes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [newMemeTitle, setNewMemeTitle] = useState('');
  const [newMemeCategory, setNewMemeCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMemes();
  }, []);

  const loadMemes = async () => {
    try {
      const { data, error } = await supabase
        .from('joy_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar memes:', error);
        return;
      }

      console.log('Memes cargados:', data);
      setMemes(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredMemes = memes.filter(meme => {
    const matchesSearch = meme.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || meme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (filteredMemes.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= filteredMemes.length) {
      setCurrentIndex(filteredMemes.length - 1);
    }
  }, [filteredMemes, currentIndex]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setShowUploadModal(true);
    }
  };

  const handleUploadMeme = () => {
    if (selectedFile && newMemeTitle.trim() && newMemeCategory) {
      const newMeme = {
        id: Date.now(),
        imageUrl: previewUrl,
        title: newMemeTitle,
        category: newMemeCategory,
        likes: 0
      };
      const newMemes = [...memes, newMeme];
      setMemes(newMemes);
      setShowUploadModal(false);
      setNewMemeTitle('');
      setNewMemeCategory('');
      setSelectedFile(null);
      setPreviewUrl('');
      if (selectedCategory === 'all' || selectedCategory === newMemeCategory) {
        setCurrentIndex(newMemes.length - 1);
      }
    }
  };

  const handleLike = async (memeId, currentLikes) => {
    try {
      const newLikes = (currentLikes || 0) + 1
      
      const { error } = await supabase
        .from('joy_images')
        .update({ likes: newLikes })
        .eq('id', memeId)

      if (error) throw error

      // Actualizar el estado local
      setMemes(prevMemes =>
        prevMemes.map(meme =>
          meme.id === memeId
            ? { ...meme, likes: newLikes }
            : meme
        )
      )
    } catch (error) {
      console.error('Error al dar like:', error)
      alert('Error al dar like')
    }
  }

  const handleShare = async (memeId, memeUrl) => {
    try {
      // Intentar usar la Web Share API si está disponible
      if (navigator.share) {
        await navigator.share({
          title: 'Mira este meme',
          text: '¡Échale un vistazo a este meme!',
          url: memeUrl
        })
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(memeUrl)
        alert('¡URL copiada al portapapeles!')
      }

      // Incrementar contador de compartidos
      const { data: meme } = await supabase
        .from('joy_images')
        .select('shares')
        .eq('id', memeId)
        .single()

      const newShares = ((meme?.shares || 0) + 1)

      const { error } = await supabase
        .from('joy_images')
        .update({ shares: newShares })
        .eq('id', memeId)

      if (error) throw error

      // Actualizar estado local
      setMemes(prevMemes =>
        prevMemes.map(meme =>
          meme.id === memeId
            ? { ...meme, shares: newShares }
            : meme
        )
      )
    } catch (error) {
      console.error('Error al compartir:', error)
      alert('Error al compartir el meme')
    }
  }

  const nextMeme = () => {
    if (currentIndex < filteredMemes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previousMeme = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 25 }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const handleUploadClick = () => {
    if (!selectedCategory) {
      alert('Por favor, selecciona una categoría');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // 1. Subir archivo a Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `meme_${Date.now()}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from('joy-images')
        .upload(fileName, file);

      if (storageError) throw storageError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('joy-images')
        .getPublicUrl(fileName);

      // 3. Guardar en la tabla joy_images
      const { error: dbError } = await supabase
        .from('joy_images')
        .insert([
          {
            url: publicUrl,
            name: fileName,
            category: selectedCategory,
            likes: 0,
            shares: 0,
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      // 4. Recargar memes
      await loadMemes();

    } catch (error) {
      console.error('Error al subir:', error);
      alert('Error al subir el meme: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="app">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />

      <button
        className="upload-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Subiendo...' : 'Subir Meme'}
      </button>

      <div className="meme-grid">
        {filteredMemes.map(meme => (
          <div key={meme.id} className="meme-card">
            <div className="meme-image-container">
              <img src={meme.url} alt={meme.name} />
              <h3>{meme.name.split('_')[1]?.split('.')[0] || 'Meme'}</h3>
            </div>
            <div className="meme-footer">
              <div className="meme-stats">
                <button 
                  className="like-button"
                  onClick={() => handleLike(meme.id, meme.likes)}
                >
                  ❤️ {meme.likes || 0}
                </button>
                <button 
                  className="share-button"
                  onClick={() => handleShare(meme.id, meme.url)}
                >
                  ↗️ {meme.shares || 0}
                </button>
              </div>
              <span className="category">{meme.category}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .app {
          background: #1a1f2e;
          min-height: 100vh;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .meme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }

        .meme-card {
          background: #2a2f3e;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }

        .meme-card:hover {
          transform: translateY(-5px);
        }

        .meme-image-container {
          position: relative;
          width: 100%;
          background: #000;
        }

        .meme-image-container img {
          width: 100%;
          height: auto;
          display: block;
          max-height: 600px;
          object-fit: contain;
        }

        .meme-image-container h3 {
          position: absolute;
          top: 10px;
          left: 10px;
          margin: 0;
          color: white;
          font-size: 1.2em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          background: rgba(0,0,0,0.5);
          padding: 5px 10px;
          border-radius: 4px;
        }

        .meme-footer {
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .meme-stats {
          display: flex;
          gap: 15px;
        }

        .category {
          color: #4a90e2;
          font-size: 0.9em;
          padding: 4px 8px;
          background: rgba(74,144,226,0.1);
          border-radius: 4px;
        }

        .like-button, .share-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 5px 10px;
          font-size: 1em;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
          border-radius: 4px;
        }

        .like-button:hover, .share-button:hover {
          background: rgba(255,255,255,0.1);
        }

        .upload-button {
          background: #4a90e2;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1em;
          transition: background 0.3s;
          font-weight: 500;
        }

        .upload-button:hover {
          background: #357abd;
        }

        .upload-button:disabled {
          background: #666;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .meme-grid {
            grid-template-columns: 1fr;
          }

          .app {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;