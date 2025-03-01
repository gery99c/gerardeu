import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, FaShare, FaHome, FaSearch, FaHandsHelping, FaUpload, FaTimes, FaFolder, FaInfoCircle, FaShieldAlt,
  FaBullhorn, FaTwitter, FaInstagram, FaGithub, FaDiscord
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: '¡Hola! Soy JoyBot 😄 ¿Quieres que te cuente un chiste?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  // Estado para el buscador móvil
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
        prevMemes.map(meme =>
          meme.id === memeId ? { ...meme, shares: newShares } : meme
        )
      );
    } catch (error) {
      console.error('Error al compartir:', error);
      alert('Error al compartir el meme');
    }
  };

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
      transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 }
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
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } }
  };

  const handleUploadClick = () => {
    if (!newMemeCategory) {
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

      const description = prompt('Introduce una descripción para el meme:') || 'Sin descripción';
      const category = 'Random'; // Establecer una categoría predeterminada

      const fileExt = file.name.split('.').pop();
      const fileName = `meme_${Date.now()}.${fileExt}`;

      // Subir el archivo a Supabase
      const { error: storageError } = await supabase.storage
        .from('joy-images')
        .upload(fileName, file);

      if (storageError) throw storageError;

      // Obtener la URL pública del archivo subido
      const { data: { publicUrl } } = supabase.storage
        .from('joy-images')
        .getPublicUrl(fileName);

      // Insertar el meme en la base de datos
      const { error: dbError } = await supabase
        .from('joy_images')
        .insert([{
          url: publicUrl,
          name: fileName,
          category: category, // Usar la categoría predeterminada
          description: description,
          likes: 0
        }]);

      if (dbError) throw dbError;

      await loadMemes(); // Asegúrate de que esta función esté definida y funcione correctamente
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir el meme: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Función para auto-scroll del chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: inputMessage }]);
    const userMessage = inputMessage;
    setInputMessage('');
    setTimeout(() => {
      let botResponse = "¡Jaja! Muy bueno. ¿Quieres escuchar otro chiste?";
      if (userMessage.toLowerCase().includes('sí') || userMessage.toLowerCase().includes('si')) {
        const jokes = [
          "¿Qué le dice un .gif a un .jpg? ¡Animate!",
          "¿Por qué los programadores prefieren el frío? Porque tienen muchos bugs",
          "¿Qué le dice un bit al otro? Nos vemos en el bus",
          "¿Por qué el programador se quedó colgado? Porque perdió el control",
        ];
        botResponse = jokes[Math.floor(Math.random() * jokes.length)];
      }
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen bg-gray-100">
      
      {/* CABECERA MÓVIL */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 backdrop-blur-md shadow-xl z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <FaHome className="text-white text-2xl mr-2" />
            <h1 className="text-2xl font-bold text-white">JoyFinder</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowMobileSearch(true)} className="text-white">
              <FaSearch />
            </button>
            <button onClick={handleUploadClick} className="text-white">
              <FaUpload />
            </button>
            <button onClick={() => setShowNewsModal(true)} className="text-white">
              <FaBullhorn />
            </button>
            <button onClick={() => setShowAboutModal(true)} className="text-white">
              <FaInfoCircle />
            </button>
            <button onClick={() => setShowPrivacyModal(true)} className="text-white">
              <FaShieldAlt />
            </button>
          </div>
        </div>
        {/* Menú de categorías (segunda fila) */}
        <div className="px-4 py-2 bg-black/50">
          <nav className="flex space-x-4 overflow-x-auto">
            <button onClick={() => handleCategoryChange('all')} className={`text-white ${selectedCategory==='all'?'border-b-2 border-blue-400':''}`}>
              Todos
            </button>
            {categories.map(category => (
              <button key={category.id} onClick={() => handleCategoryChange(category.id)} className={`text-white ${selectedCategory===category.id?'border-b-2 border-blue-400':''}`}>
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* BUSCADOR MÓVIL */}
      {showMobileSearch && (
        <div className="fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-md p-4 z-20">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Buscar memes..."
              className="w-full bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setShowMobileSearch(false)} className="text-white ml-2">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* MENÚ DE ESCRITORIO */}
      <nav className="hidden md:block bg-black shadow-lg fixed w-full z-10">
        <motion.div className="max-w-6xl mx-auto px-4 py-3" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <button className="text-white text-2xl mr-2">
                  <FaHome />
                </button>
                <h1 className="text-2xl font-bold text-white">JoyFinder</h1>
              </div>
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
            <div className="flex items-center space-x-6">
              <button className="text-white hover:text-blue-400 transition-colors" onClick={() => setShowNewsModal(true)}>
                <FaBullhorn className="text-xl" />
              </button>
              <button className="text-white hover:text-blue-400 transition-colors" onClick={() => setShowCollaborateModal(true)}>
                <FaHandsHelping className="text-xl" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition" onClick={handleUploadClick}>
                <span className="upload-icon">{uploading ? '📤' : '⬆️'}</span>
                <span className="upload-text">{uploading ? 'Subiendo...' : 'Subir Meme'}</span>
              </button>
              <button className="text-white hover:text-blue-400 transition-colors" onClick={() => setShowAboutModal(true)}>
                <FaInfoCircle className="text-xl" />
              </button>
            </div>
          </div>
        </motion.div>
        <div className="border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex space-x-8">
              <button
                className={`py-3 flex items-center space-x-2 ${selectedCategory === 'all' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => handleCategoryChange('all')}
              >
                <FaFolder />
                <span>Todos</span>
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`py-3 flex items-center space-x-2 ${selectedCategory === category.id ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <FaFolder />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* MODALES */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial="hidden" animate="visible" exit="exit" variants={modalVariants} className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Subir nuevo meme</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            {previewUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full object-contain max-h-64" />
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
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                Cancelar
              </button>
              <button onClick={handleUploadMeme} disabled={!newMemeTitle.trim() || !selectedFile || !newMemeCategory} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50">
                Publicar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial="hidden" animate="visible" exit="exit" variants={modalVariants} className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Sobre JoyFinder</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="text-white">
              <p className="mb-4">
                JoyFinder es una plataforma dedicada a compartir y disfrutar de memes con humor blanco. Nuestro objetivo es crear un espacio divertido y respetuoso donde todos puedan reír sin ofender a nadie.
              </p>
              <p className="mb-4">
                Aquí podrás encontrar y compartir memes de diferentes categorías, siempre manteniendo un ambiente positivo y familiar.
              </p>
              <div className="flex flex-col items-center gap-4 mt-8">
                <button onClick={() => { setShowAboutModal(false); setShowPrivacyModal(true); }} className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                  <FaShieldAlt />
                  <span>Política de Privacidad</span>
                </button>
                <div className="text-gray-400">Created by GERARDEU</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial="hidden" animate="visible" exit="exit" variants={modalVariants} className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Política de Privacidad</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="text-white space-y-4">
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
                <p>Si tienes preguntas sobre nuestra política de privacidad, puedes contactar con nosotros a través de los canales oficiales de JoyFinder.</p>
              </section>
              <div className="text-sm text-gray-400 mt-8">Última actualización: {new Date().toLocaleDateString()}</div>
            </div>
          </motion.div>
        </div>
      )}

      {showNewsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial="hidden" animate="visible" exit="exit" variants={modalVariants} className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Novedades de la Comunidad</h3>
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

      {showCollaborateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial="hidden" animate="visible" exit="exit" variants={modalVariants} className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Colabora con Nosotros</h3>
              <button onClick={() => setShowCollaborateModal(false)} className="text-gray-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="text-white space-y-6">
              <p>¡Únete a nuestra comunidad y ayúdanos a hacer de JoyFinder un lugar aún mejor! Puedes encontrarnos en:</p>
              <div className="space-y-4">
                <a href="https://twitter.com/joyfinder" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors">
                  <FaTwitter className="text-2xl" />
                  <span>Twitter</span>
                </a>
                <a href="https://instagram.com/joyfinder" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-pink-400 transition-colors">
                  <FaInstagram className="text-2xl" />
                  <span>Instagram</span>
                </a>
                <a href="https://github.com/joyfinder" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                  <FaGithub className="text-2xl" />
                  <span>GitHub</span>
                </a>
                <a href="https://discord.gg/joyfinder" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors">
                  <FaDiscord className="text-2xl" />
                  <span>Discord</span>
                </a>
              </div>
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h4 className="font-semibold mb-2">¿Quieres colaborar?</h4>
                <p className="text-sm text-gray-300">
                  Si tienes ideas para mejorar JoyFinder o quieres contribuir al desarrollo, únete a nuestro servidor de Discord o contáctanos a través de nuestras redes sociales.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="pt-20 min-h-screen bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={itemVariants}>
            <AnimatePresence mode="wait">
              {filteredMemes.map(meme => (
                <motion.div
                  key={meme.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="relative">
                    <motion.img
                      src={meme.url}
                      alt={meme.description || 'Meme'}
                      className="w-full object-contain h-auto max-h-[calc(100vh-150px)] sm:max-h-80"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-white text-lg font-semibold">{meme.description || 'Sin descripción'}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 text-sm">{meme.category}</span>
                      <div className="flex items-center space-x-4">
                        <button className="text-red-500 hover:text-red-600" onClick={() => handleLike(meme.id, meme.likes)}>
                          <FaHeart />
                          <span className="ml-1">{meme.likes || 0}</span>
                        </button>
                        <button className="text-blue-400 hover:text-blue-500" onClick={() => handleShare(meme.id, meme.url)}>
                          <FaShare />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <TestUpload />

      <style>{`
        .app {
          background: #1a1f2e;
          min-height: 100vh;
          padding: 20px;
        }
        .meme-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .meme-card {
          width: 100%;
          background: #2a2f3e;
          border-radius: 10px;
          overflow: hidden;
        }
        .meme-image-container {
          width: 1200px;
          margin: 0 auto;
        }
        .meme-image-container img {
          width: 1200px;
          height: auto;
          display: block;
        }
        .like-button, .share-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 5px 10px;
          font-size: 1.1em;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: transform 0.1s;
        }
        .like-button:hover, .share-button:hover {
          transform: scale(1.1);
        }
        .like-button:active, .share-button:active {
          transform: scale(0.95);
        }
        @media (max-width: 850px) {
          .meme-grid {
            max-width: 100%;
          }
          .meme-image-container,
          .meme-image-container img {
            width: 100%;
          }
        }
        .nav-menu {
          display: flex;
          background: #1a1f2e;
          width: 100%;
          padding: 15px 5px;
          overflow-x: scroll !important;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          position: relative;
          touch-action: pan-x;
          -webkit-user-select: none;
          user-select: none;
          cursor: grab;
        }
        .nav-menu:active {
          cursor: grabbing;
        }
        .nav-link {
          color: #4a90e2;
          text-decoration: none;
          padding: 0 15px;
          white-space: nowrap;
          font-size: 14px;
          flex: 0 0 auto;
          display: inline-block;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-menu::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        @media (max-width: 768px) {
          .nav-menu {
            overflow-x: scroll !important;
            -webkit-overflow-scrolling: touch !important;
            scroll-behavior: smooth;
            -ms-overflow-style: none;
            scrollbar-width: none;
            flex-wrap: nowrap;
            padding: 15px 5px;
            gap: 0;
          }
          .nav-link {
            padding: 0 10px;
            font-size: 14px;
            pointer-events: auto;
          }
        }
      `}</style>
    </motion.div>
  );
}

export default App;









