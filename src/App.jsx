import React, { useState } from 'react'

const memes = [
  {
    id: 1,
<<<<<<< HEAD
    imageUrl: 'https://picsum.photos/800/600?random=1',
    title: 'Random Image 1',
    category: 'random',
    likes: 42
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/800/600?random=2',
    title: 'Random Image 2',
    category: 'random',
    likes: 28
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/800/600?random=3',
    title: 'Random Image 3',
    category: 'random',
    likes: 35
=======
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
>>>>>>> c0b236e159522ae4d5dff579c3cf4b6bc0aaa15d
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
<<<<<<< HEAD
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-100"
    >
      <nav className="bg-black shadow-lg fixed w-full z-10">
        <motion.div 
          className="max-w-6xl mx-auto px-4 py-3"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
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
            </motion.div>

            <motion.div 
              className="flex items-center space-x-6"
              variants={itemVariants}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-blue-400 transition-colors"
                onClick={() => setShowNewsModal(true)}
              >
                <FaBullhorn className="text-xl" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-blue-400 transition-colors"
                onClick={() => setShowCollaborateModal(true)}
              >
                <FaHandsHelping className="text-xl" />
              </motion.button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                onClick={() => fileInputRef.current.click()}
              >
                <FaUpload />
                <span>Subir Meme</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-blue-400 transition-colors"
                onClick={() => setShowAboutModal(true)}
              >
                <FaInfoCircle className="text-xl" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        <div className="border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex space-x-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`py-3 flex items-center space-x-2 ${
                  selectedCategory === 'all'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => handleCategoryChange('all')}
              >
                <FaFolder />
                <span>Todos</span>
              </motion.button>
              {categories.map(category => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`py-3 flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <FaFolder />
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </nav>

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
              <h3 className="text-xl font-bold text-white">Subir nuevo meme</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            {previewUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={previewUrl} 
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
                disabled={!newMemeTitle.trim() || !selectedFile || !newMemeCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                Publicar
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
                  Created by GERARDEU
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
          </motion.div>
        </div>
      )}

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
          </motion.div>
        </div>
      )}

      {showCollaborateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4"
          >
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
          </motion.div>
        </div>
      )}

      <div className="pt-16 min-h-screen bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={itemVariants}
          >
            <AnimatePresence mode="wait">
              {filteredMemes.map(meme => (
                <motion.div
                  key={meme.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ 
                    y: -5, 
                    transition: { duration: 0.2 }
                  }}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg"
                >
                  <motion.div className="relative">
                    <motion.img
                      src={meme.imageUrl}
                      alt={meme.title}
                      className="w-full h-48 object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="text-white text-lg font-semibold">{meme.title}</h3>
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-between items-center">
                      <motion.span 
                        className="text-blue-400 text-sm"
                        whileHover={{ scale: 1.1 }}
                      >
                        {meme.category}
                      </motion.span>
                      <motion.div 
                        className="flex items-center space-x-4"
                        variants={itemVariants}
                      >
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleLike(meme.id)}
                        >
                          <FaHeart />
                          <span className="ml-1">{meme.likes}</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-blue-400 hover:text-blue-500"
                          onClick={() => handleShare(meme.imageUrl)}
                        >
                          <FaShare />
                        </motion.button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
=======
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '20px' }}>Meme Viewer</h1>
      
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
        <h2 style={{ marginBottom: '10px' }}>{currentMeme.title}</h2>
        <img 
          src={currentMeme.url} 
          alt={currentMeme.title}
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
        />
>>>>>>> c0b236e159522ae4d5dff579c3cf4b6bc0aaa15d
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
