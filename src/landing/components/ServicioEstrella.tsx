import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const servicios = [
  {
    id: 1,
    title: 'Alineación de Chasis',
    description: 'Tecnología hidráulica de precisión',
    fullDescription:
      'Servicio profesional de alineación de chasis utilizando tecnología hidráulica de última generación para recuperar la geometría original de tu moto.',
    image: '/Tecnologia-hidraulica-de-presicion.jpg',
    features: [
      'Alinear ejes delantero y trasero',
      'Corregir desviaciones del chasis',
      'Recuperar la geometría original de fábrica',
      'Mejorar estabilidad y seguridad',
      'Equipos de precisión milimétrica',
    ],
  },
  {
    id: 2,
    title: 'Electromecánica',
    description: 'Diagnóstico y reparación profesional',
    fullDescription:
      'Diagnóstico completo y reparación del sistema eléctrico y mecánico interconectados de tu motocicleta.',
    image: '/Electro.jpg',
    features: [
      'Diagnóstico completo del sistema',
      'Inspección y desmontaje profesional',
      'Limpieza y evaluación',
      'Medición y análisis detallado',
      'Reparación o reemplazo de componentes',
      'Ajuste y montaje final',
    ],
  },
  {
    id: 3,
    title: 'Escaneado Eléctrico',
    description: 'Diagnóstico completo del sistema',
    fullDescription:
      'Diagnóstico completo del sistema eléctrico de tu moto utilizando equipos de escaneo profesional.',
    image: '/Imagen-de-herramientas-de-taller.jpg',
    features: [
      'Diagnóstico con equipos profesionales',
      'Revisión completa del sistema',
      'Localización precisa de daños',
      'Reparación especializada',
      'Pruebas y ajustes finales',
      'Entrega con garantía',
    ],
  },
  {
    id: 4,
    title: 'Overhaul',
    description: 'Desmontaje completo y reconstrucción',
    fullDescription:
      'Desmontaje completo y reconstrucción profesional de tu motocicleta con los más altos estándares de calidad.',
    image: '/Imagen-del-taller.jpg',
    features: [
      'Desmontaje completo del motor',
      'Limpieza profunda y análisis',
      'Rectificación y reparación',
      'Reemplazo de piezas necesarias',
      'Reensamblaje profesional',
      'Pruebas finales exhaustivas',
      'Entrega con garantía extendida',
    ],
  },
  {
    id: 5,
    title: 'Tecnología Hidráulica',
    description: 'Equipos profesionales de precisión',
    fullDescription:
      'Equipos profesionales de última generación para alineación perfecta con tecnología hidráulica.',
    image: '/Otra-imagen.jpg',
    features: [
      'Equipos de última generación',
      'Precisión milimétrica garantizada',
      'Tecnología hidráulica profesional',
      'Certificación internacional',
    ],
  },
];

export function ServicioEstrella() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % servicios.length);
    setExpandedIndex(null);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + servicios.length) % servicios.length);
    setExpandedIndex(null);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setExpandedIndex(null);
  };

  const toggleExpand = () => {
    if (expandedIndex === currentIndex) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(currentIndex);
    }
  };

  const currentService = servicios[currentIndex];
  const isExpanded = expandedIndex === currentIndex;

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-orange-600 mb-3 font-montserrat">
            SERVICIOS
          </p>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 mb-4 sm:mb-5 leading-[1.08] font-title">
            SERVICIOS DESTACADOS
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-montserrat">
            Servicios profesionales para tu moto con tecnología de última
            generación
          </p>
        </motion.div>

        {/* Carrusel */}
        <div className="relative max-w-sm sm:max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="service-card"
                style={{
                  height: isExpanded ? 'auto' : '380px',
                  minHeight: '380px',
                }}
              >
                <div className="service-card-imgBox">
                  <img
                    src={currentService.image}
                    alt={currentService.title}
                    className="service-card-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/Moto Hero.png') {
                        target.src = '/Moto Hero.png';
                      }
                    }}
                  />
                </div>

                <div className="service-card-contentBox">
                  <h3 className="service-card-title">{currentService.title}</h3>
                  <p className="service-card-description">
                    {currentService.description}
                  </p>
                  <button onClick={toggleExpand} className="service-card-buy">
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                </div>

                {/* Información expandida */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="service-card-expanded"
                    >
                      <div className="p-6 pt-0">
                        <p className="text-neutral-300 mb-6 font-montserrat text-sm leading-relaxed">
                          {currentService.fullDescription}
                        </p>

                        <div className="space-y-3">
                          <h4 className="text-base font-bold text-white font-title">
                            Características:
                          </h4>
                          <ul className="space-y-2">
                            {currentService.features.map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-3 text-neutral-200 text-sm font-montserrat"
                              >
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Botones de navegación */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              aria-label="Anterior"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              aria-label="Siguiente"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center gap-2 mt-6">
            {servicios.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-orange-500'
                    : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .service-card {
          position: relative;
          width: 100%;
          background: #191919;
          border-radius: 20px;
          overflow: hidden;
          transition: height 0.3s ease;
        }

        .service-card::before {
          content: "";
          position: absolute;
          top: -50%;
          width: 100%;
          height: 100%;
          background: #ff8c00;
          transform: skewY(345deg);
          transition: 0.5s;
        }

        .service-card:hover::before {
          top: -70%;
          transform: skewY(390deg);
        }

        .service-card::after {
          content: "MTS";
          position: absolute;
          bottom: 0;
          left: 0;
          font-weight: 600;
          font-size: 6em;
          color: rgba(0, 0, 0, 0.1);
          z-index: 1;
        }

        .service-card-imgBox {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-top: 20px;
          z-index: 2;
        }

        .service-card-image {
          height: 220px;
          width: auto;
          object-fit: contain;
          transition: 0.5s;
        }

        .service-card:hover .service-card-image {
          transform: scale(1.05);
        }

        .service-card-contentBox {
          position: relative;
          padding: 15px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          z-index: 2;
        }

        .service-card-title {
          font-size: 18px;
          color: white;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          text-align: center;
        }

        .service-card-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
          margin-bottom: 15px;
        }

        .service-card-buy {
          position: relative;
          top: 0;
          opacity: 1;
          padding: 10px 30px;
          margin-top: 15px;
          color: #000000;
          text-decoration: none;
          background: #ff8c00;
          border-radius: 30px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: 0.5s;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .service-card-buy:hover {
          background: #ff9500;
          transform: scale(1.05);
        }

        .service-card-expanded {
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .service-card {
            min-height: 320px;
            height: 320px !important;
          }
          
          .service-card-image {
            height: 160px;
          }

          .service-card-contentBox {
            padding: 12px 15px;
          }

          .service-card-title {
            font-size: 16px;
          }

          .service-card-description {
            font-size: 12px;
          }

          .service-card-buy {
            padding: 8px 20px;
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
}
