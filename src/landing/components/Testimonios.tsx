import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Star, Quote } from 'lucide-react';

const testimonios = [
  {
    nombre: 'Carlos M.',
    texto: 'Excelente atención, mi moto quedó como nueva.',
    rating: 5,
  },
  {
    nombre: 'Luis G.',
    texto: 'Servicio rápido y profesional.',
    rating: 5,
  },
  {
    nombre: 'María R.',
    texto: 'Muy satisfecha con el trabajo realizado. Recomendado 100%.',
    rating: 5,
  },
];

export function Testimonios() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-slate-600">
            Testimonios reales de clientes satisfechos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonios.map((testimonio, index) => (
            <motion.div
              key={testimonio.nombre}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <Card className="h-full bg-white/95 backdrop-blur-sm border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full shadow">
                      <Quote className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-slate-700 italic text-center">
                    "{testimonio.texto}"
                  </p>
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: testimonio.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-center font-semibold text-slate-800">
                    — {testimonio.nombre}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
