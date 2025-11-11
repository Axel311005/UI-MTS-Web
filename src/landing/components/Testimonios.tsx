import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonios = [
  {
    nombre: "Carlos M.",
    texto: "Excelente atención, mi moto quedó como nueva.",
    rating: 5,
  },
  {
    nombre: "Luis G.",
    texto: "Servicio rápido y profesional.",
    rating: 5,
  },
  {
    nombre: "María R.",
    texto: "Muy satisfecha con el trabajo realizado. Recomendado 100%.",
    rating: 5,
  },
  {
    nombre: "Juan P.",
    texto: "El mejor taller de motos que he conocido. Muy profesionales.",
    rating: 5,
  },
  {
    nombre: "Ana S.",
    texto: "Servicio de calidad y atención personalizada. Excelente trabajo.",
    rating: 5,
  },
];

export function Testimonios() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonios.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonios.length) % testimonios.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTestimonio = testimonios[currentIndex];

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-12 bg-white relative overflow-hidden">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)] relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-6 md:mb-8"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-black mb-1 sm:mb-2 font-montserrat tracking-tight">
            LO QUE DICEN NUESTROS CLIENTES
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-black/70 max-w-2xl mx-auto font-montserrat leading-relaxed px-2">
            Testimonios reales de clientes satisfechos
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
          {/* Navigation Arrows */}
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
                <Card className="relative h-full bg-white border-2 border-orange-500/20 hover:border-orange-500/60 transition-all duration-500 group flex flex-col overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl">
                  <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col flex-1 text-black">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-orange-500/10 rounded-full border-2 border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                        <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                      </div>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-sm sm:text-base md:text-lg text-black/80 italic text-center font-montserrat mb-4 sm:mb-5 leading-relaxed min-h-[60px] sm:min-h-[80px] flex items-center justify-center">
                      "{currentTestimonio.texto}"
                    </p>

                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-3 sm:mb-4">
                      {Array.from({ length: currentTestimonio.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 sm:h-5 sm:w-5 fill-orange-500 text-orange-500"
                          />
                        )
                      )}
                    </div>

                    {/* Author Name */}
                    <p className="text-center font-semibold text-black font-montserrat text-sm sm:text-base">
                      — {currentTestimonio.nombre}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
            {testimonios.map((_, index) => {
              const isActive = currentIndex === index;

              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 sm:w-8 bg-orange-500 shadow-[0_0_8px_rgba(255,165,0,0.4)]"
                      : "w-1.5 sm:w-2 bg-orange-500/40 hover:bg-orange-500/60 hover:w-2.5 sm:hover:w-3"
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
