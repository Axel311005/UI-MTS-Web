import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

const servicios = [
  {
    id: 1,
    title: "Alineación de Chasis",
    description:
      "Tecnología hidráulica de precisión para recuperar la geometría original",
    image: "/Tecnologia-hidraulica-de-presicion.jpg",
    features: [
      "Alinear ejes delantero y trasero",
      "Corregir desviaciones del chasis",
      "Recuperar la geometría original de fábrica",
      "Mejorar estabilidad y seguridad",
    ],
  },
  {
    id: 2,
    title: "Electromecánica",
    description:
      "Diagnóstico y reparación del sistema eléctrico y mecánico interconectados",
    image: "/Electro.jpg",
    features: [
      "Diagnóstico de reparación del sistema eléctrico y mecánico interconectados",
      "Inspección y desmontaje de la moto",
      "Limpieza",
      "Medición y evaluación",
      "Reparación o remplazo",
      "Ajuste y montaje",
    ],
  },
  {
    id: 3,
    title: "Escaneado y Reparación Eléctrica",
    description: "Diagnóstico completo del sistema eléctrico de tu moto",
    image: "/Imagen-de-herramientas-de-taller.jpg",
    features: [
      "Diagnóstico",
      "Revisión de la moto por dentro",
      "Localización de daños y reparación",
      "Pruebas y ajustes de la moto",
      "Entrega",
    ],
  },
  {
    id: 4,
    title: "Overhaul",
    description: "Desmontaje completo y reconstrucción profesional",
    image: "/Imagen-del-taller.jpg",
    features: [
      "Desmontaje completo",
      "Limpieza y análisis",
      "Rectificación y reparación",
      "Remplazo de piezas (costo del cliente)",
      "Reensamblaje",
      "Pruebas finales",
      "Entrega de la moto",
    ],
  },
  {
    id: 5,
    title: "Tecnología Hidráulica",
    description: "Equipos profesionales para alineación perfecta",
    image: "/Otra-imagen.jpg",
    features: [
      "Equipos de última generación",
      "Precisión milimétrica",
      "Tecnología hidráulica profesional",
    ],
  },
  {
    id: 6,
    title: "Personal Capacitado",
    description: "Técnicos especializados en chasis de motos",
    image: "/personal-capacitado.png",
    features: [
      "Técnicos certificados",
      "Años de experiencia",
      "Especialización en motos",
    ],
  },
];

// Cache global de imágenes para evitar múltiples requests
const imageCache = new Map<string, HTMLImageElement>();
const preloadedImages = new Set<string>();

export function ServicioEstrella() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(
    null
  );
  const imgRefs = useRef<Map<string, HTMLImageElement>>(new Map());

  // Pre-cargar todas las imágenes una sola vez y cachearlas
  useEffect(() => {
    const preloadImage = (src: string) => {
      if (preloadedImages.has(src)) return;

      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.set(src, img);
        preloadedImages.add(src);
      };
      img.onerror = () => {
        // Si falla, pre-cargar fallback
        if (
          src !== "/Moto Hero.png" &&
          !preloadedImages.has("/Moto Hero.png")
        ) {
          const fallbackImg = new Image();
          fallbackImg.src = "/Moto Hero.png";
          imageCache.set("/Moto Hero.png", fallbackImg);
          preloadedImages.add("/Moto Hero.png");
        }
      };
    };

    // Pre-cargar todas las imágenes de servicios
    servicios.forEach((servicio) => {
      preloadImage(servicio.image);
    });

    // Pre-cargar fallback
    if (!preloadedImages.has("/Moto Hero.png")) {
      preloadImage("/Moto Hero.png");
    }
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % servicios.length);
    setExpandedServiceId(null);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + servicios.length) % servicios.length);
    setExpandedServiceId(null);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setExpandedServiceId(null);
  };

  const currentServicio = servicios[currentIndex];
  const isExpanded = expandedServiceId === currentServicio.id;

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-12 bg-gradient-to-b from-black via-neutral-950 to-black relative overflow-hidden">
      {/* Background pattern sutil */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(255, 165, 0, 0.1) 20px,
            rgba(255, 165, 0, 0.1) 40px
          )`,
          }}
        ></div>
      </div>

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)] relative z-10">
        {/* Header compacto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-6 md:mb-8"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white mb-1 sm:mb-2 font-montserrat tracking-tight">
            SERVICIOS DESTACADOS
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-white/70 max-w-2xl mx-auto font-montserrat leading-relaxed px-2">
            Servicios profesionales para tu moto
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
          {/* Navigation Arrows más compactas */}
          <button
            onClick={prevSlide}
            className="absolute left-1 sm:left-2 md:-left-6 lg:-left-8 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 md:p-3 bg-white/95 backdrop-blur-sm border-2 border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10 rounded-full shadow-lg transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-black group-hover:text-orange-500 transition-colors" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-1 sm:right-2 md:-right-6 lg:-right-8 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 md:p-3 bg-white/95 backdrop-blur-sm border-2 border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10 rounded-full shadow-lg transition-all duration-300 group"
            aria-label="Next slide"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-black group-hover:text-orange-500 transition-colors" />
          </button>

          {/* Card Container - Una sola card centrada */}
          <div className="overflow-hidden px-1 sm:px-2 md:px-4">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <motion.div
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                whileHover={{
                  y: -4,
                  scale: 1.01,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="relative h-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-2 border-white/30 hover:border-orange-500/60 transition-all duration-500 group flex flex-col overflow-hidden rounded-lg sm:rounded-xl shadow-[0_0_30px_rgba(255,115,0,0.08)] hover:shadow-[0_0_50px_rgba(255,115,0,0.25)]">
                  {/* Image Section más compacta */}
                  <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] overflow-hidden bg-neutral-800">
                    <img
                      ref={(el) => {
                        if (el) {
                          imgRefs.current.set(currentServicio.image, el);
                          // Si la imagen ya está en cache, forzar uso del cache
                          if (imageCache.has(currentServicio.image)) {
                            el.src = currentServicio.image;
                          }
                        }
                      }}
                      src={currentServicio.image}
                      alt={`${currentServicio.title} - ${currentServicio.description}`}
                      className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== "/Moto Hero.png") {
                          target.src = "/Moto Hero.png";
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-orange-500/10 to-orange-500/5 mix-blend-overlay"></div>

                    {/* Badge compacto */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                      <div className="px-2 py-0.5 sm:py-1 bg-orange-500/90 backdrop-blur-sm rounded-full border border-orange-400/50 shadow-md">
                        <span className="text-[9px] sm:text-[10px] font-bold text-white font-montserrat uppercase tracking-wide">
                          Premium
                        </span>
                      </div>
                    </div>

                    {/* Add Button compacto */}
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-10">
                      <motion.button
                        className="w-8 h-8 sm:w-10 sm:h-10 backdrop-blur-md bg-white/20 hover:bg-orange-500/40 border-2 border-white/30 hover:border-orange-400 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Ver detalles"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpandedServiceId((prev) =>
                            prev === currentServicio.id
                              ? null
                              : currentServicio.id
                          )
                        }
                      >
                        {isExpanded ? (
                          <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
                        ) : (
                          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Content Section compacta */}
                  <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col flex-1 text-white bg-transparent">
                    <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight mb-1.5 sm:mb-2 font-montserrat group-hover:text-orange-400 transition-colors duration-300">
                      {currentServicio.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 leading-snug font-montserrat line-clamp-2">
                      {currentServicio.description}
                    </p>

                    {/* Features List compacta */}
                    <ul className="space-y-1.5 sm:space-y-2 flex-1">
                      {(isExpanded
                        ? currentServicio.features
                        : currentServicio.features.slice(0, 2)
                      ).map((feature, idx) => (
                        <li
                          key={`${currentServicio.id}-feature-${idx}`}
                          className="flex items-start gap-2 text-xs sm:text-sm text-white/80 font-montserrat group-hover:text-white/90 transition-colors"
                        >
                          <div className="mt-1 flex-shrink-0">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-orange-500 group-hover:bg-orange-400 transition-colors"></div>
                          </div>
                          <span className="break-words leading-snug">
                            {feature}
                          </span>
                        </li>
                      ))}
                      {!isExpanded && currentServicio.features.length > 2 && (
                        <li className="text-[10px] sm:text-xs text-white/60 italic font-montserrat pl-3 sm:pl-4 group-hover:text-white/70 transition-colors">
                          +{currentServicio.features.length - 2} más...
                        </li>
                      )}
                    </ul>

                    {/* Footer compacto */}
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10 group-hover:border-orange-500/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] sm:text-[10px] text-white/50 font-montserrat uppercase tracking-wider">
                          Profesional
                        </span>
                        <div className="flex gap-0.5">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full bg-orange-500/60 group-hover:bg-orange-400 transition-colors"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Pagination Dots compactos */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
            {servicios.map((_, index) => {
              const isActive = currentIndex === index;

              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 sm:w-8 bg-orange-500 shadow-[0_0_8px_rgba(255,165,0,0.4)]"
                      : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/60 hover:w-2.5 sm:hover:w-3"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
