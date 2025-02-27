import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart, FaShare, FaHome, FaSearch,
  FaBullhorn, FaInfoCircle, FaShieldAlt,
  FaFolder, FaTimes
} from 'react-icons/fa';
import TestUpload from './components/TestUpload';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ybytyrxlktjmbqxunrhw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieXR5cnhsa3RqbWJxeHVucmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY0NjcsImV4cCI6MjA1NTUzMjQ2N30.Sjec8zFzC8xlLdAoSekkbZG5x93suFMc91CUYY-YRhc'
);

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
  const [memes, setMemes] = useState([]);
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

  // Carga inicial de memes
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
      setMemes(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredMemes = memes.filter(meme => {
    const matchesSearch = meme.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
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

  // Subida de imagenes: ahora se permite seleccionar el archivo sin validar la categoría
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
        url: previewUrl,
        name: newMemeTitle,
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

  // Ahora el botón de subir imagen no exige categoría previa
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Like
  const handleLike = async (memeId, currentLikes) => {
    try {
      const newLikes = (currentLikes || 0) + 1;
      const { error } = await supabase
        .from('joy_images')
        .update({ likes: newLikes })
        .eq('id', memeId);
      if (error) throw error;
      setMemes(prevMemes =>
        prevMemes.map(meme =>
          meme.id === memeId ? { ...meme, likes: newLikes } : meme
        )
      );
    } catch (error) {
      console.error('Error al dar like:', error);
      alert('Error al dar like');
    }
  };

  // Share
  const handleShare = async (memeId, memeUrl) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mira este meme',
          text: '¡Échale un vistazo a este meme!',
          url: memeUrl
        });
      } else {
        await navigator.clipboard.writeText(memeUrl);
        alert('¡URL copiada al portapapeles!');
      }
      const { data: meme } = await supabase
        .from('joy_images')
        .select('shares')
        .eq('id', memeId)
        .single();
      const newShares = ((meme?.shares || 0) + 1);
      const { error } = await supabase
        .from('joy_images')
        .update({ shares: newShares })
        .eq('id', memeId);
      if (error) throw error;
      setMemes(prevMemes =>
        prevMemes.map(m => m.id === memeId ? { ...m, shares: newShares } : m)
      );
    } catch (error) {
      console.error('Error al compartir:', error);
      alert('Error al compartir el meme');
    }
  };

  // Cambio de categoría
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 500, damping: 25 }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar móvil: muestra buscador y botones para Novedades, Info y Privacidad */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black shadow-lg z-10">
        <div className="flex flex-col px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaHome className="text-2xl" />
              <h1 className="text-2xl font-bold">JoyFinder</h1>
            </div>
            <button onClick={handleUploadClick} className="bg-blue-600 px-3 py-1 rounded-full">
              Subir Meme
            </button>
          </div>
          <div className="mt-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar memes..."
                className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-800 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-2 flex justify-around">
            <button onClick={() => setShowNewsModal(true)} className="flex flex-col items-center">
              <FaBullhorn className="text-xl hover:text-blue-400 transition-colors" />
              <span className="text-xs">Novedades</span>
            </button>
            <button onClick={() => setShowAboutModal(true)} className="flex flex-col items-center">
              <FaInfoCircle className="text-xl hover:text-blue-400 transition-colors" />
              <span className="text-xs">Info</span>
            </button>
            <button onClick={() => setShowPrivacyModal(true)} className="flex flex-col items-center">
              <FaShieldAlt className="text-xl hover:text-blue-400 transition-colors" />
              <span className="text-xs">Privacidad</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navbar escritorio */}
      <nav className="hidden md:block bg-black shadow-lg fixed w-full z-10">
        <motion.div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaHome className="text-2xl mr-2" />
                <h1 className="text-2xl font-bold">JoyFinder</h1>
              </div>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar memes..."
                  className="w-96 bg-gray-800 text-white rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => setShowNewsModal(true)}>
                <FaBullhorn className="text-xl hover:text-blue-400 transition-colors" />
              </button>
              <button onClick={() => setShowAboutModal(true)}>
                <FaInfoCircle className="text-xl hover:text-blue-400 transition-colors" />
              </button>
              <button onClick={() => setShowPrivacyModal(true)}>
                <FaShieldAlt className="text-xl hover:text-blue-400 transition-colors" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                className="bg-blue-600 px-3 py-1 rounded-full hover:bg-blue-500 transition"
                onClick={handleUploadClick}
              >
                Subir Meme
              </button>
            </div>
          </div>
        </motion.div>
        <div className="border-t border-gray-700">
          <div className="flex overflow-x-auto px-4 py-2 space-x-4">
            <button
              className={`whitespace-nowrap px-3 py-1 rounded ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleCategoryChange('all')}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`whitespace-nowrap px-3 py-1 rounded ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="pt-28 pb-8 px-4 max-w-6xl mx-auto">
        <AnimatePresence mode="sync">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemes.map((meme) => (
              <motion.div
                key={meme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative">
                  <motion.img
                    src={meme.url}
                    alt={meme.name || 'Meme'}
                    className="w-full object-contain h-auto max-h-[calc(100vh-200px)] sm:max-h-80 bg-black"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-lg font-semibold">
                      {meme.name || 'Sin descripción'}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 text-sm">
                      {meme.category || 'Random'}
                    </span>
                    <div className="flex items-center space-x-4">
                      <button
                        className="text-red-500 hover:text-red-600 flex items-center"
                        onClick={() => handleLike(meme.id, meme.likes)}
                      >
                        <FaHeart />
                        <span className="ml-1">{meme.likes || 0}</span>
                      </button>
                      <button
                        className="text-blue-400 hover:text-blue-500"
                        onClick={() => handleShare(meme.id, meme.url)}
                      >
                        <FaShare />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>

      <TestUpload />

      {/* Modal: Subir Meme */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Subir nuevo meme</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            {previewUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full object-contain max-h-64 bg-black" />
              </div>
            )}
            <input
              type="text"
              placeholder="Título del meme"
              value={newMemeTitle}
              onChange={(e) => setNewMemeTitle(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-4"
            />
            <select
              value={newMemeCategory}
              onChange={(e) => setNewMemeCategory(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-4"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                Cancelar
              </button>
              <button
                onClick={handleUploadMeme}
                disabled={!newMemeTitle.trim() || !selectedFile || !newMemeCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                Publicar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Sobre JoyFinder */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Sobre JoyFinder</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div>
              <p className="mb-4">
                JoyFinder es una plataforma dedicada a compartir y disfrutar de memes con humor blanco.
                Nuestro objetivo es crear un espacio divertido y respetuoso donde todos puedan reír sin ofender.
              </p>
              <p className="mb-4">
                Aquí encontrarás memes de diversas categorías, manteniendo un ambiente positivo y familiar.
              </p>
              <div className="flex flex-col items-center gap-4 mt-8">
                <button
                  onClick={() => { setShowAboutModal(false); setShowPrivacyModal(true); }}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                >
                  <FaShieldAlt />
                  <span>Política de Privacidad</span>
                </button>
                <div className="text-gray-400">Created by GERARDEU</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Política de Privacidad */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Política de Privacidad</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <section>
                <h4 className="text-lg font-semibold mb-2">1. Información que Recopilamos</h4>
                <p>En JoyFinder, solo almacenamos la siguiente información:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Los memes que subes, incluyendo títulos y categorías</li>
                  <li>Los "me gusta" que das a los memes</li>
                  <li>Datos almacenados localmente en tu navegador</li>
                </ul>
              </section>
              <section>
                <h4 className="text-lg font-semibold mb-2">2. Uso de la Información</h4>
                <p>Utilizamos esta información únicamente para:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Mostrar los memes en la plataforma</li>
                  <li>Mantener un registro de los "me gusta"</li>
                  <li>Mejorar la experiencia del usuario</li>
                </ul>
              </section>
              <section>
                <h4 className="text-lg font-semibold mb-2">3. Almacenamiento Local</h4>
                <p>JoyFinder utiliza el almacenamiento local del navegador para guardar:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Tus memes subidos</li>
                  <li>Preferencias de usuario</li>
                  <li>Datos de la sesión actual</li>
                </ul>
              </section>
              <section>
                <h4 className="text-lg font-semibold mb-2">4. Compartir Contenido</h4>
                <p>Al subir contenido a JoyFinder:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Confirmas que tienes derecho a compartir ese contenido</li>
                  <li>Entiendes que será visible para otros usuarios</li>
                  <li>Aceptas que el contenido debe ser apropiado y respetar nuestras normas de humor blanco</li>
                </ul>
              </section>
              <section>
                <h4 className="text-lg font-semibold mb-2">5. Seguridad</h4>
                <p>Nos comprometemos a:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Mantener tu información segura</li>
                  <li>No compartir datos con terceros</li>
                  <li>Usar el almacenamiento local de forma responsable</li>
                </ul>
              </section>
              <section>
                <h4 className="text-lg font-semibold mb-2">6. Contacto</h4>
                <p>
                  Si tienes preguntas sobre nuestra política de privacidad, puedes contactar con nosotros a través de los canales oficiales de JoyFinder.
                </p>
              </section>
              <div className="text-sm text-gray-400 mt-8">
                Última actualización: {new Date().toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Novedades */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold">Novedades de la Comunidad</h3>
                <p className="text-gray-400 text-sm">Mantente al día con las últimas actualizaciones</p>
              </div>
              <button onClick={() => setShowNewsModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-6">
              {newsUpdates.map((update) => (
                <div key={update.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold">{update.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <span>{update.author}</span>
                        <span>•</span>
                        <span>{formatDate(update.date)}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        update.tag === 'Actualización'
                          ? 'bg-blue-500/20 text-blue-400'
                          : update.tag === 'En Desarrollo'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : update.tag === 'Mejora'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {update.tag}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{update.content}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <button className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                      <FaHeart />
                      <span>Me gusta</span>
                    </button>
                    <button className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center gap-2">
                      <FaShare />
                      <span>Compartir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default App;





