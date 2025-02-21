import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShare, FaArrowUp, FaArrowDown, FaHome, FaSearch, 
         FaHandsHelping, FaUpload, FaTimes, FaFolder, FaInfoCircle, FaShieldAlt,
         FaBullhorn, FaTwitter, FaInstagram, FaGithub, FaDiscord } from 'react-icons/fa';
import { supabase } from './lib/supabase';

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
    title: "¡Bienvenidos a JoyFinder!",
    author: "Equipo JoyFinder",
    date: "2025-02-19",
    tag: "Actualización",
    content: "Lanzamos oficialmente JoyFinder, tu nueva plataforma para compartir y disfrutar de memes."
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMemes();
  }, [selectedCategory, searchTerm]);

  async function fetchMemes() {
    try {
      let query = supabase.from('memes').select('*').order('created_at', { ascending: false });
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setMemes(data || []);
    } catch (error) {
      console.error('Error fetching memes:', error);
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setShowUploadModal(true);
    }
  };

  const handleUploadMeme = async () => {
    if (!selectedFile || !newMemeTitle.trim() || !newMemeCategory) return;

    try {
      setUploading(true);

      // Upload image to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('memes')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('memes')
        .getPublicUrl(filePath);

      // Create meme record in the database
      const { error: insertError } = await supabase
        .from('memes')
        .insert([
          {
            title: newMemeTitle,
            image_url: publicUrl,
            category: newMemeCategory,
            likes: 0
          }
        ]);

      if (insertError) throw insertError;

      // Reset form and fetch updated memes
      setShowUploadModal(false);
      setNewMemeTitle('');
      setNewMemeCategory('');
      setSelectedFile(null);
      await fetchMemes();
      
    } catch (error) {
      console.error('Error uploading meme:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const meme = memes.find(m => m.id === id);
      const { error } = await supabase
        .from('memes')
        .update({ likes: (meme.likes || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
      await fetchMemes();
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const filteredMemes = memes;

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

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-black shadow-lg fixed w-full z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <button className="text-white text-2xl mr-2">
                  <FaHome />
                </button>
                <h1 className="text-2xl font-bold text-white">JoyFinder</h1>
              </div>
              
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar memes..."
                    className="w-96 bg-gray-800 text-white rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowNewsModal(true)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <FaBullhorn className="text-xl" />
              </button>
              <button 
                onClick={() => setShowCollaborateModal(true)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <FaHandsHelping className="text-xl" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                <FaUpload />
                <span>Subir Meme</span>
              </button>
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <FaInfoCircle className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`py-3 flex items-center space-x-2 ${
                  selectedCategory === 'all'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaFolder />
                <span>Todos</span>
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`py-3 flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FaFolder />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Subir nuevo meme</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            {selectedFile && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  className="w-full object-contain max-h-64"
                />
              </div>
            )}
            
            <input
              type="text"
              placeholder="Título del meme"
              value={newMemeTitle}
              onChange={(e) => setNewMemeTitle(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mb-4"
            />

            <select
              value={newMemeCategory}
              onChange={(e) => setNewMemeCategory(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mb-4"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadMeme}
                disabled={!newMemeTitle.trim() || !selectedFile || !newMemeCategory || uploading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {uploading ? 'Subiendo...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Sobre JoyFinder</h3>
              <button 
                onClick={() => setShowAboutModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="text-white">
              <p className="mb-4">
                JoyFinder es una plataforma dedicada a compartir y disfrutar de memes con humor blanco. 
                Nuestro objetivo es crear un espacio divertido y respetuoso donde todos puedan reír sin 
                ofender a nadie.
              </p>
              <p className="mb-4">
                Aquí podrás encontrar y compartir memes de diferentes categorías, siempre manteniendo 
                un ambiente positivo y familiar.
              </p>
              <div className="flex flex-col items-center gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowAboutModal(false);
                    setShowPrivacyModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                >
                  <FaShieldAlt />
                  <span>Política de Privacidad</span>
                </button>
                <div className="text-gray-400">
                  Created by GERDEU
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Política de Privacidad</h3>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="text-white space-y-4">
              <section>
                <h4 className="text-lg font-semibold mb-2">1. Información que Recopilamos</h4>
                <p>
                  En JoyFinder, solo almacenamos la siguiente información:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Los memes que subes, incluyendo títulos y categorías</li>
                  <li>Los "me gusta" que das a los memes</li>
                  <li>Datos almacenados localmente en tu navegador</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold mb-2">2. Uso de la Información</h4>
                <p>
                  Utilizamos esta información únicamente para:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Mostrar los memes en la plataforma</li>
                  <li>Mantener un registro de los "me gusta"</li>
                  <li>Mejorar la experiencia del usuario</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold mb-2">3. Almacenamiento Local</h4>
                <p>
                  JoyFinder utiliza el almacenamiento local del navegador para guardar:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Tus memes subidos</li>
                  <li>Preferencias de usuario</li>
                  <li>Datos de la sesión actual</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold mb-2">4. Compartir Contenido</h4>
                <p>
                  Al subir contenido a JoyFinder:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Confirmas que tienes derecho a compartir ese contenido</li>
                  <li>Entiendes que será visible para otros usuarios</li>
                  <li>Aceptas que el contenido debe ser apropiado y respetar nuestras normas de humor blanco</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold mb-2">5. Seguridad</h4>
                <p>
                  Nos comprometemos a:
                </p>
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
          </div>
        </div>
      )}

      {showNewsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Novedades de la Comunidad</h3>
                <p className="text-gray-400 text-sm">Mantente al día con las últimas actualizaciones</p>
              </div>
              <button 
                onClick={() => setShowNewsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-6">
              {newsUpdates.map((update) => (
                <div key={update.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{update.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <span>{update.author}</span>
                        <span>•</span>
                        <span>{formatDate(update.date)}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      update.tag === 'Actualización' ? 'bg-blue-500/20 text-blue-400' :
                      update.tag === 'En Desarrollo' ? 'bg-yellow-500/20 text-yellow-400' :
                      update.tag === 'Mejora' ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {update.tag}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {update.content}
                  </p>
                  
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
          </div>
        </div>
      )}

      {showCollaborateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Colabora con Nosotros</h3>
              <button 
                onClick={() => setShowCollaborateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="text-white space-y-6">
              <p>
                ¡Únete a nuestra comunidad y ayúdanos a hacer de JoyFinder un lugar aún mejor! 
                Puedes encontrarnos en:
              </p>

              <div className="space-y-4">
                <a 
                  href="https://twitter.com/joyfinder" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <FaTwitter className="text-2xl" />
                  <span>Twitter</span>
                </a>
                
                <a 
                  href="https://instagram.com/joyfinder" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-pink-400 transition-colors"
                >
                  <FaInstagram className="text-2xl" />
                  <span>Instagram</span>
                </a>
                
                <a 
                  href="https://github.com/joyfinder" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <FaGithub className="text-2xl" />
                  <span>GitHub</span>
                </a>
                
                <a 
                  href="https://discord.gg/joyfinder" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <FaDiscord className="text-2xl" />
                  <span>Discord</span>
                </a>
              </div>

              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">¿Quieres colaborar?</h4>
                <p className="text-sm text-gray-300">
                  Si tienes ideas para mejorar JoyFinder o quieres contribuir al desarrollo, 
                  únete a nuestro servidor de Discord o contáctanos a través de cualquiera 
                  de nuestras redes sociales.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-28 flex items-center justify-center">
        {filteredMemes.length > 0 ? (
          <div className="max-w-md w-full">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-[9/16] shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <img 
                    src={filteredMemes[currentIndex]?.image_url}
                    alt={filteredMemes[currentIndex]?.title}
                    className="w-full h-full object-contain"
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h2 className="text-white text-lg font-semibold mb-2">
                      {filteredMemes[currentIndex]?.title}
                    </h2>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleLike(filteredMemes[currentIndex]?.id)}
                          className="text-white flex items-center gap-2"
                        >
                          <FaHeart className="text-2xl hover:text-red-500 transition-colors" />
                          <span>{filteredMemes[currentIndex]?.likes}</span>
                        </button>
                        <button className="text-white">
                          <FaShare className="text-2xl hover:text-green-400 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button 
                onClick={previousMeme}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 disabled:opacity-50"
              >
                <FaArrowUp className="text-2xl" />
              </button>
              
              <button 
                onClick={nextMeme}
                disabled={currentIndex === filteredMemes.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 disabled:opacity-50"
              >
                <FaArrowDown className="text-2xl" />
              </button>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {filteredMemes.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 w-8 rounded-full ${
                    idx === currentIndex ? 'bg-white' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-2">No hay memes</h2>
            <p className="text-lg">No se encontraron memes para esta categoría o búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;