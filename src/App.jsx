import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, FaShare, FaHome, FaSearch, 
  FaHandsHelping, FaUpload, FaTimes, FaFolder, FaInfoCircle, FaShieldAlt,
  FaBullhorn, FaTwitter, FaInstagram, FaGithub, FaDiscord, FaBars
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

  // Estados para menú y búsqueda móvil
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

  // Eliminamos la validación previa para seleccionar categoría al pulsar el botón de subir
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;
      // Se pueden quitar los prompts si se quiere definir estos datos en el modal
      const description = prompt('Introduce una descripción para el meme:') || 'Sin descripción';
      const category = prompt('Categoría (Divertidos, Programación, Gaming, Animales, Random):') || 'Random';
      const fileExt = file.name.split('.').pop();
      const fileName = `meme_${Date.now()}.${fileExt}`;
      const { error: storageError } = await supabase.storage
        .from('joy-images')
        .upload(fileName, file);
      if (storageError) throw storageError;
      const { data: { publicUrl } } = supabase.storage
        .from('joy-images')
        .getPublicUrl(fileName);
      const { error: dbError } = await supabase
        .from('joy_images')
        .insert([{ url: publicUrl, name: fileName, category: category, description: description, likes: 0 }]);
      if (dbError) throw dbError;
      await loadMemes();
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
      {/* ... (resto del código de navegación y diseño general se mantiene igual) ... */}

      {/* MODAL DE SUBIDA CON DISEÑO MEJORADO */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Título del meme</label>
                <input
                  type="text"
                  placeholder="Escribe el título aquí"
                  value={newMemeTitle}
                  onChange={(e) => setNewMemeTitle(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Categoría</label>
                <select
                  value={newMemeCategory}
                  onChange={(e) => setNewMemeCategory(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
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

      {/* ... (resto del código, modales y contenido principal) ... */}

      <TestUpload />

    </motion.div>
  );
}

export default App;




