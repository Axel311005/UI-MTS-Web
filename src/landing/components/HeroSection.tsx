import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { HeroBackground } from './HeroBackground';
import { DazzleButton } from './DazzleButton';

const heroContent = {
  title: 'ALINEACIÓN DE CHASIS',
  subtitle: 'Servicio Profesional de Alineación',
  description:
    'Especialistas en alineación de chasis y mantenimiento profesional para tu moto',
  price: 'Servicio Premium',
  priceSubtext: 'Consulta nuestros servicios y seguimiento en tiempo real',
  image: '/Moto Hero.png',
};

export function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const shouldAnimate = !prefersReducedMotion;

  const handleCita = () => {
    navigate('/cita');
  };

  const handleCotizacion = () => {
    navigate('/cotizacion');
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      data-hero-section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <HeroBackground shouldAnimate={shouldAnimate} />

      {/* Content */}
      <div className="relative z-30 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="mx-auto grid w-full max-w-[min(100vw,1760px)] grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 items-center min-h-screen py-20 md:py-32">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 1.0,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.1,
            }}
            className="text-white
             max-w-xl lg:max-w-2xl z-10"
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.p
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-sm uppercase tracking-wider text-orange-600 mb-4 font-montserrat font-semibold"
              style={{ willChange: 'transform, opacity' }}
            >
              {heroContent.title}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.35,
                duration: 0.85,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-[1.05] tracking-tight font-title text-white"
              style={{ willChange: 'transform, opacity' }}
            >
              {heroContent.subtitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white mb-6 md:mb-8 font-montserrat leading-relaxed"
              style={{ willChange: 'transform, opacity' }}
            >
              {heroContent.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.65,
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="mb-6 md:mb-8"
              style={{ willChange: 'transform, opacity' }}
            >
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-2 font-title">
                {heroContent.price}
              </p>
              {heroContent.priceSubtext && (
                <p className="text-xs sm:text-sm md:text-base text-white font-montserrat">
                  {heroContent.priceSubtext}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.8,
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto"
              style={{ willChange: 'transform, opacity' }}
            >
              <DazzleButton
                onClick={handleCita}
                className="w-full sm:w-auto text-center 
               bg-black text-orange-600 
               md:bg-transparent md:text-white"
              >
                Agenda tu revisión
              </DazzleButton>

              <DazzleButton
                onClick={handleCotizacion}
                className="w-full sm:w-auto text-center 
               bg-black text-orange-600 
               md:bg-transparent md:text-white"
              >
                Cotiza en línea
              </DazzleButton>
            </motion.div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 1.0,
              delay: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative flex justify-center z-10"
            style={{ willChange: 'transform, opacity' }}
          >
            <motion.div
              animate={
                shouldAnimate
                  ? {
                      y: [0, -20, -10, -20, 0],
                      rotate: [0, 2, -2, 2, 0],
                      scale: [1, 1.02, 1, 1.02, 1],
                    }
                  : {}
              }
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative z-10"
              style={{
                filter:
                  'drop-shadow(0 20px 40px rgba(0,0,0,0.15)) drop-shadow(0 0 30px rgba(255,165,0,0.2))',
              }}
            >
              <img
                src={heroContent.image}
                alt={`${heroContent.subtitle} - ${heroContent.description}`}
                className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl"
                loading="eager"
                fetchPriority="high"
              />
            </motion.div>

            {/* Decorative orange shape behind image */}
            <motion.div
              className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl -z-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
