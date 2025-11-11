import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import {
  Calendar,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";

const heroSlides = [
  {
    id: 1,
    title: "ALINEACION DE CHASIS",
    subtitle: "Servicio Profesional de Alineación",
    description:
      "Especialistas en alineación de chasis y mantenimiento profesional para tu moto",
    price: "Servicio Premium",
    priceSubtext: "Consulta nuestros servicios y seguimiento en tiempo real",
    image: "/Moto Hero.png",
  },
  {
    id: 2,
    title: "TECNOLOGÍA HIDRÁULICA",
    subtitle: "Alineación de Precisión",
    description:
      "Equipos profesionales para recuperar la geometría original de tu moto",
    price: "Servicio Garantizado",
    priceSubtext: "Tecnología de última generación para tu moto",
    image: "/fotografia-del-taller.png",
  },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleCita = () => {
    navigate("/cita");
  };

  const handleCotizacion = () => {
    navigate("/cotizacion");
  };

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Arrows removed; navigation via dots and auto-rotate only

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentHero = heroSlides[currentSlide];

  // Preload images solo cuando el componente está visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heroSlides.forEach((slide) => {
              const img = new Image();
              img.src = slide.image;
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.querySelector("[data-hero-section]");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      data-hero-section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Carousel Container */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${currentHero.image})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
            </div>

            {/* Orange accent shapes */}
            <motion.div
              className="absolute top-20 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 left-20 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
  <div className="relative z-30 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="mx-auto grid w-full max-w-[min(100vw,1760px)] grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 items-center min-h-screen py-20 md:py-32">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-xl lg:max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm uppercase tracking-wider text-orange-500 mb-4 font-montserrat font-semibold"
            >
              {currentHero.title}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight font-azonix"
            >
              {currentHero.subtitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-6 md:mb-8 font-montserrat"
            >
              {currentHero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 md:mb-8"
            >
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500 mb-2 font-azonix">
                {currentHero.price}
              </p>
              {currentHero.priceSubtext && (
                <p className="text-xs sm:text-sm md:text-base text-white/70 font-montserrat">
                  {currentHero.priceSubtext}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
            >
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-orange-500/50 transition-all duration-300 group font-montserrat font-semibold"
                onClick={handleCita}
              >
                <span className="flex items-center">
                  <Calendar className="mr-3 h-6 w-6" />
                  Agenda tu revisión
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-orange-500/80 text-white bg-black/40 hover:bg-orange-500/20 hover:border-orange-500 text-lg px-8 py-6 rounded-lg backdrop-blur-md transition-all duration-300 group font-montserrat font-semibold shadow-lg hover:shadow-orange-500/40"
                onClick={handleCotizacion}
              >
                <DollarSign className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Cotiza en línea
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10"
            >
              <img
                src={currentHero.image}
                alt={`${currentHero.subtitle} - ${currentHero.description}`}
                className="w-full h-auto max-w-2xl lg:max-w-3xl xl:max-w-4xl drop-shadow-2xl"
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
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows removed on mobile and desktop to avoid accidental taps near CTAs */}

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-orange-500"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-12 border-2 border-white/40 rounded-full flex justify-center backdrop-blur-sm bg-white/10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <motion.div
            className="w-2 h-3 bg-white/70 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
