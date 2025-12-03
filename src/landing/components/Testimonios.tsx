import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonios = [
  {
    nombre: 'Felipe González',
    texto:
      'Muy buen servicio de asesoramiento, el técnico fue muy acertado en el diagnóstico y el encargado amable en su trato. Obtuve un descuento en mano de obra por la compra de repuesto.',
    cargo: 'Cliente',
  },
  {
    nombre: 'Moises Ocampo',
    texto: 'Excelente taller, personal capacitado, muy profesional.',
    cargo: 'Cliente',
  },
  {
    nombre: 'Octavio Alberto Morales Mendoza',
    texto:
      'Excelente atención. El servicio mecánico y mantenimiento es muy superior incluso al que me ofrecieron en el taller de la empresa donde obtuve mi motocicleta.',
    cargo: 'Cliente',
  },
  {
    nombre: 'Benjamin',
    texto: 'Excelente servicio, rápido, confiables y buen trato.',
    cargo: 'Cliente',
  },
  {
    nombre: 'Juan Pérez',
    texto:
      'Para revisión de motos, un buen lugar. Siempre que vengan pregunten por el propietario, les atenderá con gusto.',
    cargo: 'Cliente',
  },
];

// Función para obtener las iniciales del nombre
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function Testimonios() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const scrollNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonios.length);
    setTimeout(() => setIsAutoPlaying(true), 5000); // Reanuda después de 5 segundos
  };

  const scrollPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonios.length) % testimonios.length
    );
    setTimeout(() => setIsAutoPlaying(true), 5000); // Reanuda después de 5 segundos
  };

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonios.length);
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Pausar auto-play al hacer hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white relative overflow-hidden">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-3 font-title">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto font-montserrat">
            Testimonios reales de clientes satisfechos
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-orange-500/80 border border-neutral-200 hover:border-orange-500 text-neutral-700 hover:text-white items-center justify-center transition-all duration-200 shadow-md"
            aria-label="Previous testimonial"
          >
            <span className="text-xl">❮</span>
          </button>

          <button
            onClick={scrollNext}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-orange-500/80 border border-neutral-200 hover:border-orange-500 text-neutral-700 hover:text-white items-center justify-center transition-all duration-200 shadow-md"
            aria-label="Next testimonial"
          >
            <span className="text-xl">❯</span>
          </button>

          {/* Carousel - Solo muestra una card centrada */}
          <div className="overflow-hidden px-4 sm:px-0">
            <div className="flex justify-center min-h-[280px] sm:min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="w-full max-w-sm border border-gray-300 rounded-lg shadow-lg bg-white p-4 sm:p-6 space-y-3 sm:space-y-4"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-orange-500 text-white text-base sm:text-lg font-semibold rounded-full font-montserrat flex-shrink-0">
                      {getInitials(testimonios[currentIndex].nombre)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-gray-900 font-medium font-montserrat text-sm sm:text-base truncate">
                        {testimonios[currentIndex].nombre}
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm font-montserrat">
                        {testimonios[currentIndex].cargo}
                      </div>
                    </div>
                  </div>
                  <div className="flex text-orange-500 text-lg sm:text-xl">
                    ★★★★★
                  </div>
                  <p className="text-gray-700 font-montserrat text-sm sm:text-base leading-relaxed">
                    {testimonios[currentIndex].texto}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Markers */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonios.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  scrollToIndex(index);
                  setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`h-4 w-4 rounded-full border transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-orange-500 border-orange-500 outline outline-2 outline-offset-2 outline-orange-500/30 scale-110'
                    : 'bg-transparent border-orange-500 hover:bg-orange-500/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        ul::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
